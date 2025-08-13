'use strict';
const { getIO } = require('../../module/socket')
const { userCollection, joinReqCollection, orgCollection, User } = require('../models/lib/db');
const { param, validationResult, body } = require('express-validator');
const isOwner = require('../../middleware/isOwner');
const auth = require('../../middleware/auth');
const inOrg = require('../../middleware/inOrg');
const { Router } = require('express');
const { userNotif_obj_ } = require('../models/lib/db');
const { orgNotif_obj_ } = require('../models/lib/db');
const router = Router();
const socket  = getIO()
router.post(
  '/:account_id/:organization_ID',
  auth,
  isOwner,
  [
    param('account_id').isInt().withMessage('Account ID must be an integer.'),
    param('organization_ID').isInt().withMessage('Organization ID must be an integer.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    try {
      const { organization_ID, account_id } = req.params;
      const user = await userCollection.read(account_id);
      const org = await orgCollection.read(organization_ID);

      if (!user) return res.status(404).json({ error: 'User not found.' });
      if (!org) return res.status(404).json({ error: 'Organization not found.' });
      if (user.organization_id) return res.status(409).json({ error: 'You are already registered in an organization.' });
      if (org.is_private) return res.status(403).json({ error: "This organization is private!" });

      const checkReqs = await joinReqCollection.read(null, {
        where: { acc_id: account_id }
      });

      if (checkReqs.length > 0) {
        const record = checkReqs[0].get({ plain: true });
        if (record.status === 'pending') {
          return res.status(409).json({ error: "You already have a submitted request." });
        }
      }

      await joinReqCollection.create({ acc_id: account_id, org_id: organization_ID });

await orgNotif_obj_.create({
  org_id: organization_ID,
  user_id: account_id, 
  message: `User ${user.name} wants to join your organization.`,
  type: 'pending',
});
      return res.status(200).json({ message: "The request was submitted successfully" });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'An error occurred. Please try again later.' });
    }
  }
);

router.delete(
  '/cancel-req/:account_id',
  auth,
  isOwner,
  [param('account_id').isInt().withMessage("The account ID must be an integer.")],
  async (req, res) => {
    const { account_id } = req.params;
    const delReq = await joinReqCollection.delete(null, { where: { acc_id: account_id } });
await orgNotif_obj_.delete(null, {
  where: { user_id: account_id, type: 'pending' }
});

if (!delReq) {
      return res.status(400).json({ error: "Failed to cancel the request, please try again later" });
    }

    return res.status(202).json({ message: "The request was successfully canceled." });
  }
);

router.post(
  '/reject-req/:account_id/:organization_ID',
  auth,
  inOrg,
  [
    param('account_id').isInt().withMessage('The account ID must be an integer'),
    param('organization_ID').isInt().withMessage('The organization ID must be an integer'),
    body('rejected_by').trim().notEmpty().withMessage('The name is missing'),
    body('reason').trim().notEmpty().withMessage("Please enter the rejection reason")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    try {
      const { account_id, organization_ID } = req.params;
      const { rejected_by, reason } = req.body;

      const check = await joinReqCollection.read(null, {
        where: { acc_id: account_id, org_id: organization_ID }
      });

      if (!check || check.length === 0) {
        return res.status(404).json({ error: 'Join request not found.' });
      }

      await joinReqCollection.update(null, { status: 'rejected' }, {
        where: { acc_id: account_id, org_id: organization_ID }
      });

const io = getIO();
io.to(account_id.toString()).emit("joinReqResponse", {
  status: "rejected",
  message: `Your join request to organization ${organization_ID} was rejected by ${rejected_by}. Reason: ${reason}`
});
await userNotif_obj_.create({
  user_id: account_id,
  message: `Your join request to ${organization_ID} was rejected by ${rejected_by}. Reason: ${reason}`,
  type: 'rejected', 
});
      return res.status(200).json({ message: 'Join request rejected.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'An error occurred.' });
    }
  }
);

router.put(
  '/accept-req/:account_id/:organization_ID',
  auth,
  inOrg,
  [
    param('account_id').isInt().withMessage('The account ID must be an integer'),
    param('organization_ID').isInt().withMessage('The organization ID must be an integer')
  ],
  async (req, res) => {
    try {
      const { account_id, organization_ID } = req.params;

      const check = await joinReqCollection.read(null, {
        where: { acc_id: account_id, org_id: organization_ID },
      });

      if (!check || check.length === 0) {
        return res.status(404).json({ error: 'Join request not found' });
      }

      const org = await orgCollection.read(organization_ID);
      if (!org) {
        return res.status(404).json({ error: "Organization doesn't exist" });
      }

      const getUser = await userCollection.read(account_id);
      if (getUser.organization_id) {
        return res.status(409).json({ error: 'User already belongs to an organization' });
      }

      const acceptedUser = await userCollection.update(account_id, { organization_id: organization_ID });

      await joinReqCollection.update(null, { status: 'accepted' }, {
        where: { acc_id: account_id, org_id: organization_ID }
      });

      if (!acceptedUser) {
        return res.status(400).json({ error: 'Something wrong happened while accepting this user.' });
      }

 const io = getIO();
io.to(account_id.toString()).emit('joinReqResponse', {
  status: "accepted",
  message: `You were accepted into the organization ${org.name}.`
});
await userNotif_obj_.create({
  user_id: account_id,
  message: `You were accepted into the organization ${org.name}.`,
  type: 'accepted', 
});
      await orgNotif_obj_.update(null, { type:"accepted" }, { where: { org_id: organization_ID,user_id:account_id } });

      return res.status(200).json({
        message: `${acceptedUser.name} was accepted successfully into ${org.name}.`
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'An error occurred while accepting the request.' });
    }
  }
);

router.get(
  '/:organization_ID',
  auth,
  [param('organization_ID').isInt().withMessage('The organization ID must be an integer.')],
  async (req, res) => {
    const { organization_ID } = req.params;
    const getReq = await joinReqCollection.read(null, {
      where: { org_id: organization_ID },
      include: [{ model: User, attributes: ['name'] }]
    });
    if (!getReq) {
      return res.status(404).json({ error: 'No join requests' });
    }
    res.status(200).json(getReq);
  }
);
 module.exports =  router;