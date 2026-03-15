const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son requeridos" });
    }

    const result = await pool.query("SELECT * FROM admins WHERE email = $1", [email.toLowerCase()]);
    const admin = result.rows[0];

    if (!admin) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/register (solo para crear la primera cuenta del equipo)
const register = async (req, res, next) => {
  try {
    const { name, email, password, secret } = req.body;

    // Clave secreta para crear admins — la defines en tu .env
    if (secret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ error: "Clave secreta incorrecta" });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nombre, email y contraseña son requeridos" });
    }

    const hashed = await bcrypt.hash(password, 12);
    const result = await pool.query(
      "INSERT INTO admins (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email.toLowerCase(), hashed]
    );

    res.status(201).json({ admin: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const me = async (req, res) => {
  res.json({ admin: req.admin });
};

module.exports = { login, register, me };
