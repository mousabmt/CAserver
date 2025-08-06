'use strict';
require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
app.use(express.json());
app.use(cors());
const limiter=require('express-rate-limit');
const rateLimiter = limiter({
  windowMs: 1 * 60 * 1000, // 1min
  max: 10 // limit each IP to 10 requests per windowMs
});


const register = require("./routes/OAUTH/register");
const login=require('./routes/OAUTH/login')
const resetCode = require('./routes/OAUTH/resetCode');
const passwordReset=require('./routes/OAUTH/passwordReset')
const auth = require("./middleware/auth");
const accDeletion=require('./routes/routers/accDeletion')
const { db, User } = require('./db');
const usersData=require('./routes/routers/usersData')
const { Org } = require('./db'); 
const organizationMemebers=require('./routes/routers/organizationMembers')
const joinReqs = require("./routes/routers/joinReqs");

// Get Methods
app.get('/orgs', async (req, res) => {
  const orgs = await Org.findAll({where: { is_private: false } });
  if (!orgs || orgs.length === 0) {
res.status(404).json({ error: 'No public organizations found' });
    return;
  }
  res.status(200).json({orgs});
});
app.use('/users',usersData)

app.use((req, res, next) => {
  if (req.method === 'POST') {
    rateLimiter(req, res, next);
  } else {
    next();
  }
});
// Routers
app.use('/register', register);
app.use('/login',login)
app.use('/resetCode',resetCode);
app.use('/password-reset',passwordReset)
app.use(auth)
app.get('/auth',(req,res)=>{
  return res.status(200).json({
    message:'authorized'
  })
})
app.use('/join-req',joinReqs)
app.use('/delete',accDeletion)
app.use('/members-tasks',organizationMemebers)
async function start(PORT) {
  try {
    await db.sync({alter:true})
    app.listen(PORT, () => { 
      console.log(`Up and Running On Port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  app,
  start
};