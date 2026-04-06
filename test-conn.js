require("dotenv").config();
const { getPool } = require("./db");

(async () => {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT 1 AS ok");
    console.log("✅ Conectado:", result.recordset);
    process.exit(0);
  } catch (e) {
    console.error("❌ Error conexión:", e);
    process.exit(1);
  }
})();
