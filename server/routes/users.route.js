import { allusers } from "../controllers/chat.controller.js";
import { acceptRequest, sendRequest, sendRequestBy,rejectRequest } from "../controllers/message.controller.js";
import { authMiddelware } from "../middlewares/auth.middelware.js";
import  Router from 'express';


const userRouter = Router();

userRouter.get('/all',authMiddelware,allusers);
userRouter.post('/requestSend',authMiddelware,sendRequest);
userRouter.get('/requestSendBy',authMiddelware,sendRequestBy);
userRouter.post('/acceptRequest',authMiddelware,acceptRequest);
userRouter.post('/rejectRequest',authMiddelware,rejectRequest);

export default userRouter;