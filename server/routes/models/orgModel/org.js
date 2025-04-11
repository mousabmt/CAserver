module.exports = (dataStore) => {
    const express = require('express');
    const router = express.Router();
    const client = require('../../../db');
  
    router.post('/', (req, res) => {
      const { name, description, location,link } = req.body;
      const sql = 'insert into organizations(name,description,location,link) values($1,$2,$3,$4) returning *';
      
      client.query(sql, [name, description, location,link])
        .then((data) => {
          res.json(data.rows[0]);
          dataStore.orgData.push(data.rows[0]);
        })
        .catch(err => {
          console.error(err);
          res.status(500).json({ error: 'Internal server error' });
        });
    });
  
    return router;
  };