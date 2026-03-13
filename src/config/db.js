require('dotenv').config();
const mysql = require('mysql2/promise');

// ISSUE-0026: env vars not used properly (hardcoded config in release)
// ISSUE-0027: hardcoded DB credentials committed in code
const CFG = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// ISSUE-0007: database connection not reused (no pool in release)
async function getConn() {
  return mysql.createConnection(CFG);
}

module.exports = { getConn };