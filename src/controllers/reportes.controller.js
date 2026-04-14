const pool = require("../config/mysql");
const { guardarReporteGenerado } = require("../services/reportes.service");

async function reporteTransacciones(req, res) {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    const [rows] = await pool.query(
      `SELECT
          t.id_transaccion,
          t.monto,
          t.moneda,
          t.descripcion,
          t.estado,
          t.fecha_transaccion,
          tt.nombre AS tipo_transaccion
       FROM transacciones t
       INNER JOIN tipos_transaccion tt
         ON t.id_tipo_transaccion = tt.id_tipo_transaccion
       WHERE DATE(t.fecha_transaccion) BETWEEN ? AND ?
       ORDER BY t.fecha_transaccion DESC`,
      [fecha_inicio, fecha_fin]
    );

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
    const [rows] = await pool.query(
      `SELECT
          c.id_cliente,
          c.nombres,
          c.apellidos,
          c.dpi,
          c.correo,
          c.telefono,
          COUNT(ct.id_cuenta) AS total_cuentas
       FROM clientes c
       LEFT JOIN cuentas ct ON c.id_cliente = ct.id_cliente
       GROUP BY c.id_cliente
       ORDER BY c.id_cliente DESC`
    );

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
    const [rows] = await pool.query(
      `SELECT
          c.id_cuenta,
          c.numero_cuenta,
          c.saldo,
          c.moneda,
          c.estado,
          cl.nombres,
          cl.apellidos
       FROM cuentas c
       INNER JOIN clientes cl ON c.id_cliente = cl.id_cliente
       ORDER BY c.saldo DESC`
    );

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