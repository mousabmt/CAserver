const auth = require('../../middleware/auth')
const isOwner = require('../../middleware/isOwner')

const router=require('express').Router()
router.get('/',auth,isOwner,async (req,res)=>{
    res.json({
        message:"hi"
    })
})
module.exports=router