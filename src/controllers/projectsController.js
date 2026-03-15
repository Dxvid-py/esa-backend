const pool = require("../config/database");

// GET /api/projects
const getAll = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.name AS client_name, c.email AS client_email,
        COALESCE(SUM(pay.amount) FILTER (WHERE pay.payment_status = 'paid'), 0) AS paid_amount
       FROM projects p
       JOIN clients c ON c.id = p.client_id
       LEFT JOIN payments pay ON pay.project_id = p.id
       GROUP BY p.id, c.name, c.email
       ORDER BY p.created_at DESC`
    );
    res.json({ projects: result.rows });
  } catch (err) { next(err); }
};

// GET /api/projects/:id
const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await pool.query(
      `SELECT p.*, c.name AS client_name, c.email AS client_email, c.phone AS client_phone
       FROM projects p JOIN clients c ON c.id = p.client_id
       WHERE p.id = $1`, [id]
    );
    if (!project.rows.length) return res.status(404).json({ error: "Proyecto no encontrado" });

    const payments  = await pool.query("SELECT * FROM payments WHERE project_id = $1 ORDER BY created_at DESC", [id]);
    const renewals  = await pool.query("SELECT * FROM renewals WHERE project_id = $1 ORDER BY renewal_date ASC", [id]);

    res.json({ project: project.rows[0], payments: payments.rows, renewals: renewals.rows });
  } catch (err) { next(err); }
};

// GET /api/projects/client/:clientId
const getByClient = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const result = await pool.query(
      "SELECT * FROM projects WHERE client_id = $1 ORDER BY created_at DESC", [clientId]
    );
    res.json({ projects: result.rows });
  } catch (err) { next(err); }
};

// POST /api/projects
const create = async (req, res, next) => {
  try {
    const { client_id, project_name, domain, project_type, status, start_date, delivery_date, price, notes } = req.body;
    if (!client_id || !project_name) return res.status(400).json({ error: "client_id y project_name son requeridos" });

    const result = await pool.query(
      `INSERT INTO projects (client_id, project_name, domain, project_type, status, start_date, delivery_date, price, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [client_id, project_name, domain||null, project_type||null, status||"planning", start_date||null, delivery_date||null, price||null, notes||null]
    );
    res.status(201).json({ project: result.rows[0] });
  } catch (err) { next(err); }
};

// PUT /api/projects/:id
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { project_name, domain, project_type, status, start_date, delivery_date, price, notes } = req.body;

    const result = await pool.query(
      `UPDATE projects SET
        project_name  = COALESCE($1, project_name),
        domain        = COALESCE($2, domain),
        project_type  = COALESCE($3, project_type),
        status        = COALESCE($4, status),
        start_date    = COALESCE($5, start_date),
        delivery_date = COALESCE($6, delivery_date),
        price         = COALESCE($7, price),
        notes         = COALESCE($8, notes)
       WHERE id = $9 RETURNING *`,
      [project_name, domain, project_type, status, start_date, delivery_date, price, notes, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Proyecto no encontrado" });
    res.json({ project: result.rows[0] });
  } catch (err) { next(err); }
};

// DELETE /api/projects/:id
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM projects WHERE id = $1 RETURNING id", [id]);
    if (!result.rows.length) return res.status(404).json({ error: "Proyecto no encontrado" });
    res.json({ message: "Proyecto eliminado" });
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, getByClient, create, update, remove };
