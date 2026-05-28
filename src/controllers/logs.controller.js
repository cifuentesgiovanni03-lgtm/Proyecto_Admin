const { getMongoDb } = require("../config/mongodb");

async function listarLogs(req, res) {
  try {
    const db = getMongoDb();
    const { nivel, modulo, limite } = req.query;
    const filter = {};
    if (nivel) filter.nivel = nivel;
    if (modulo) filter.modulo = { $regex: modulo, $options: "i" };

    const rows = await db.collection("logs_sistema")
      .find(filter)
      .sort({ fecha: -1 })
      .limit(Number(limite) || 100)
      .toArray();

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function listarAuditoria(req, res) {
  try {
    const db = getMongoDb();
    const { entidad, accion, limite } = req.query;
    const filter = {};
    if (entidad) filter.entidad = { $regex: entidad, $options: "i" };
    if (accion) filter.accion = { $regex: accion, $options: "i" };

    const rows = await db.collection("auditoria")
      .find(filter)
      .sort({ fecha: -1 })
      .limit(Number(limite) || 100)
      .toArray();

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function listarReportesGenerados(req, res) {
  try {
    const db = getMongoDb();
    const { tipo_reporte, limite } = req.query;
    const filter = {};
    if (tipo_reporte) filter.tipo_reporte = { $regex: tipo_reporte, $options: "i" };

    const rows = await db.collection("reportes_generados")
      .find(filter)
      .sort({ fecha_generacion: -1 })
      .limit(Number(limite) || 50)
      .toArray();

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  listarLogs,
  listarAuditoria,
  listarReportesGenerados
};
