const pool = require("../config/mysql");
const { registrarAuditoria } = require("../services/auditoria.service");

async function listarClientes(req, res) {
  try {
    const [rows] = await pool.query("SELECT * FROM clientes ORDER BY id_cliente DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function crearCliente(req, res) {
  try {
    const {
      nombres,
      apellidos,
      dpi,
      nit,
      fecha_nacimiento,
      telefono,
      correo,
      direccion
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO clientes
      (nombres, apellidos, dpi, nit, fecha_nacimiento, telefono, correo, direccion)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombres, apellidos, dpi, nit, fecha_nacimiento, telefono, correo, direccion]
    );

    await registrarAuditoria({
      accion: "CREAR_CLIENTE",
      entidad: "clientes",
      entidad_id: result.insertId,
      detalle: { nombres, apellidos, dpi }
    });

    res.status(201).json({
      message: "Cliente creado correctamente",
      id_cliente: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  listarClientes,
  crearCliente
};