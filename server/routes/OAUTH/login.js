const client = require("../../db");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/", async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const result = await client.query("select * from users where email=$1", [
      email,
    ]);
    console.log(result.rows[0]);

    if (!result.rows[0]) {
      throw "Email Doesn't Exist";
    }
    const hashedpswrd = await bcrypt.compare(
      password,
      result.rows[0].hashed_password
    );
    if (!hashedpswrd) throw "Wrong Password";
    const accessJWT = jwt.sign(
      {
        email: result.rows[0].email,
        _id: result.rows[0].id,
      },
      process.env.MY_SECRET_KEY,
      {
        expiresIn: "24h",
      }
    );
    res.status(201).json(accessJWT);
  } catch (error) {
    console.log(error);
  }
});
module.exports = router;
