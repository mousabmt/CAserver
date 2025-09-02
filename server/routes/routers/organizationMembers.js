const auth = require('../../middleware/auth')
const inOrg = require('../../middleware/inOrg')
const roleAuth = require('../../middleware/roleAuth')
const { userCollection, leaderCollection, teamCollection, memberCollection } = require('../models/lib/db')
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
router.patch('/teams/change-leader/:team_id',
    [body('organization_ID').isInt().withMessage("The ID must be an integer"),
    body('account_id').isInt().withMessage('The ID must be an integer'),
    param('team_id').isInt().withMessage('The ID must be an integer')],
    auth,
    roleAuth('org'),
    async (req, res) => {
        const { team_id } = req.params
        const { organization_ID, account_id } = req.body
        team_id = (+team_id)
        organization_ID = (+organization_ID)
        account_id = (+account_id)
        const team = await teamCollection.read(null, { where: { leader_id: account_id, org_id: organization_ID, team_id: team_id } })
        if (!team) {
            return res.status(404).json({
                error: "Team not found or wrong leader."
            })
        }
        const leader = await leaderCollection.read(null, { where: { acc_id: account_id, org_id: organization_ID } })
        if (leader) {
            return res.status(409).json({ error: "Account already leads another team in this organization" });

        }
        const updatedTeam = await teamCollection.put(team_id, { leader_id: account_id })
        return res.status(200).json({
            message: `${updatedTeam.name} leader was changed successfully`
        })

    })
router.post('/teams/add-member/:team_id',
    [
        param('team_id'),
        body('account_id')
    ],
    auth,
    roleAuth('org'),
    async (req, res) => {
        const { team_id } = req.params
        const { account_id } = req.body
        const organization_ID = req.user.id
        const user = await userCollection.read(account_id)

        if (user.organization_id !== organization_ID) {
            return res.status(403).json({
                error: "Forbidden- User doesn't belond to this organization",
                code: 403
            })
        }
        const team = await teamCollection.read(team_id)
        const member = await memberCollection.read(null, { where: { acc_id: account_id } })
        if (member.team_id) {
            return res.status(409).json({
                error: "User already belongs to a team",
                code: 409
            })
        }
        const joinedMember = await memberCollection.update(null, { team_id: team_id, status: "active" }, { where: { acc_id: account_id } })
        if (!joinedMember) {
            return res.status(400).json({
                error: "An error occured",
                code: 400
            })
        }
        return res.status(200).json({
            message: `Member ${user.name} has been added successfully to the team ${team.name}`
        })
    }
)
router.patch("/teams/member/suspend/:member_id",
    [
        param('member_id').isInt().withMessage('ID must be an integer')
    ],
    auth,
    roleAuth('org'),
    async (req, res) => {
        const { member_id } = req.params
        const member = await memberCollection.read(member_id)
        if (!member) {
            return res.status(404).json({
                code: 404,
                error: "Member not found"
            })
        }
        // since the role auth is org, then the headers should contain its id instead sending it from the body
        if (member.org_id !== req?.user?.id) {
            return res.status(403).json({
                code: 403,
                error: "Forbidden- User doesn't belong to this organization"
            })
        }
        const isSuspended = await memberCollection.update(member_id, { status: "suspended" })
        if (!isSuspended) {
            return res.status(400).json({
                code: 400,
                error: "Failed to suspend the member, please try again"
            })
        }
        return res.status(200).json({
            message: `Member was successfully suspended`
        })
    }
)
router.patch('/teams/:member_id', [
    param('member_id').toInt().isInt({ gt: 0 })
],

)
router.delete(
    "/teams/:team_id/members/:member_id",
    [
        param("team_id").toInt().isInt({ gt: 0 }),
        param("member_id").toInt().isInt({ gt: 0 }),
    ],
    auth,
    roleAuth("org"),
    async (req, res) => {
        const teamId = (+req.params.team_id);
        const memberId = (+req.params.member_id);

        // 1) Load member
        const member = await memberCollection.read(memberId);
        if (!member) {
            return res.status(404).json({ code: 404, error: "Member not found" });
        }

        // 2) Ensure org matches
        if (member.org_id !== req.user.org_id) {
            return res.status(403).json({
                code: 403,
                error: "Forbidden - Member does not belong to your organization",
            });
        }

        // 3) Ensure team matches
        if (member.team_id !== teamId) {
            return res.status(422).json({
                code: 422,
                error: "Member does not belong to this team",
            });
        }

        // 4) Delete membership
        const deleted = await memberCollection.delete(memberId);
        if (!deleted) {
            return res.status(400).json({
                code: 400,
                error: "Failed to remove the member, please try again",
            });
        }

        await userCollection.update(member.acc_id, { org_id: null });

        return res.status(200).json({
            message: `Member ${member.name ?? ""} was successfully removed from team ${teamId}`,
        });
    }
);
router.get("/teams/members/:team_id",
    [
        param('team_id').toInt().isInt({ gt: 0 })
    ],
    auth,
    async (req, res) => {
        console.log('hi');
        
        const { team_id } = req.params
        const team = await teamCollection.read(team_id)
        const organization_ID=req.user.organization_id
        if(team.org_id!==organization_ID){
            return res.status(403).json({
                code:403,
                error:"Forbidden- You dont belond to this organization"
            })
        }
        const getMembers=await memberCollection.read(null,{Where:{org_id:organization_ID}})
        return res.status(200).json(getMembers)
    }
)
module.exports = router