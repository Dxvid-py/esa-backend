const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);

  if (err.code === "23505") {
    return res.status(409).json({ error: "Ya existe un registro con ese valor único (email, dominio, etc.)" });
  }
  if (err.code === "23503") {
    return res.status(400).json({ error: "El registro relacionado no existe" });
  }

  res.status(err.status || 500).json({
    error: err.message || "Error interno del servidor",
  });
};

module.exports = errorHandler;
