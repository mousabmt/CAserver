// __test__/teardown.js
const { db } = require('../server/db');

module.exports = async () => {
    console.log('Global tear down after all tests');

  await db.close();
};
