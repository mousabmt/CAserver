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

const client = require("./db");
const register = require("./routes/OAUTH/register");
const login=require('./routes/OAUTH/login')
const org = require('./routes/models/orgModel/org');
const auth = require("./middleware/auth");

// Get Methods
const getOrg = async () => {
  const query = `select * from organizations`;
  const result = await client.query(query);
  dataStore.orgData = result.rows;
  
};
app.get('/org', (req, res) => {
  res.json(dataStore.orgData);
});

// Routers
app.use('/register', register);
app.use('/login',login)
app.use(auth)
app.use('/org', org(dataStore)); 


async function start(PORT) {
  try {
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