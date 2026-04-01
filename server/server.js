import express from "express";
import dotenv from "dotenv";
import connectToDB from "./connect.js";
import authRouter from "./routes/auth.route.js";
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
connectToDB();

app.use('/api/auth',authRouter);

app.listen(port, () => {
    console.log('server is running on port', `http://localhost:${port}`)
});


export default app;