import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true
    },
    isRead:{
        type:Boolean,
        default:false
    },
    contentType:{
        type:String,
        enum:['text','image','video','file']
    },
    fileUrl:{
        type:String,
        required:''
    }
}, { timestamps: true });


const Message = mongoose.model('Message',messageSchema);
export default Message;