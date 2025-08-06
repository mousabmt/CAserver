const router=require('express').Router()
const {User,userCollection}=require('../../db');
const auth = require('../../middleware/auth');
router.get('/', async (req, res) => {
const users = await User.findAll({
  attributes: { exclude: ['hashed_password'] }
});  if (!users || users.length === 0) {
return res.status(404).json({ error: 'No users found' });
    
  }
  return res.json(users)
});
router.get('/:id',auth,async(req,res)=>{
    const {id}=req.params
    const singleUser=await userCollection.read(id,{attributes:{exclude:['hashed_password']}})
    if(!singleUser){
        return res.status(404).json({
            error:"User not found."
        })
    }
    singleUser.skills=singleUser.skills.split(',').map(skill => skill.trim());

    return res.status(200).json(singleUser)
})
module.exports=router