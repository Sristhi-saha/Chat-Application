import Message from "../models/message.model.js";

export const initSocket = (io) => {

    let onlineUsers = {};

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        // REGISTER USER(like receive when socket.on)
        socket.on("register", (userId) => {
            onlineUsers[userId] = socket.id;
            socket.join(userId);

            console.log("Registered:", userId);

            //send to the user io.emit means you are sending
            io.emit("user_status", {
                userId,
                status: "online"
            });
        });

        // means you are means receiving
        socket.on("private_message", async ({ toUserId, message, fromUserID }) => {

            console.log("MESSAGE:", { toUserId, message, fromUserID });

            if (!toUserId || !message || !fromUserID) {
                console.log("Invalid payload");
                return;
            }

            const msgData = {
                sender: fromUserID,
                content: message,
                time: new Date().toISOString()
            };

            try {
                // ✅ Send to receiver
                if (onlineUsers[toUserId]) {
                    io.to(toUserId).emit("receive_message", msgData);
                }

                // ✅ Send back to sender
                socket.emit("receive_message", msgData);

                // ✅ Save in DB
                await Message.create({
                    sender: fromUserID,
                    receiver: toUserId,
                    content: message,
                    fileUrl: ""
                });

            } catch (err) {
                console.error("DB ERROR:", err);
            }
        });

        // ✅ DISCONNECT
        socket.on("disconnect", () => {
            let userId = null;

            for (let id in onlineUsers) {
                if (onlineUsers[id] === socket.id) {
                    userId = id;
                    delete onlineUsers[id];
                    break;
                }
            }

            if (userId) {
                io.emit("user_status", {
                    userId,
                    status: "offline",
                    lastSeen: new Date()
                });
            }

            console.log("User disconnected:", socket.id);
        });
    });
};