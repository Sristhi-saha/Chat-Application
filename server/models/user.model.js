import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:false
    },
    profilePicture:{
        type:String,
        required:false
    },
    isOnline:{
        type:Boolean,
        default:'false'
    },
    bio:{
        type:String,
        required:false
    },
    lastSeen:{
        type:Date,
        default:Date.now
    },
    requestSendBy:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            }
    ]
    ,friends:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ]
},{timestamps:true});

const User = mongoose.model('User',userSchema);

export default User;
