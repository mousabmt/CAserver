const {Sequelize,DataTypes } = require('sequelize');
const db_url=process.env.NODE_ENV==='test'? 'sqlite::memory:':process.env.DATABASE_URL;
let sequelizeOptions=process.env.NODE_ENV==='production'?{
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // This is important for Heroku
    }
  }
}:{};
const client = new Sequelize(db_url,sequelizeOptions);
const user = require('./routes/models/userModel/user');
const org = require('./routes/models/orgModel/org');

module.exports = {
  db: client,
  Org: org(client, DataTypes),
  User: user(client, DataTypes),
};