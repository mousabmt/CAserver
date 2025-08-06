const { Org, User, joinReq, db } = require('../db');  

module.exports = async () => {
  try {
    await db.authenticate();
    await Org.sync({ force: true });     // sync org first
    await User.sync({ force: true });
    await joinReq.sync({ force: true }); // sync joinReq last
    console.log('Test DB synced successfully');
  } catch (error) {
    console.error('Failed to sync DB:', error);
    throw error; // make sure Jest knows setup failed
  }
};
