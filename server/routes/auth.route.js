import Router from 'express';
import { getMyProfile, loginUser, logoutUser, profileCreated, registerUser } from '../controllers/auth.controller.js';
import upload from '../middlewares/multer.js';
import { authMiddelware } from '../middlewares/auth.middelware.js';
const authRouter = Router();

authRouter.post('/register',registerUser);
authRouter.post('/login',loginUser);
authRouter.get('/logout',authMiddelware,logoutUser);
authRouter.post('/profile',authMiddelware,upload.single('profilePicture'),profileCreated);
authRouter.get('/me',authMiddelware,getMyProfile);

export default authRouter;