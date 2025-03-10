const jwt=require('jsonwebtoken');
const {JWT_SECRET}=require('../config');


const mongoose=require('mongoose');
const UserModel=mongoose.model("UserModel");

module.exports=(req,res,next)=>{
    //authorization header->bearer dfsdfsdfs (same token)
    const {authorization}=req.headers;
    if(!authorization){
        return res.status(401).json({error:"User not logged in"});//i dont want to continue furthur after encountering this error
    }
    const token=authorization.replace("Bearer ","");
    jwt.verify(token,JWT_SECRET,(error,payload)=>{
        if(error){
            return res.status(401).json({error:"User not logged in"});//i dont want to continue furthur after encountering this error
        }
        const {_id}=payload;
        UserModel.find(_id)
        .then(dbUser=>{
            req.dbUser=dbUser;
        });
        //forward the request to the next middleware or next route
        next();
    })
}