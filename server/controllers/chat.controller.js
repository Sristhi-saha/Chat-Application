import  dotenv  from 'dotenv';
dotenv.config();
import User from '../models/user.model.js';

export const getOnlineUsers = async (req, res) => {
    try {
        const onlineUsers = await User.find({ isOnline: true }).select('name emial profilePicture');
        if (!onlineUsers) {
            return res.status(404).json({
                message: 'No online users found'
            })
        }
        return res.status(200).json({
            message: 'Online users retrieved successfully',
            data: onlineUsers
        })
    } catch (e) {
        return res.status(500).json({
            message: 'server error'
        })
    }
}

export const getUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({
                message: 'userId is required'
            })
        }

        const user = await User.findById(userId).select('name email profilePicture isOnline lastSeen');
        return res.status(200).json({
            message: 'User status retrieved successfully',
            data: user
        })
   
}catch (e) {
    return res.status(500).json({
        message: 'server error is happening'
    })
}
}

export const markMessageAsRead = async (req, res) => {
    try {
        const { messageId } = req.body;
        if (!messageId) {
            return res.status(400).json({
                message: 'messageId is required'
            })
        }
        const message = await Message.findByIdAndUpdate(messageId, { isRead: true }, { new: true });
        if (!message) {
            return res.status(404).json({
                message: 'Message not found'
            })
        }   
    }catch(e){
        return res.status(500).json({
            message:'Failed to mark message as read'
        })
    }
}

export const allusers = async(req,res)=>{
    try{
        const id = req.id;
        const all = await User.find({_id:{$ne:id}});

            if(!all){
                return res.status(400).json({
                    message:'users not find'
                })
            }
            console.log('not found')
            return res.status(200).json({
                message:'USer fetched successfully',
                user:all
            })
        }catch(e){
        return res.status(500).json({
            message:e.message
        })
    }
}