const pool = require("../config/database");

// GET /api/dashboard
const getStats = async (req, res, next) => {
  try {
    const [
      totalClients,
      totalProjects,
      pendingPayments,
      upcomingRenewals,
      revenueMonth,
      revenueYear,
      projectsByStatus,
      recentClients
    ] = await Promise.all([
      // Total clientes
      pool.query("SELECT COUNT(*) AS total FROM clients"),

      // Total proyectos
      pool.query("SELECT COUNT(*) AS total FROM projects"),

      // Pagos pendientes (monto total)
      pool.query(
        `SELECT COUNT(*) AS count, COALESCE(SUM(amount),0) AS total
         FROM payments WHERE payment_status IN ('pending','overdue')`
      ),

      // Renovaciones próximas 30 días
      pool.query(
        `SELECT COUNT(*) AS count FROM renewals
         WHERE renewal_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
         AND status = 'pending'`
      ),

      // Ingresos este mes
      pool.query(
        `SELECT COALESCE(SUM(amount),0) AS total FROM payments
         WHERE payment_status = 'paid'
         AND DATE_TRUNC('month', payment_date) = DATE_TRUNC('month', CURRENT_DATE)`
      ),

      // Ingresos este año
      pool.query(
        `SELECT COALESCE(SUM(amount),0) AS total FROM payments
         WHERE payment_status = 'paid'
         AND DATE_TRUNC('year', payment_date) = DATE_TRUNC('year', CURRENT_DATE)`
      ),

      // Proyectos por estado
      pool.query(
        `SELECT status, COUNT(*) AS count FROM projects GROUP BY status ORDER BY count DESC`
      ),

      // Clientes recientes
      pool.query(
        `SELECT id, name, email, phone, created_at FROM clients ORDER BY created_at DESC LIMIT 5`
      )
    ]);

    res.json({
      total_clients:      parseInt(totalClients.rows[0].total),
      total_projects:     parseInt(totalProjects.rows[0].total),
      pending_payments: {
        count:  parseInt(pendingPayments.rows[0].count),
        amount: parseFloat(pendingPayments.rows[0].total)
      },
      upcoming_renewals:  parseInt(upcomingRenewals.rows[0].count),
      revenue_this_month: parseFloat(revenueMonth.rows[0].total),
      revenue_this_year:  parseFloat(revenueYear.rows[0].total),
      projects_by_status: projectsByStatus.rows,
      recent_clients:     recentClients.rows
    });
  } catch (err) { next(err); }
};

module.exports = { getStats };
