import { Router } from "express";
import { getMessages, sendMessage } from "../controllers/message.controller.js";
import { authMiddelware } from "../middlewares/auth.middelware.js";


const messageRouter = Router();

messageRouter.post('/sendMessage',sendMessage);
messageRouter.get('/getMessages/:userId',authMiddelware,getMessages)

export default messageRouter;
