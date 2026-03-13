const mysql = require('mysql2/promise');

// ISSUE-0026: env vars not used properly (hardcoded config in release)
// ISSUE-0027: hardcoded DB credentials committed in code
const CFG = {
  host: '127.0.0.1',
  port: 3306,
  user: 'store_user',
  password: 'store_pass',
  database: 'store_db',
};

// ISSUE-0007: database connection not reused (no pool in release)
//(FIXED)
const pool = mysql.createPool({
  ...CFG,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function getConn() {
  return pool;
}

module.exports = { getConn };
