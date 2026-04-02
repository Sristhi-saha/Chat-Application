import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    participants:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
        }
    ],
    lastMessage:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Message'
    },
    unreadCount:{
        type:Number,
        default:0
    },
    isRead:{
        type:Boolean,
        default:true
    },
    isGroupChat:{
        type:Boolean,
        default:false
    },
    groupName:{
        type:String,
        required:function(){
            return this.isGroupChat;
        }
        },
    groupAdmin:{
        type:mongoose.Schema.types.objectId,
        ref:'User',
        required:function(){
            return this.isGroupChat;
            }
        }
},{timestamps:true})

export const conversationModel = mongoose.model('Conversation',conversationSchema)