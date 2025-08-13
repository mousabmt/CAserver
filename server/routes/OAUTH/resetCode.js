const express = require("express");
const router = express.Router();
const nodemailer = require('nodemailer');
const { PasswordReset, userCollection,orgCollection } = require('../models/lib/db');
const validateEmail = require('../../middleware/validateEmail');
const rateLimiterPerEmail = require('../../middleware/rateLimiterPerEmail');

router.post('/mail', validateEmail, rateLimiterPerEmail, async (req, res) => {
  try {
    const { email } = req.body;
const users = await userCollection.read(null, { where: { email } });
const orgs = await orgCollection.read(null, { where: { email } });

const user = users.length ? users[0] : orgs.length ? orgs[0] : null;
if (!user) return res.status(404).json({ error: 'Email not found' });

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Save to DB

    console.log({ email,
          otp,
          expires_at:new Date(Date.now() + 5 * 60 * 1000),
          used: false});
 await PasswordReset.create({
      email,
      otp,
      expires_at:new Date(Date.now() + 5 * 60 * 1000),
    });

    // Send Email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      logger:true,
      tls: {
  rejectUnauthorized: false
}

    });

const mailOptions = {
  from: `"No Reply" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: 'Reset Your Password',
  text: `Hello ${user.name || 'user'},\n\nYour OTP is: ${otp}. It will expire in 5 minutes.\n\nIf you didn't request this, ignore the message.`,
  html: `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Password Reset Request</h2>
      <p>Hello <strong>${user.name || 'user'}</strong>,</p>
      <p>Your OTP is:</p>
      <h1 style="color: #007bff;">${otp}</h1>
      <p>This code will expire in <strong>5 minutes</strong>.</p>
      <p>If you did not request a password reset, you can ignore this message.</p>
      <br>
      <p>Thanks,<br>Collaboration App Team</p>
    </div>
  `
};


    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: 'Reset code sent successfully' });
  } catch (error) {
    console.error('Reset error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
