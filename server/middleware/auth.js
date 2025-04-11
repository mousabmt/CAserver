module.exports=(req,res,next)=>{
    const jwt=require('jsonwebtoken')
    const express=require('express')
try {
    const token = req.headers.authorization?.replace("Bearer ","")
    console.log(token);
    
const decode = jwt.verify(token,process.env.MY_SECRET_KEY)
if(!decode) res.status(401).json("Unauthorized Access!")

} catch (error) {
    console.log(error);
    
}
next();
}