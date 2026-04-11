import { allusers } from "../controllers/chat.controller.js";
import { sendRequest } from "../controllers/message.controller.js";
import { authMiddelware } from "../middlewares/auth.middelware.js";
import  Router from 'express';


const userRouter = Router();

userRouter.get('/all',authMiddelware,allusers);
userRouter.post('/requestSend',authMiddelware,sendRequest);

export default userRouter;