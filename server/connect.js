import mongoose from "mongoose";
const connectToDB = async()=>{
    try{
        const res = await mongoose.connect(process.env.MONGO_URI);
        console.log('connected to database');
    }catch(error){
        console.log('Error come',error);
    }
}
export default connectToDB;