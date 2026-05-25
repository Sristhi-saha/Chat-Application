import express from 'express';
import { config } from 'dotenv';
config();
import Message from '../models/message.model.js';
import cloudinary from '../config/cloudinary.js';
import User from '../models/user.model.js';


export const sendRequest = async (req, res) => {
    try {

        const sendId = req.id;
        const { receiveId } = req.body;
        if (!sendId || !receiveId) {
            return res.status(400).json({
                message: 'must provide send and receiveid',
                success: false
            })
        }
        const userfind = await User.findById(receiveId);
        let user;
        if (userfind.requestSendBy.includes(sendId)) {
            console.log('already frn');
            return res.status(400).json({
                message: 'Already send',
                success: false
            })
        } else {
            user = await User.findByIdAndUpdate(receiveId, { $push: { requestSendBy: sendId } });
        }


        console.log("from send request:", user);
        return res.status(200).json({
            message: 'request send',
            success: true
        })

    } catch (e) {
        console.log(e.message.message)
        return res.status(500).json({
            message: e.message,
            success: false
        })
    }
}

export const sendRequestBy = async (req, res) => {
    try {
        const id = req.id;
        const data = await User.findById(id).select('requestSendBy').populate('requestSendBy');
        console.log("from send requestBy:", data);
        return res.status(200).json({
            message: 'fetched successfully',
            data
        })
    } catch (e) {

    }
}

export const acceptRequest = async (req, res) => {
    try {
        const id = req.id;
        const { sendId } = req.body;

        if (!sendId) {
            return res.status(400).json({
                message: 'sendId is required',
                success: false
            });
        }

        // Add each other as friends
        await User.findByIdAndUpdate(id, { $push: { friends: sendId } });
        await User.findByIdAndUpdate(sendId, { $push: { friends: id } });

        // Remove from requestSendBy
        await User.findByIdAndUpdate(id, { $pull: { requestSendBy: sendId } });

        return res.status(200).json({
            message: 'Request accepted successfully',
            success: true  // ✅ add this
        });

    } catch (e) {
        console.error('acceptRequest error:', e.message); // ✅ log the error
        return res.status(500).json({
            message: 'Server error',
            success: false
        });
    }
}

export const rejectRequest = async (req, res) => {
    try {
        const id = req.id;
        const { sendId } = req.body;
        if (!sendId) {
            return res.status(400).json({
                message: 'please accpect at first',
                status: false
            })
        }
        const response = await User.findByIdAndUpdate(id, { $pull: { requestSendBy: sendId } })

        return res.status(200).json({
            message: 'Accept reject successfully',
            response
        })

    } catch (e) {
        return res.status(500).json({
            message: 'server error',
            status: false
        })
    }
}

export const sendMessage = async (req, res) => {
    try {
        const {
            toUserId,
            fromUserId,
            messages,
            contentType = 'text',  // ← default to 'text' if not provided
            fileUrl
        } = req.body;

        // Validation
        if (!toUserId || !fromUserId || !messages) {
            return res.status(400).json({
                message: 'please give all info'
            });
        }

        if (contentType !== 'text' && !fileUrl) {
            return res.status(400).json({
                message: 'fileUrl is required for sending file or image'
            });
        }

        if (contentType === 'text' && fileUrl) {
            return res.status(400).json({
                message: 'fileUrl should not be provided for text messages'
            });
        }

        // Cloudinary upload
        let uploadedFileUrl = '';
        if (fileUrl) {
            const file = await cloudinary.uploader.upload(fileUrl, {
                folder: 'chatFiles',
                resource_type: 'auto'  // ← fixed typo (was resourse_type)
            });
            uploadedFileUrl = file.secure_url;  // ← actually store the result
        }

        // Save message
        const newMessage = new Message({
            sender: fromUserId,
            receiver: toUserId,
            content: messages,
            contentType,
            fileUrl: uploadedFileUrl
        });

        await newMessage.save();

        return res.status(201).json({
            message: 'Message sent successfully',
            data: newMessage
        });

    } catch (e) {
        console.error('sendMessage error:', e.message);  // ← log the actual error
        return res.status(500).json({
            message: 'Failed to send message',
            error: e.message  // ← helpful during development
        });
    }
}

export const getMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const myUserId = req.id;

        const messages = await Message.find({
            $or: [
                { sender: myUserId, receiver: userId },
                { sender: userId, receiver: myUserId }
            ]
        }).sort({ createdAt: 1 });

        return res.status(200).json({
            message: 'Messages fetched successfully',
            data: messages
        });

    } catch (e) {
        console.error('getMessages error:', e.message);
        return res.status(500).json({ message: 'Failed to fetch messages' });
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

export const updateMessage = async (req, res) => {
    try {
        const { messageId, content } = req.body;
        if (!messageId || !content) {
            return res.status(400).json({
                message: 'messageId and content are required'
            })
        }
        const message = await Message.findByIdAndUpdate(messageId, { content }, { new: true });
        if (!message) {
            return res.status(404).json({
                message: 'Message not found'
            })
        }

        return res.status(200).json({
            message: 'Message updated successfully',
            data: message
        })
    } catch (e) {
        return res.status(500).json({
            message: 'Failed to update message'
        })
    }
}

export const getAllFriend = async (req, res) => {
    try {
        console.log('from get all friends');

        const id = req.id; // or req.user.id depending on middleware

        if (!id) {
            return res.status(400).json({
                message: 'Id is necessary',
                success: false
            });
        }

        const user = await User.findById(id).select('friends');

        const friend = await User.find({ _id: user.friends }).select('-password')

        //fetches last messages for each friend
        const friendsWithLastMessage = await Promise.all(friend.map(async (frn) => {
            const lastMessage = await Message.findOne({
                $or: [
                    { sender: id, receiver: frn._id },
                    { sender: frn._id, receiver: id }
                ]
            })
                .sort({ createdAt: -1 })
                .select('content createdAt sender receiver contentType fileUrl');

            return {
                ...frn.toObject(),
                lastMessage: lastMessage ? lastMessage.content : '',
                lastMessageTime: lastMessage ? lastMessage.createdAt : null,
                lastMessageSender: lastMessage ? lastMessage.sender : null,
                lastMessageReceiver: lastMessage ? lastMessage.receiver : null,
                lastMessageContentType: lastMessage ? lastMessage.contentType : 'text',
                lastMessageFileUrl: lastMessage ? lastMessage.fileUrl : null
            }

        }))

        //sort by most recent message
        friendsWithLastMessage.sort((a, b) => {
            const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
            const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
            return timeB - timeA;
        })



        console.log("from friends", user, friend);

        return res.status(200).json({
            friends: friendsWithLastMessage,
            success: true
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: 'server error',
            success: false
        });
    }
};