const { orgNotif_obj_, userNotif_obj_ } = require('../models/lib/db');
const auth = require('../../middleware/auth');
const router = require('express').Router();

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const orgId  = req.user?.organization_id;
    let rows;

    if (orgId) {
      rows = await orgNotif_obj_.read(null, {
        where: { org_id: orgId,type:"pending" },
        order: [['createdAt', 'DESC']],
        limit: 30,
      });
      await orgNotif_obj_.update(null, { seen: true }, { where: { org_id: orgId } });
    } else {
      rows = await userNotif_obj_.read(null, {
        where: { user_id: userId },
        order: [['createdAt', 'DESC']],
        limit: 30,
      });

      await userNotif_obj_.update(null, { seen: true }, { where: { user_id: userId } });
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'No notifications yet' });
    }
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;
