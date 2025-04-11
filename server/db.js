const { Client } = require("pg");
const client = new Client(process.env.DATABASE_URL);

(async () => {
  try {
    await client.connect().then(()=>
      console.log("Database connected successfully")
    
    )
  } catch (error) {
    console.error("Database connection error:", error.message);
    process.exit(1);
  }
})();

module.exports = client;