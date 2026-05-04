const clienteModel = require("../models/cliente.model");
const { registrarAuditoria } = require("../services/auditoria.service");

async function listarClientes(req, res) {
  try {
    const rows = await clienteModel.findAll();
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

    const id_cliente = await clienteModel.create(req.body);

    await registrarAuditoria({
      accion: "CREAR_CLIENTE",
      entidad: "clientes",
      entidad_id: id_cliente,
      detalle: { nombres, apellidos, dpi }
    });

    res.status(201).json({
      message: "Cliente creado correctamente",
      id_cliente
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  listarClientes,
  crearCliente
};
