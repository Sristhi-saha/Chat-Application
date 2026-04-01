import express from 'express';
import { config } from 'dotenv';
config();
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({
                messege: 'Please provide all info'
            })
        }

        const isExits = await User.findOne({ email });
        if (isExits) {
            return res.status(400).json({
                message: "User already exists"
            })
        }

        const newUser = new User({
            name, email, password
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
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(201).json({
            message: 'User registered successfully',
            user: newUser,
            token
        })
    } catch (e) {
        res.status(500).json({
            messege: e.messege,
            error: e.messege
        })
    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: 'Please provide all info'
            })
        }
        const user = await User.findOne({
            email, password
        })
        if (!user) {
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

export const googleAuth = async(req,res)=>{
    try{
        const {name,email} = req.body;
        let user = await User.findOne({email});
        if(!user){
            user = await User.create({
                email,name
            })
        }
        const token = jwt.sign({
            id:user._id,
            name:user.name,
            email:user.email,
        },process.env.JWT_SECRET,{expiresIn:'7d'}
       )

       res.cookie('token',token,{
        httpOnly:true,
        secure:process.env.NODE_ENV === 'PRODUCTION',
        sameSite:'strict',
        expiresIn:7*24*60*60*1000
       })

       res.status(200).json({
        message:'User logged in successfully',
        user,
        token
       })

    }catch(e){
        res.status(500).json({
            message:e.message,
        })
    }
}

export const logoutUser = async(req,res)=>{
    try{
        res.clearCookie('token');
        res.status(200).json({
            message:'User logged out successfully'
        })
    }catch(e){
        res.status(500).json({
            message:e.message,
        })
    }
}
