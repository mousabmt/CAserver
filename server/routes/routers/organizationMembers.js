const auth = require('../../middleware/auth')
const inOrg = require('../../middleware/inOrg')

const router=require('express').Router()
router.get('/:organization_ID',auth,inOrg,async (req,res)=>{
    res.json({
        message:"hi"
    })
})
module.exports=router