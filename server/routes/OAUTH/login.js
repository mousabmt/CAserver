const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { User, userCollection, orgCollection } = require("../../db"); // Using the Sequelize User model

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  try {
    const users=await userCollection.read(null,{where:{email}})
    const orgs=await orgCollection.read(null,{where:{email}})
const user = users.length ? users[0] : orgs.length ? orgs[0] : null;

    if (!user) {
      return res.status(404).json({ error: "Email does not exist" });
    }

    const validPassword = await bcrypt.compare(password, user.hashed_password);
    if (!validPassword) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const token = jwt.sign(
      {
        id: user.acc_id || user.org_id,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id || user.org_id,
        title:user.name
      },
      process.env.MY_SECRET_KEY
    );
    res.status(200).json({
      token,
      user:user
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});

module.exports = router;
