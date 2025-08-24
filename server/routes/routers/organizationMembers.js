const auth = require('../../middleware/auth')
const inOrg = require('../../middleware/inOrg')
const isOwner = require('../../middleware/isOwner')
const roleAuth = require('../../middleware/roleAuth')
const { userCollection, leaderCollection, teamCollection } = require('../models/lib/db')
const router = require('express').Router()
const { body, validationResult, param } = require('express-validator')
router.get('/:organization_ID', auth, inOrg, async (req, res) => {
    const { organization_ID } = req.params
    const members = await userCollection.read(null, { where: { organization_id: organization_ID }, attributes: { exclude: ['hashed_password'] } })
    res.status(200).json(members)
})

router.post('/create-team/:organization_ID/:account_id', [param('organization_ID').isInt().withMessage("The ID must be an integer"),
param('account_id').isInt().withMessage('The ID must be an integer'),
body("name").trim().notEmpty().withMessage("The Name is missing"),
], auth, inOrg, roleAuth("org"),

    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).json({
                error: errors.array()
            })
        }
        let { organization_ID, account_id } = req.params
        const { name, desc } = req.body
        organization_ID = (+organization_ID)
        account_id = (+account_id)
        const user = await userCollection.read(account_id, { where: { organization_id: organization_ID }, attributes: ["acc_id", "name", "username", "email", "role", "profile_picture", "org_cb", "organization_id"] })

        if (user.organization_id !== (+organization_ID)) {
            return res.status(403).json({
                error: "Forbidden- the IDs are mismatched",

            })
        }

        if (user.role !== 'member') {
            return res.status(400).json({
                error: "The user must be a member"
            })
        }
        userCollection.update(null, { role: "leader" }, { where: { organization_id: organization_ID } })
        const leader = await leaderCollection.create({ acc_id: user.acc_id, org_id: organization_ID })

        const team = await teamCollection.create({ org_id: organization_ID, leader_id: leader.leader_id, name: name, desc: desc })
        return res.status(201).json({
            message: `Team ${team.name} has been created, leader :${user.name}`
        })
    })

router.get("/teams/:organization_ID",
     [param('organization_ID').isInt().withMessage("The ID must be an integer")],
      auth,
       inOrg,
        async (req, res) => {
    const { organization_ID } = req.params
    const teams = await teamCollection.read(null, { Where: { org_id: organization_ID } })
    return res.status(200).json(teams)
})
router.put('/teams/change-leader/:account_id/:organization_ID/:team_i',
    [param('organization_ID').isInt().withMessage("The ID must be an integer"),
    param('account_id').isInt().withMessage('The ID must be an integer')],
    auth,
    roleAuth('org'),
    async(req, res)=>{
        const {organization_ID,account_id}=req.params

    })
module.exports = router