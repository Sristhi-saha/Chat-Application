import express from 'express';
import { config } from 'dotenv';
config();
import Message from '../models/message.model.js';
import cloudinary from '../config/cloudinary';

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