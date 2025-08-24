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

const teams=require('../../../module/Entities/teams')(client, DataTypes)
const leaders=require('../../../module/Entities/teamLeaders')(client, DataTypes)
const members=require('../../../module/Entities/members')(client, DataTypes)
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
const teamObj=new Collection(teams)
const leaderObj=new Collection(leaders)
const memberObj=new Collection(members)


// User - Leader
user.hasOne(leaders, { foreignKey: 'acc_id' });
leaders.belongsTo(user, { foreignKey: 'acc_id' });

// Org - leaders
org.hasMany(leaders, { foreignKey: 'org_id' });
leaders.belongsTo(org, { foreignKey: 'org_id' });

// leaders - Team
leaders.hasOne(teams, { foreignKey: 'leader_id' });
teams.belongsTo(leaders, { foreignKey: 'leader_id' });

// org - teams
org.hasMany(teams, { foreignKey: 'org_id' });
teams.belongsTo(org, { foreignKey: 'org_id' });

// teams - Member
teams.hasMany(members, { foreignKey: 'team_id' });
members.belongsTo(teams, { foreignKey: 'team_id' });

// user - members
user.hasMany(members, { foreignKey: 'acc_id' });
members.belongsTo(user, { foreignKey: 'acc_id' });

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

  teamCollection:teamObj,
  leaderCollection:leaderObj,
  memberCollection:memberObj,
};
