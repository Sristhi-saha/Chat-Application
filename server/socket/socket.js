import Message from "../models/message.model.js";

export const initSocket = (io) => {

    let onlineUsers = {};
    let lastSeen = {};

    io.on("connection", (socket) => {

        console.log("user connected", socket.id);

        // REGISTER USER
        socket.on("register", (userId) => {
            onlineUsers[userId] = socket.id;
            socket.join(userId);

            io.emit("user_status", {
                userId,
                status: "online"
            });
        });

        // GROUP MESSAGE
        socket.on("send_message", (data) => {
            io.to(data.room).emit("receive_message", data);
        });

        // PRIVATE MESSAGE
        socket.on("private_message", async ({ toUserId, message, fromUserID }) => {

            if (onlineUsers[toUserId]) {
                io.to(toUserId).emit("receive_private_message", {
                    fromUserID,
                    message,
                    time: new Date().toISOString()
                });
            } else {
                await Message.create({
                    fromUserID,
                    toUserId,
                    message,
                    time: new Date().toISOString()
                });
            }
        });

        // DISCONNECT
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
                lastSeen[userId] = new Date();

                io.emit("user_status", {
                    userId,
                    status: "offline",
                    lastSeen: lastSeen[userId]
                });
            }
        });
    });
};