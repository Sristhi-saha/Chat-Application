import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Group from "../models/group.model.js"


export const initSocket = (io) => {

    let onlineUsers = {};

    User.updateMany({}, { isOnline: false, lastSeen: new Date() })
        .then(() => console.log("All users set offline on server start"))
        .catch(err => console.error("Error resetting online status:", err));

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        // ─────────────────────────────────────────────
        // REGISTER
        // ─────────────────────────────────────────────
        socket.on("register", async (userId) => {
            // Kick out any stale socket already registered for this user
            const oldSocketId = onlineUsers[userId];
            if (oldSocketId && oldSocketId !== socket.id) {
                const oldSocket = io.sockets.sockets.get(oldSocketId);
                if (oldSocket) {
                    oldSocket.leave(userId);
                    oldSocket.disconnect(true);
                    console.log(`Kicked stale socket ${oldSocketId} for user ${userId}`);
                }
            }

            onlineUsers[userId] = socket.id;
            socket.join(userId);
            console.log("Registered:", userId);

            await User.findByIdAndUpdate(userId, { isOnline: true });

            io.emit("user_status", { userId, status: "online" });

            // Auto-rejoin all groups on reconnect
            const userGroups = await Group.find({ members: userId });
            userGroups.forEach(group => {
                socket.join(group._id.toString());
                console.log(`User ${userId} rejoined group: ${group._id}`);
            });
        });

        // ─────────────────────────────────────────────
        // PRIVATE MESSAGE
        // ─────────────────────────────────────────────
        socket.on("private_message", async ({ toUserId, message, fromUserId }) => {
            console.log("MESSAGE:", { toUserId, message, fromUserId });

            if (!toUserId || !message || !fromUserId) {
                console.log("Invalid payload");
                return;
            }

            const msgData = {
                sender: fromUserId,
                content: message,
                time: new Date().toISOString()
            };

            try {
                if (onlineUsers[toUserId]) {
                    io.to(toUserId).emit("receive_message", msgData);
                }
                // echo to sender
                socket.emit("receive_message", msgData);
                console.log("GOT A MESSAGE:", msgData);

                await Message.create({
                    sender: fromUserId,
                    receiver: toUserId,
                    content: message,
                    fileUrl: ""
                });

            } catch (err) {
                console.error("DB ERROR:", err);
            }
        });

        // ─────────────────────────────────────────────
        // CREATE GROUP
        // ─────────────────────────────────────────────
        socket.on("create_group", async ({ name, memberIds, createdBy }) => {
            try {
                const group = await Group.create({
                    name,
                    members: memberIds,
                    createdBy,
                    createdAt: new Date()
                });

                const roomId = group._id.toString();

                // Join creator's socket to the room
                socket.join(roomId);

                // ✅ FIXED — look up socketId from onlineUsers first
                memberIds.forEach(memberId => {
                    const memberSocketId = onlineUsers[memberId];              // userId → socketId
                    const memberSocket = io.sockets.sockets.get(memberSocketId); // socketId → socket object
                    if (memberSocket) memberSocket.join(roomId);               // join room
                });

                io.to(roomId).emit("group_created", {
                    groupId: roomId,
                    name,
                    members: memberIds,
                    createdBy
                });

                console.log(`Group created: ${roomId} by ${createdBy}`);

            } catch (err) {
                console.log('group created error', err);
                socket.emit("error", { message: 'failed to create group' });
            }
        });

        // ─────────────────────────────────────────────
        // JOIN GROUP
        // ─────────────────────────────────────────────
        socket.on("join_group", async ({ groupId, userId }) => {
            try {
                await Group.findByIdAndUpdate(groupId, {
                    $addToSet: { members: userId }
                });

                socket.join(groupId);

                socket.to(groupId).emit("member_joined", {
                    groupId,
                    userId,
                    joinedAt: new Date()
                });

                const history = await Message.find({ groupId })
                    .sort({ createdAt: 1 })
                    .limit(50);

                socket.emit("group_history", { groupId, messages: history });

                console.log(`User ${userId} joined group ${groupId}`);

            } catch (err) {
                console.log("join group error", err);
                socket.emit("error", { message: 'failed to join group' });
            }
        });

        // ─────────────────────────────────────────────
        // SEND GROUP MESSAGE
        // ─────────────────────────────────────────────
        socket.on("send_group_message", async ({ groupId, message, fromUserId }) => {
            if (!groupId || !message || !fromUserId) {
                console.log("invalid group payload");
                return;
            }

            // Debug: check how many sockets are in this room
            const roomSockets = await io.in(groupId).fetchSockets();
            console.log(`Room ${groupId} has ${roomSockets.length} sockets`);

            const msgData = {
                groupId,
                sender: fromUserId,
                content: message,
                time: new Date().toISOString()
            };

            try {
                // Delivers to ALL members including sender
                io.to(groupId).emit("receive_group_message", msgData);

                await Message.create({
                    sender: fromUserId,
                    groupId,
                    content: message,
                    fileUrl: ''
                });

                console.log("Group message sent to room:", groupId);

            } catch (err) {
                console.log('group message error', err);
                socket.emit("error", { message: 'failed to send group message' });
            }
        });

        // ─────────────────────────────────────────────
        // LEAVE GROUP
        // ─────────────────────────────────────────────
        socket.on("leave_group", async ({ groupId, userId }) => {
            try {
                await Group.findByIdAndUpdate(groupId, {
                    $pull: { members: userId }
                });

                socket.leave(groupId);

                socket.to(groupId).emit("member_left", {
                    groupId,
                    userId,
                    leftAt: new Date()
                });

                console.log(`User ${userId} left the group ${groupId}`);

            } catch (err) {
                console.log('leave group error', err);
            }
        });

        // ─────────────────────────────────────────────
        // DISCONNECT
        // ─────────────────────────────────────────────
        socket.on("disconnect", async () => {
            console.log("DISCONNECT FIRED:", socket.id);

            let userId = null;

            for (let id in onlineUsers) {
                if (onlineUsers[id] === socket.id) {
                    userId = id;
                    delete onlineUsers[id];
                    break;
                }
            }

            console.log("DISCONNECTED userId:", userId);

            if (userId) {
                await User.findByIdAndUpdate(userId, {
                    isOnline: false,
                    lastSeen: new Date()
                });

                console.log("DB UPDATED for:", userId);

                io.emit("user_status", {
                    userId,
                    status: "offline",
                    lastSeen: new Date()
                });

                console.log("EMITTED user_status offline for:", userId);
            }
        });
    });
};