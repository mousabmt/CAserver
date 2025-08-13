`use strict`
module.exports=(...allowedRoles)=>{
    return (req,res,next)=>{
        if(!allowedRoles.includes(req.user.role) || !req.user){
            return res.status(403).json({message:"Forbidden: You do not have permission to access this resource."});
        }
        next();
    }
}