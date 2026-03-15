const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

pool.on("error", (err) => {
  console.error("Error inesperado en PostgreSQL", err);
});

// AUTO-MIGRACIÓN: crea las tablas automáticamente si no existen
async function runMigrations() {
  try {
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");
    await pool.query(schema);
    console.log("✅ Tablas verificadas/creadas correctamente");
  } catch (err) {
    console.error("❌ Error al crear tablas:", err.message);
  }
}

runMigrations();

module.exports = pool;