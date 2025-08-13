const auth = require('../../middleware/auth')
const inOrg = require('../../middleware/inOrg')
const roleAuth=require('../../middleware/roleAuth')
const router=require('express').Router()
const {params,body,validationResult}=require('express-validator')
router.get('/:organization_ID',auth,inOrg,async (req,res)=>{
    res.json({
        message:"hi"
    })
})
router.post('/:organization_ID/:account_id',auth,inOrg,roleAuth("org"),async(req,res)=>{

})
module.exports=router