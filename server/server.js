'use strict';
require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
app.use(express.json());
app.use(cors());

// Create a data store object
const dataStore = {
  orgData: []
};

const register = require("./routes/OAUTH/register");
const login=require('./routes/OAUTH/login')
const auth = require("./middleware/auth");
const { db } = require('./db');
// Get Methods
const { Org } = require('./db'); 

const getOrg = async () => {
  const orgs = await Org.findAll({where: { is_private: false } });
  if (!orgs || orgs.length === 0) {
    console.log("No organizations found in the database.");
    return;
  }
  dataStore.orgData = orgs.map(org => org.get({ plain: true }));
};

// Routers
app.use('/register', register(dataStore));
app.use('/login',login)
// app.use(auth)
app.get('/org', (req, res) => {
  res.json(dataStore.orgData);
});


async function start(PORT) {
  try {
    await db.sync({alter:true})
    await getOrg();
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