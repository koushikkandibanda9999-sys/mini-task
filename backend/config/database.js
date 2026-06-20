const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "koushik",
  database: "taskmanager",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+00:00",
});

// Test connection on startup
pool.getConnection()
  .then((conn) => {
    console.log("✅ MySQL connected to 'taskmanager'");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ MySQL connection failed:", err.message);
    process.exit(1);
  });

module.exports = pool;
