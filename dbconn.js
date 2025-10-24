const mysql = require('mysql2');

// ใช้ค่า Environment Variables จาก Railway
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.MYSQLHOST,       // mysql.railway.internal
  user: process.env.MYSQLUSER,       // root
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE, // railway
  port: process.env.MYSQLPORT || 3306
});

module.exports = pool;
