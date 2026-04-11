import express from 'express';
import { config } from 'dotenv';
config();
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Buffer } from 'buffer';
import cloudinary from '../config/cloudinary.js';

export const registerUser = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        console.log(req.body);
        if (!email || !password || !name) {
            return res.status(400).json({
                message: 'Please provide all info'
            })
        }

        const isExits = await User.findOne({ email });
        if (isExits) {
            return res.status(400).json({
                message: "User already exists"
            })
        }

        // let profilepictureUrl= '';
        // if(profilePicture){
        //     const uploadPicture = await cloudinary.uploader.upload(profilePicture,{
        //         folder:'profilePicture',
        //         resource_type:'auto'
        // })
        // profilepictureUrl = uploadPicture.secure_url;
        // }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name, email, password: hashedPassword
        })
        await newUser.save();

        const token = jwt.sign({
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
        }, process.env.JWT_SECRET, { expiresIn: "7d" })

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        console.log("token set:", token);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,

            },
            token
        })
    } catch (e) {
        res.status(500).json({
            messege: e.messege,
            error: e.messege
        })
        console.log(e);
    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(req.body);
        if (!email || !password) {
            return res.status(400).json({
                message: 'Please provide all info'
            })
        }
        const user = await User.findOne({
            email
        })
        if (!user) {
            return res.status(400).json({
                message: 'Incorrect email or password'
            })
        }
        console.log("user is:", user);
        const matchedPassword = await bcrypt.compare(password, user.password);
        if (!matchedPassword) {
            return res.status(400).json({
                message: 'Incorrect email or password'
            })
        }
        const token = jwt.sign({
            id: user._id,
            name: user.name,
            email: user.email,
        }, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({
            message: 'User logged in successfully',
            user,
            token
        })

    } catch (e) {
        res.status(500).json({
            message: e.message,
            error: e.message
        })
    }
}

export const googleAuth = async (req, res) => {
    try {
        const { name, email, profilePicture } = req.body;
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                email, name, profilePicture: profilePicture || ''
            })
        }
        const token = jwt.sign({
            id: user._id,
            name: user.name,
            email: user.email,
        }, process.env.JWT_SECRET, { expiresIn: '7d' }
        )

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'PRODUCTION',
            sameSite: 'strict',
            expiresIn: 7 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({
            message: 'User logged in successfully',
            user,
            token
        })

    } catch (e) {
        res.status(500).json({
            message: e.message,
        })
    }
}

export const logoutUser = async (req, res) => {
    try {
        console.log("from logoutUser controller", req.id);
        res.clearCookie('token');
        res.status(200).json({
            message: 'User logged out successfully'
        })
    } catch (e) {
        res.status(500).json({
            message: e.message,
        })
    }
}

export const profileCreated = async (req, res) => {
    try {
        const { name, bio, profilePicture } = req.body;
        const id = req.id;
        console.log(id);
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'USer not found!'
            })
        }
        const user = await User.findById(id);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found!'
            })
        }
        const b64 = Buffer.from(req.file.buffer).toString('base64')
        const dataURI = `data:${req.file.mimetype};base64,${b64}`

        const uploadPicture = await cloudinary.uploader.upload(dataURI, {
            folder: 'profilePicture',
            resource_type: 'auto'
        })
        const updatedData = await User.findByIdAndUpdate(id, {
            name: name,
            bio: bio,
            profilePicture: uploadPicture.secure_url
        },)

        res.status(200).json({
            success: true,
            message: 'Profile Updated Successfully',
            user: updatedData
        })
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: e.message
        })
    }
}

export const getMyProfile = async(req,res)=>{
    try{
        const id = req.id;
        const user = await User.findById(id).select('name bio profilePicture');
        if(!user){
            return res.status(404).json({
                message:'User not found',
                status:false
            })
        }
        return res.status(200).json({
            message:'USer profile retrieve successfully',
            status:true,
            user
        })
    }catch(e){
        return res.status(500).json({
            message:e.message,
            status:false
        })
    }
} 
