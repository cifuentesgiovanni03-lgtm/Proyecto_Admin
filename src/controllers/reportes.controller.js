const reporteModel = require("../models/reporte.model");
const { guardarReporteGenerado } = require("../services/reportes.service");

async function reporteTransacciones(req, res) {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    const rows = await reporteModel.getTransaccionesByDateRange(fecha_inicio, fecha_fin);

    await guardarReporteGenerado({
      tipo_reporte: "TRANSACCIONES_POR_FECHA",
      formato: "JSON",
      usuario_id: req.usuario.id_usuario,
      parametros: { fecha_inicio, fecha_fin }
    });

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function reporteClientes(req, res) {
  try {
    const rows = await reporteModel.getClientesConCuentas();

    await guardarReporteGenerado({
      tipo_reporte: "CLIENTES",
      formato: "JSON",
      usuario_id: req.usuario.id_usuario,
      parametros: {}
    });

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function resumenSaldos(req, res) {
  try {
    const rows = await reporteModel.getResumenSaldos();

    await guardarReporteGenerado({
      tipo_reporte: "RESUMEN_SALDOS",
      formato: "JSON",
      usuario_id: req.usuario.id_usuario,
      parametros: {}
    });

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  reporteTransacciones,
  reporteClientes,
  resumenSaldos
};
