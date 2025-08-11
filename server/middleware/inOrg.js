// isOwner.js
module.exports=(req,res,next)=>{
    try {
        const {organization_ID}=req.params
        const userOrg=req.user?.organization_id || req.user?.org_id
        if(organization_ID!=userOrg){
            console.warn(`Unauthorized access attempt: userOrg=${userOrg}, routeOrg=${organization_ID}`);

           return res.status(403).json({
                error:"Forbidden- mismatched IDs"
            })

        }
        next()
    } catch (error) {
        return res.status(400).json({
            error:error.message
        })
    }
}