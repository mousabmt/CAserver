const { Sequelize, DataTypes } = require('sequelize');

let client;

if (process.env.NODE_ENV === 'test') {
  client = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  });
} else if (process.env.NODE_ENV === 'production') {
  client = new Sequelize(process.env.DATABASE_URL, {
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false }
    },
    logging:false
  },
);
} else {
client = new Sequelize(process.env.DATABASE_URL, {
  logging: false
});}

const user = require('./routes/models/userModel/user')(client, DataTypes);
const org = require('./routes/models/orgModel/org')(client, DataTypes);
const joinReq = require('./routes/models/join_req/joining_reqs')(client, DataTypes);
const PasswordResetModel = require('./routes/models/passwordModel/passwordReset')(client, DataTypes);

const Collection = require('./routes/models/lib/collection');

const orgObj = new Collection(org);
const userObj = new Collection(user);
const joinReqObj = new Collection(joinReq);
const PasswordResetObj = new Collection(PasswordResetModel);

joinReq.belongsTo(user, { foreignKey: 'acc_id' });

org.hasMany(joinReq, { foreignKey: 'org_id' });
joinReq.belongsTo(org, { foreignKey: 'org_id' });

module.exports = {
  db: client,
  Org: org,
  User: user,
  joinReq,
  passReset: PasswordResetModel,
  orgCollection: orgObj,
  userCollection: userObj,
  joinReqCollection: joinReqObj,
  PasswordReset: PasswordResetObj,
};
