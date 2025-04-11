const express = require("express");
const router = express();
const client = require("../../../db");
// router.post("/", (req, res) => {
//   const { name, email, hashed_password, role, org_id } = req.body;
//   const sql = `insert into users(name,
//     email,
//     hashed_password,
//     role,
//     org_id ) values($1,$2,$3,$4,$5) returning *`;
//     client.query(sql,[name, email, hashed_password, role, org_id])
// });
router.put('/:user_id/:org_id',(req,res)=>{
    const {org_id}=req.params;
    const {user_id}=req.params;
    const sql = 'update users set org_id = $1 where user_id = $2 returning *';
    client.query(sql,[org_id,user_id]).then((result)=>{
        res.status(201).json(result.rows)
    })

})
module.exports=router