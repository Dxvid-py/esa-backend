require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const authRoutes      = require("./routes/auth");
const clientRoutes    = require("./routes/clients");
const projectRoutes   = require("./routes/projects");
const paymentRoutes   = require("./routes/payments");
const renewalRoutes   = require("./routes/renewals");
const dashboardRoutes = require("./routes/dashboard");
const errorHandler    = require("./middlewares/errorHandler");
const pool            = require("./config/database");

const app  = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARES ──
app.use(cors({
  origin: [
    "https://www.esawebsite.com",
    "https://esawebsite.com",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
  ],
  methods: ["GET","POST","PUT","PATCH","DELETE"],
  allowedHeaders: ["Content-Type","Authorization"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── HEALTH CHECK ──
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "ESA website API funcionando correctamente 🚀",
    version: "1.0.0"
  });
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (e) {
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

// ── ROUTES ──
app.use("/api/auth",      authRoutes);
app.use("/api/clients",   clientRoutes);
app.use("/api/projects",  projectRoutes);
app.use("/api/payments",  paymentRoutes);
app.use("/api/renewals",  renewalRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.path} no encontrada` });
});

// Error handler
app.use(errorHandler);

// ── START ──
app.listen(PORT, () => {
  console.log(`✅ ESA website API corriendo en puerto ${PORT}`);
  console.log(`📊 Dashboard: GET /api/dashboard`);
  console.log(`👥 Clientes:  GET /api/clients`);
  console.log(`📁 Proyectos: GET /api/projects`);
  console.log(`💳 Pagos:     GET /api/payments`);
  console.log(`🔄 Renovaciones: GET /api/renewals`);
});

module.exports = app;
