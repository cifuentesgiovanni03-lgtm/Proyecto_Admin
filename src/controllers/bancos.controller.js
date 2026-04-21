const pool = require("../config/mysql");
const { registrarAuditoria } = require("../services/auditoria.service");

async function listarBancos(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT
          id_banco,
          nombre,
          codigo_banco,
          pais,
          estado,
          fecha_registro
       FROM bancos
       ORDER BY nombre ASC`
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

async function crearBanco(req, res) {
  try {
    const { nombre, codigo_banco, pais } = req.body;

    if (!nombre || !codigo_banco) {
      return res.status(400).json({
        message: "nombre y codigo_banco son obligatorios"
      });
    }

    const [result] = await pool.query(
      `INSERT INTO bancos (nombre, codigo_banco, pais)
       VALUES (?, ?, ?)`,
      [nombre, codigo_banco, pais || "Guatemala"]
    );

    await registrarAuditoria({
      accion: "CREAR_BANCO",
      entidad: "bancos",
      entidad_id: result.insertId,
      usuario_id: req.usuario.id_usuario,
      detalle: {
        nombre,
        codigo_banco,
        pais: pais || "Guatemala"
      }
    });

    res.status(201).json({
      message: "Banco creado correctamente",
      id_banco: result.insertId
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

module.exports = {
  listarBancos,
  crearBanco
};