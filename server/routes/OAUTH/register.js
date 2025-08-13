const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { User, Org, userCollection, orgCollection } = require('../models/lib/db');

const router = express.Router();

router.post(
  '/registerUser',
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),

    body('username')
      .trim()
      .notEmpty().withMessage('Username is required').matches(/^[A-Za-z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores (no spaces or other special characters)'),

    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .isLength({ min: 10, max: 50 }).withMessage('Email must be between 10 and 50 characters'),

    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

    body('bio').optional().trim().escape(),
    body('phone').optional().trim().escape(),
    body('profile_picture').optional().isURL().withMessage('Profile picture must be a valid URL'),
    body('role_title').optional().trim().escape(),
    body('location').optional().trim().escape(),
    body('skills').optional().isString().withMessage('Skills must be String')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
      const {
        name, username, email, password, bio,
        phone, profile_picture, role_title, location, skills
      } = req.body;

      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) {
        return res.status(409).json({ error: 'Username already exists' });
      }

      const hashed_password = await bcrypt.hash(password, 5);

      const newUser = await userCollection.create({
        name,
        username,
        email,
        hashed_password,
        role: 'user',
        organization_id: null,
        bio,
        phone,
        profile_picture,
        role_title,
        location,
        skills
      });

      const userResponse = {
        acc_id: newUser.acc_id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        organization_id: newUser.organization_id
      };

      res.status(201).json(userResponse);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

router.post(
  '/registerOrg',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email')
      .trim()
      .isEmail().withMessage('Valid email is required')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('description').optional().trim().escape(),
    body('location').optional().trim().escape(),
    body('is_private').optional().isBoolean().withMessage('is_private must be boolean'),
    body('website').optional().isURL().withMessage('Website must be a valid URL'),
    body('phone').optional().trim().escape(),
    body('logo').optional().isURL().withMessage('Logo must be a valid URL')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
      const {
        name, email, password, description,
        location, is_private, website, phone, logo
      } = req.body;

      const existingOrg = await orgCollection.read(null, { where: { email } });
      if (existingOrg.length > 0) {
        return res.status(409).json({ error: 'Email already registered for an organization' });
      }

      const hashed_password = await bcrypt.hash(password, 5);

      const newOrg = await orgCollection.create({
        name,
        email,
        hashed_password,
        description,
        location,
        is_private: is_private ?? false,
        website,
        phone,
        logo
      });

      if (!newOrg) {
        return res.status(500).json({ error: 'Failed to create organization' });
      }

      const { hashed_password: _, ...orgData } = newOrg.dataValues;
      res.status(201).json(orgData);
    } catch (error) {
      console.error('Error creating organization:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
