import express from "express";
import dotenv from "dotenv";
import connectToDB from "./connect.js";
import authRouter from "./routes/auth.route.js";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";
import {initSocket} from './socket/socket.js'
import cookieParser from "cookie-parser";
import userRouter from "./routes/users.route.js";
import messageRouter from "./routes/message.route.js";
import router from "./routes/group.route.js";
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin:'http://localhost:5173',
    credentials:true,
    methods:['GET','POST','PUT','DELETE']
}))
connectToDB();
const server = createServer(app);
const io = new Server(server,{
    cors:{origin:'http://localhost:5173'}
});
initSocket(io);
app.use('/api/auth',authRouter);
app.use('/api/user',userRouter);
app.use('/api/message',messageRouter);
app.use('/api/group',router)


server.listen(port, () => {
    console.log('server is running on port', `http://localhost:${port}`)
});


export default app;