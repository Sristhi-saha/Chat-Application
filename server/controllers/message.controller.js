import express from 'express';
import { config } from 'dotenv';
config();
import Message from '../models/message.model.js';
import cloudinary from '../config/cloudinary.js';
import User from '../models/user.model.js';


export const sendRequest = async(req,res)=>{
    try{

        const sendId = req.id;
        const {receiveId} = req.body;
        if(!sendId || !receiveId){
            return res.status(400).json({
                message:'must provide send and receiveid',
                success:false
            })
        }
        const userfind = await User.findById(receiveId);
        let user;
        if(userfind.requestSendBy.includes(sendId)){
            console.log('already frn');
            return res.status(400).json({
                message:'Already send',
                success:false
            })
        }else{
            user = await User.findByIdAndUpdate(receiveId,{$push:{requestSendBy:sendId}});
        }

        
        console.log("from send request:",user);
        return res.status(200).json({
            message:'request send',
            success:true
        })

    }catch(e){
        console.log(e.message.message)
        return res.status(500).json({
            message:e.message,
            success:false
        })
    }
}

export const sendRequestBy = async(req,res)=>{
    try{
        const id = req.id;
        const data = await User.findById(id).select('requestSendBy').populate('requestSendBy');
        console.log("from send requestBy:",data);
        return res.status(200).json({
            message:'fetched successfully',
            data
        })
    }catch(e){

    }
}

export const acceptRequest = async(req,res)=>{
    try{
        const id= req.id;
        const {sendId}= req.body;
        if(!sendId){
            return res.status(400).json({
                message:'please accpect at first',
                status:false
            })
        }
        const response = await User.findByIdAndUpdate(id,{$push:{friends:sendId}});
        const send = await User.findByIdAndUpdate(sendId,{$push:{friends:id}});
        const remove = await User.findByIdAndUpdate(id,{$pull:{requestSendBy:sendId}})
        const user = await User.findById(id);

        return res.status(200).json({
            message:'Accept request successfully',
            user
        })

    }catch(e){
        return res.status(500).json({
            message:'server error',
            status:false
        })
    }
}

export const rejectRequest = async(req,res)=>{
    try{
        const id= req.id;
        const {sendId}= req.body;
        if(!sendId){
            return res.status(400).json({
                message:'please accpect at first',
                status:false
            })
        }
        const response = await User.findByIdAndUpdate(id,{$pull:{requestSendBy:sendId}})

        return res.status(200).json({
            message:'Accept reject successfully',
            response
        })

    }catch(e){
        return res.status(500).json({
            message:'server error',
            status:false
        })
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { sender, receiver, content, contentType, fileUrl } = req.body;
        if (!sender || !receiver || !content) {
            return res.status(400).json({
                message: 'please give all info'
            })
        }
        if (contentType !== 'text' && !fileUrl) {
            return res.status(400).json({
                message: 'fileurl is required for sending file or image'
            })
        }
        if (contentType === 'text' && fileUrl) {
            return res.status(400).json({
                message: 'fileUrl should not be provided for text messages'
            })
        }

        if (fileUrl) {
            const file = await cloudinary.uploader.upload(fileUrl, {
                folder: 'chatFiles',
                resourse_type: 'auto'
            })
        }

        const message = new Message({
            sender, receiver, content, contentType, fileUrl: fileUrl || ''
        })
        await message.save();
        res.status(201).json({
            message: 'Message sent successfully',
            data: message
        })

    } catch (e) {
        return res.status(500).json({
            message: 'Failed to send message'
        })
    }
}

export const getMessages = async (req, res) => {
    try {
        const { sender, receiver } = req.body;
        if (!sender || !receiver) {
            return res.status(400).json({
                message: 'please give all info'
            })
        }

        const messages = await Message.find({ $or: [{ sender: sender, receiver: receiver }, { sender: receiver, receiver: sender }] }).sort({ createdAt: 1 });

        res.status(200).json({
            message: 'Messages fetched successfully',
            data: messages
        })
    } catch (e) {
        return res.status(500).json({
            message: 'Failed to get messages'
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
        res.status(200).json({
            message: 'Message marked as read',
            data: message
        })
    } catch (e) {
        return res.status(500).json({
            message: 'Failed to mark message as read'
        })
    }
}

export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.body;
        if (!messageId) {
            return res.status(400).json({
                message: 'messageID is required'
            })
        }

        const message = await Message.findByIdAndDelete(messageId);

        if (!message) {
            return res.status(404).json({
                message: 'Message not found'
            })
        }

        return res.status(200).json({
            message: 'Message deleted successfully'
        })

    } catch (e) {
        return res.status(500).json({
            message: 'Failed to delete message'
        })
    }
}

export const updateMessage = async(req,res)=>{
    try{
        const {messageId,content} = req.body;
        if(!messageId || !content){
            return res.status(400).json({
                message:'messageId and content are required'
            })
        }
        const message = await Message.findByIdAndUpdate(messageId,{content},{new:true});
        if(!message){
            return res.status(404).json({
                message:'Message not found'
            })
        }

        return res.status(200).json({
            message:'Message updated successfully',
            data:message
        })
    }catch(e){
        return res.status(500).json({
            message:'Failed to update message'
        })
    }
}