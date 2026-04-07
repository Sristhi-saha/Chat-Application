import jwt from 'jsonwebtoken';


export const authMiddelware = (req,res,next)=>{
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({
            message:'Unauthorized'
        })
    }
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    console.log("decoded token:", decoded);
    if(!decoded){
        return res.status(401).json({
            message:'Unauthorized'
        })
    }
    req.id = decoded.id;
    next();
}