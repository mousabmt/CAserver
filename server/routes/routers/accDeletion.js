const auth = require('../../middleware/auth');
const router = require('express').Router();
const { param, validationResult } = require('express-validator');
const { userCollection, orgCollection } = require('../../db');

router.delete(
  '/:account_id',
  auth,
  [
    param('account_id')
      .isInt({ min: 1 })
      .withMessage('Account ID must be a positive integer')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { account_id } = req.params;

    try {
      // Attempt to delete from userCollection
      const user = await userCollection.read(account_id);
      if (user) {
        await userCollection.delete(account_id);
        return res.status(200).json({ message: 'User account deleted successfully.' });
      }

      // Attempt to delete from orgCollection
      const org = await orgCollection.read(account_id);
      if (org) {
        await orgCollection.delete(account_id);
        return res.status(200).json({ message: 'Organization account deleted successfully.' });
      }

      // Not found in either
      return res.status(404).json({ error: 'Account not found.' });

    } catch (error) {
      console.error('Account deletion error:', error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

module.exports = router;
