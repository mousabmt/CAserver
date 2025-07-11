const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../../db');  
const { Org } = require('../../db');  

const router = express.Router();
module.exports = (dataStore) => {
router.post('/registerUser', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashed_password = await bcrypt.hash(password, 5);
    const newUser = await User.create({
      name,
      email,
      hashed_password,
      role: 'member',           
      join_request_status: 'none',
      organization_id: null,
      join_request_org_id: null,
      total_cb: 0
    });

    const userResponse = {
      acc_id: newUser.acc_id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      organization_id: newUser.organization_id
    };

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }

})
router.post('/registerOrg', async (req, res) => {
  const { name, email,password, description, location, is_private, link } = req.body;
const hashed_password = await bcrypt.hash(password, 5);
  const existingOrg = await Org.findOne({ where: { email } });
  if (existingOrg) {
    return res.status(409).json({ error: 'Email already registered for an organization' });
  }
  if (!name || !email || !hashed_password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const newOrg = await Org.create({
      name,
      email,
      hashed_password,
      description,
      location,
      is_private,
      link,
    });
    dataStore.orgData.push(newOrg.get({ plain: true }));
    res.status(201).json(newOrg.get({ plain: true }));
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
})
return router;
};