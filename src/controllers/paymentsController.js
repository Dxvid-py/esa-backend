const pool = require("../config/database");

// GET /api/payments
const getAll = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT pay.*, p.project_name, p.domain, c.name AS client_name, c.email AS client_email
       FROM payments pay
       JOIN projects p ON p.id = pay.project_id
       JOIN clients c ON c.id = p.client_id
       ORDER BY pay.created_at DESC`
    );
    res.json({ payments: result.rows });
  } catch (err) { next(err); }
};

// GET /api/payments/pending
const getPending = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT pay.*, p.project_name, p.domain, c.name AS client_name, c.email AS client_email, c.phone AS client_phone
       FROM payments pay
       JOIN projects p ON p.id = pay.project_id
       JOIN clients c ON c.id = p.client_id
       WHERE pay.payment_status IN ('pending','overdue')
       ORDER BY pay.created_at ASC`
    );
    res.json({ payments: result.rows });
  } catch (err) { next(err); }
};

// POST /api/payments
const create = async (req, res, next) => {
  try {
    const { project_id, amount, payment_status, payment_date, payment_method, notes } = req.body;
    if (!project_id || !amount) return res.status(400).json({ error: "project_id y amount son requeridos" });

    const result = await pool.query(
      `INSERT INTO payments (project_id, amount, payment_status, payment_date, payment_method, notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [project_id, amount, payment_status||"pending", payment_date||null, payment_method||null, notes||null]
    );
    res.status(201).json({ payment: result.rows[0] });
  } catch (err) { next(err); }
};

// PUT /api/payments/:id
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, payment_status, payment_date, payment_method, notes } = req.body;

    const result = await pool.query(
      `UPDATE payments SET
        amount         = COALESCE($1, amount),
        payment_status = COALESCE($2, payment_status),
        payment_date   = COALESCE($3, payment_date),
        payment_method = COALESCE($4, payment_method),
        notes          = COALESCE($5, notes)
       WHERE id = $6 RETURNING *`,
      [amount, payment_status, payment_date, payment_method, notes, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Pago no encontrado" });
    res.json({ payment: result.rows[0] });
  } catch (err) { next(err); }
};

module.exports = { getAll, getPending, create, update };
