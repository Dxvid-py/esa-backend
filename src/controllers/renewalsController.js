const pool = require("../config/database");

// GET /api/renewals — próximas renovaciones
const getUpcoming = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT r.*, p.project_name, p.domain, c.name AS client_name, c.email AS client_email, c.phone AS client_phone
       FROM renewals r
       JOIN projects p ON p.id = r.project_id
       JOIN clients c ON c.id = p.client_id
       WHERE r.renewal_date >= CURRENT_DATE
       ORDER BY r.renewal_date ASC`
    );
    res.json({ renewals: result.rows });
  } catch (err) { next(err); }
};

// GET /api/renewals/all
const getAll = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT r.*, p.project_name, p.domain, c.name AS client_name, c.email AS client_email
       FROM renewals r
       JOIN projects p ON p.id = r.project_id
       JOIN clients c ON c.id = p.client_id
       ORDER BY r.renewal_date DESC`
    );
    res.json({ renewals: result.rows });
  } catch (err) { next(err); }
};

// POST /api/renewals
const create = async (req, res, next) => {
  try {
    const { project_id, renewal_type, renewal_price, renewal_date, notes } = req.body;
    if (!project_id || !renewal_date) return res.status(400).json({ error: "project_id y renewal_date son requeridos" });

    const result = await pool.query(
      `INSERT INTO renewals (project_id, renewal_type, renewal_price, renewal_date, notes)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [project_id, renewal_type||"full", renewal_price||null, renewal_date, notes||null]
    );
    res.status(201).json({ renewal: result.rows[0] });
  } catch (err) { next(err); }
};

// PUT /api/renewals/:id
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { renewal_type, renewal_price, renewal_date, status, notes } = req.body;

    const result = await pool.query(
      `UPDATE renewals SET
        renewal_type  = COALESCE($1, renewal_type),
        renewal_price = COALESCE($2, renewal_price),
        renewal_date  = COALESCE($3, renewal_date),
        status        = COALESCE($4, status),
        notes         = COALESCE($5, notes)
       WHERE id = $6 RETURNING *`,
      [renewal_type, renewal_price, renewal_date, status, notes, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Renovación no encontrada" });
    res.json({ renewal: result.rows[0] });
  } catch (err) { next(err); }
};

// PATCH /api/renewals/:id/paid
const markPaid = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE renewals SET status = 'paid' WHERE id = $1 RETURNING *", [id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Renovación no encontrada" });
    res.json({ renewal: result.rows[0] });
  } catch (err) { next(err); }
};

module.exports = { getAll, getUpcoming, create, update, markPaid };
