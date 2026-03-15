const pool = require("../config/database");

// GET /api/clients
const getAll = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT c.*, 
        COUNT(DISTINCT p.id) AS project_count,
        COUNT(DISTINCT CASE WHEN pay.payment_status = 'pending' OR pay.payment_status = 'overdue' THEN pay.id END) AS pending_payments
       FROM clients c
       LEFT JOIN projects p ON p.client_id = c.id
       LEFT JOIN payments pay ON pay.project_id = p.id
       GROUP BY c.id
       ORDER BY c.created_at DESC`
    );
    res.json({ clients: result.rows });
  } catch (err) { next(err); }
};

// GET /api/clients/:id
const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const client = await pool.query("SELECT * FROM clients WHERE id = $1", [id]);
    if (!client.rows.length) return res.status(404).json({ error: "Cliente no encontrado" });

    const projects = await pool.query(
      "SELECT * FROM projects WHERE client_id = $1 ORDER BY created_at DESC", [id]
    );

    res.json({ client: client.rows[0], projects: projects.rows });
  } catch (err) { next(err); }
};

// POST /api/clients
const create = async (req, res, next) => {
  try {
    const { name, email, phone, company, notes } = req.body;
    if (!name || !email) return res.status(400).json({ error: "Nombre y email son requeridos" });

    const result = await pool.query(
      "INSERT INTO clients (name, email, phone, company, notes) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [name, email.toLowerCase(), phone || null, company || null, notes || null]
    );
    res.status(201).json({ client: result.rows[0] });
  } catch (err) { next(err); }
};

// PUT /api/clients/:id
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, company, notes } = req.body;

    const result = await pool.query(
      `UPDATE clients SET 
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        phone = COALESCE($3, phone),
        company = COALESCE($4, company),
        notes = COALESCE($5, notes)
       WHERE id = $6 RETURNING *`,
      [name, email?.toLowerCase(), phone, company, notes, id]
    );

    if (!result.rows.length) return res.status(404).json({ error: "Cliente no encontrado" });
    res.json({ client: result.rows[0] });
  } catch (err) { next(err); }
};

// DELETE /api/clients/:id
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM clients WHERE id = $1 RETURNING id", [id]);
    if (!result.rows.length) return res.status(404).json({ error: "Cliente no encontrado" });
    res.json({ message: "Cliente eliminado correctamente" });
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, remove };
