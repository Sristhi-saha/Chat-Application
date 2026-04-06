import express from "express";
import dotenv from "dotenv";
import connectToDB from "./connect.js";
import authRouter from "./routes/auth.route.js";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
    origin:'http://localhost:5173',
    credentials:true,
    methods:['GET','POST','PUT','DELETE']
}))
connectToDB();
const server = createServer(app);
const io = new Server(server);
app.use('/api/auth',authRouter);

io.on('connection',(socket)=>{
    console.log('a user connected');

    socket.on('disconnect',()=>{
        console.log('a user disconnected');
    })
})

app.listen(port, () => {
    console.log('server is running on port', `http://localhost:${port}`)
});


export default app;