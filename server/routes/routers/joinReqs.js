`use strict`
const { userCollection, joinReqCollection, orgCollection,User } = require('../../db');
const auth = require('../../middleware/auth');
const router = require('express').Router();
const { param, validationResult, body } = require('express-validator');
const isOwner = require('../../middleware/isOwner');

router.post(
    '/:account_id/:organization_ID',
    auth,isOwner,
    [
        param('account_id').isInt().withMessage('Account ID must be an integer.'),
        param('organization_ID').isInt().withMessage('Organization ID must be an integer.')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        try {
            const { organization_ID, account_id } = req.params;

            const user = await userCollection.read(account_id);
            const org = await orgCollection.read(organization_ID)
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            if (!org) {
                return res.status(404).json({ error: 'Organization not found.' });

            }
            if (user.organization_id) {
                return res.status(409).json({ error: 'You are already registered in an organization.' });
            }
            if(org.is_private){
                return res.status(403).json({
                    error:"This organization is private!"
                })
            }

            
            const checkReqs = await joinReqCollection.read(null, {
                where: {
                    acc_id: account_id,
                    org_id: organization_ID
                }
            })
let record;
if (checkReqs.length > 0) {
   record = checkReqs[0].get({ plain: true });
res.status(200).json({
    message:"The request was submitted successfully"
})
} else {
  console.log("No join request found.");
}

            if (record && record.status === "pending") {
                return res.status(409).json({
                    error: "You already have a submitted request."
                })
            }
            await joinReqCollection.create({
                acc_id: account_id,
                org_id: organization_ID
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                error: 'An error occurred. Please try again later.'
            });
        }
    }
);
router.delete('/cancel-req/:account_ID',auth,isOwner,
    [param('account_ID').isInt().withMessage("The account ID must be an integer.")],
    async(req,res )=>{
const {account_ID}=req.params;
const delReq=await joinReqCollection.delete(account_ID)
if(!delReq){
    return res.status(400).json({
        error:"failed to cancel the request, please try again later"
    })

}
return res.status(202).json({
    message:"The request was successfully canceled."
})
})
router.post(
  '/reject-req/:account_id/:organization_ID',
  auth,isOwner,
  [
    param('account_id').isInt().withMessage('The account ID must be an integer'),
    param('organization_ID').isInt().withMessage('The organization ID must be an integer'),
    body('rejected_by').trim().notEmpty().withMessage('The name is missing'),
     body('reason').trim().notEmpty().withMessage("Please enter the rejection reason")
],
  async (req, res) => {
const {rejected_by,reason}=req.body

}
);

router.put(
  '/accept-req/:account_id/:organization_ID',
  auth,isOwner,
  [
    param('account_id').isInt().withMessage('The account ID must be an integer'),
    param('organization_ID').isInt().withMessage('The organization ID must be an integer')
  ],
  async (req, res) => {
    const { account_id, organization_ID } = req.params;
  let check = await joinReqCollection.read(null, {
      where: { acc_id: account_id, org_id: organization_ID },
    });

    if (!check || check.length === 0) {
      return res.status(404).json({ error: 'Join request not found' });
    }


    const getUser=await userCollection.read(account_id)
    if(!getUser.organization_id){
        return res.status(409).json({
            error:'User already belongs to an organization'
        })
    }
    const acceptedUser=await userCollection.update(account_id,{org_id:organization_ID})
await joinReqCollection.update(
  null,
  { status: 'accepted' },
  { where: { acc_id: account_id, org_id: organization_ID } }
);

    if(!acceptedUser){
     return   res.status(400).json({
            error:'Something wrong happend while accepting this user.'
        })
    }
    return res.status(200).json({
        message:`${acceptedUser.name} Was accepted successfully`
    })
  }
  
);

router.get('/:organization_ID', auth,[ param('organization_ID').isInt().withMessage('The organization ID must be an integer.')], async (req, res) => {
    const { organization_ID } = req.params
    const getReq = await joinReqCollection.read(null, { where: { org_id:organization_ID }, include: [{
    model: User,
    attributes: ['name']
  }]
 })
    if (!getReq) {
        return res.status(404).json({
            error: 'No join requests'
        })
    }
    res.status(200).json(getReq)
})
module.exports = router;
