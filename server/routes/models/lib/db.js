const { Sequelize, DataTypes } = require('sequelize');

let client;
if (process.env.NODE_ENV === 'test') {
  client = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });
} else if (process.env.NODE_ENV === 'production') {
  client = new Sequelize(process.env.DATABASE_URL, {
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
    logging: false,
  });
} else {
  client = new Sequelize(process.env.DATABASE_URL, { logging: false });
}

const user  = require('../../../module/userModel/user')(client, DataTypes);
const org   = require('../../../module/orgModel/org')(client, DataTypes);
const joinReq = require('../../../module/join_req/joining_reqs')(client, DataTypes);
const PasswordResetModel = require('../../../module/passwordModel/passwordReset')(client, DataTypes);

// ✅ correct requires
const userNotifications = require('../../../module/notificationsModel/userNotifications')(client, DataTypes);
const orgNotifications  = require('../../../module/notificationsModel/orgNotifications')(client, DataTypes);

const Collection = require('./collection');

const orgObj   = new Collection(org);
const userObj  = new Collection(user);
const joinReqObj = new Collection(joinReq);
const PasswordResetObj = new Collection(PasswordResetModel);
const userNotif = new Collection(userNotifications);
const orgNotif  = new Collection(orgNotifications);

joinReq.belongsTo(user, { foreignKey: 'acc_id' });
org.hasMany(joinReq,   { foreignKey: 'org_id' });
joinReq.belongsTo(org, { foreignKey: 'org_id' });

user.hasMany(userNotifications, { foreignKey: 'user_id' });
userNotifications.belongsTo(user, { foreignKey: 'user_id' });

org.hasMany(orgNotifications, { foreignKey: 'org_id' });
orgNotifications.belongsTo(org, { foreignKey: 'org_id' });

user.hasMany(orgNotifications, { foreignKey: 'user_id', as: 'TriggeredOrgNotifications' });
orgNotifications.belongsTo(user, { foreignKey: 'user_id', as: 'Requester' });

module.exports = {
  db: client,
  Org: org,
  User: user,
  joinReq,
  Notifications: userNotifications,
  passReset: PasswordResetModel,

  orgCollection: orgObj,
  userCollection: userObj,
  joinReqCollection: joinReqObj,
  PasswordReset: PasswordResetObj,

  userNotif_obj_: userNotif,
  orgNotif_obj_:  orgNotif,
};
