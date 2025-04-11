const express = require("express");
const router = express();
const client=require('../../db')
const bcrypt = require("bcryptjs");
router.post("/", async (req, res) => {
try {
    const { name, email, hashed_password, role, org_id } = req.body;
    const sql = `insert into users(name,
      email,
      hashed_password,
      role,
      org_id ) values($1,$2,$3,$4,$5) returning *`;
   const emailExists= client.query(`select email from users where email=$1`, [email])
   if(emailExists.rows) throw ('Email already exists')
    const pswrd = await bcrypt.hash(hashed_password, 3);
    
    client
      .query(sql, [name, email, pswrd, role, org_id])
      .then((data) => res.status(202).json(data.rows[0]));
} catch (error) {
    console.log(error);
    
}
});
// "name":"mousab tamari",
//    "email":"mousabtamari0799@gmail.com",
//     "hashed_password":"qvolm-MT99",
//    "role":"member",
//    "org_id":null
module.exports = router;
