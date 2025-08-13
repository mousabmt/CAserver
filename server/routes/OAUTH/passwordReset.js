const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { PasswordReset, orgCollection, userCollection } = require('../models/lib/db');
const bcrypt = require('bcryptjs');
// check OTP
router.post(
  '/checkOTP',
  body('otp')
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 characters')
    .matches(/^\d{6}$/)
    .withMessage('OTP must contain only numeric digits'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, otp } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
      const otpQuery = await PasswordReset.read(null, { where: { email } });
      if (!otpQuery || otpQuery.length === 0) {
        return res.status(404).json({ error: 'OTP not found for the provided email' });
      }

      const validOTP = otpQuery.find(
        (entry) => entry.otp === otp && new Date(entry.expires_at) > new Date()
      );

      if (!validOTP) {
        return res.status(400).json({
          error: 'OTP is expired or invalid',
        });
      }

      return res.status(200).json({ message: 'OTP is valid' });
    } catch (err) {
      console.error('Error checking OTP:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

//   reset the password
router.post(
  '/reset',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),

    body('newPass')
      .isLength({ min: 8, max: 30 })
      .withMessage('Your password should contain at least 8 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { email, otp, newPass } = req.body;

      const otpQuery = await PasswordReset.read(null, { where: { email } });
      if (!otpQuery || otpQuery.length === 0) {
        return res.status(404).json({ error: 'Email not found' });
      }

      const validOTP = otpQuery.find(
        (entry) => entry.otp === otp && new Date(entry.expires_at) > new Date()
      );

      if (!validOTP) {
        return res.status(400).json({
          error: 'OTP code is expired or entered incorrectly, please try again',
        });
      }

      const users = await userCollection.read(null, { where: { email } });
      const orgs = await orgCollection.read(null, { where: { email } });

      const user = users.length > 0 ? users[0] : orgs.length > 0 ? orgs[0] : null;
      if (!user) {
        return res.status(404).json({ error: 'Account not found' });
      }

      const hashedPassword = await bcrypt.hash(newPass, 5);
      const updateData = { hashed_password: hashedPassword };

      if (users.length > 0) {
        await userCollection.update(user.acc_id, updateData);
      } else if (orgs.length > 0) {
        await orgCollection.update(user.org_id, updateData);
      }

      return res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
      console.error('Error resetting password:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
