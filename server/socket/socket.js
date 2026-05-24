import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const initSocket = (io) => {

    let onlineUsers = {};

    User.updateMany({}, { isOnline: false, lastSeen: new Date() })
        .then(() => console.log("All users set offline on server start"))
        .catch(err => console.error("Error resetting online status:", err));

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        // REGISTER USER(like receive when socket.on)
        socket.on("register", async (userId) => {
            onlineUsers[userId] = socket.id;
            socket.join(userId);

            console.log("Registered:", userId);

            // ✅ Set online in DB
            await User.findByIdAndUpdate(userId, {
                isOnline: true
            });

            io.emit("user_status", {
                userId,
                status: "online"
            });
        });

        // means you are means receiving
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
                // ✅ Send to receiver
                if (onlineUsers[toUserId]) {
                    io.to(toUserId).emit("receive_message", msgData);
                }

                // // ✅ Send back to sender
                // socket.emit("receive_message", msgData);

                // // ✅ Save in DB
                // await Message.create({
                //     sender: fromUserId,
                //     receiver: toUserId,
                //     content: message,
                //     fileUrl: ""
                // });

            } catch (err) {
                console.error("DB ERROR:", err);
            }
        });

        // ✅ DISCONNECT
        socket.on("disconnect", async () => {
            console.log("DISCONNECT FIRED:", socket.id); // ← check if this fires

            let userId = null;

            for (let id in onlineUsers) {
                if (onlineUsers[id] === socket.id) {
                    userId = id;
                    delete onlineUsers[id];
                    break;
                }
            }

            console.log("DISCONNECTED userId:", userId); // ← check if userId is found

            if (userId) {
                await User.findByIdAndUpdate(userId, {
                    isOnline: false,
                    lastSeen: new Date()
                });

                console.log("DB UPDATED for:", userId); // ← check if DB updated

                io.emit("user_status", {
                    userId,
                    status: "offline",
                    lastSeen: new Date()
                });

                console.log("EMITTED user_status offline for:", userId); // ← check if emitted
            }
        });
    });
};