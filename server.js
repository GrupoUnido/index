require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const { getPool, sql } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir el frontend
app.use(express.static(path.join(__dirname, "public")));

// Ruta test
app.get("/api/health", async (req, res) => {
  try {
    const pool = await getPool();
    const r = await pool.request().query("SELECT 1 AS ok");
    res.json({ ok: true, db: r.recordset[0] });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * TABLA (si no existe)
 * Ejecuta esto una vez en SQL:
 *
 * CREATE TABLE dbo.users (
 *   id INT IDENTITY(1,1) PRIMARY KEY,
 *   username NVARCHAR(80) NOT NULL UNIQUE,
 *   email NVARCHAR(200) NOT NULL UNIQUE,
 *   password_hash NVARCHAR(200) NOT NULL,
 *   role NVARCHAR(20) NOT NULL DEFAULT 'user',
 *   created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
 * );
 */

// REGISTRO
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ ok: false, msg: "Faltan datos." });
    }

    const pool = await getPool();

    // Verificar si existe usuario/email
    const exists = await pool.request()
      .input("username", sql.NVarChar, username)
      .input("email", sql.NVarChar, email)
      .query(`
        SELECT TOP 1 id
        FROM dbo.users
        WHERE username = @username OR email = @email
      `);

    if (exists.recordset.length > 0) {
      return res.status(409).json({ ok: false, msg: "Usuario o correo ya existe." });
    }

    const password_hash = await bcrypt.hash(password, 10);

    await pool.request()
      .input("username", sql.NVarChar, username)
      .input("email", sql.NVarChar, email)
      .input("password_hash", sql.NVarChar, password_hash)
      .query(`
        INSERT INTO dbo.users (username, email, password_hash)
        VALUES (@username, @email, @password_hash)
      `);

    res.json({ ok: true, msg: "✅ Usuario registrado." });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

// LOGIN (por username o email)
app.post("/api/login", async (req, res) => {
  try {
    const { userOrEmail, password } = req.body;

    if (!userOrEmail || !password) {
      return res.status(400).json({ ok: false, msg: "Faltan datos." });
    }

    const pool = await getPool();
    const user = await pool.request()
      .input("value", sql.NVarChar, userOrEmail)
      .query(`
        SELECT TOP 1 id, username, email, password_hash, role
        FROM dbo.users
        WHERE username = @value OR email = @value
      `);

    if (user.recordset.length === 0) {
      return res.status(401).json({ ok: false, msg: "Usuario/correo no encontrado." });
    }

    const row = user.recordset[0];
    const match = await bcrypt.compare(password, row.password_hash);

    if (!match) {
      return res.status(401).json({ ok: false, msg: "Contraseña incorrecta." });
    }

    // Por ahora devolvemos datos básicos (luego podemos usar JWT si quieres)
    res.json({
      ok: true,
      msg: "✅ Login correcto.",
      user: { id: row.id, username: row.username, email: row.email, role: row.role }
    });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor listo: http://localhost:${PORT}`);
});
