const sql = require("mssql");

const config = {
  server: process.env.DB_SERVER,                 // localhost
  port: Number(process.env.DB_PORT || 1433),     // 1433
  user: process.env.DB_USER,                     // Blanco
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,                 // login_web
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERT === "true"
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool;

async function getPool() {
  if (pool) return pool;
  pool = await sql.connect(config);
  return pool;
}

module.exports = { sql, getPool };
