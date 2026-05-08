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

async function obtenerCliente(req, res) {
  try {
    const { id_cliente } = req.params;

    const cliente = await clienteModel.findById(id_cliente);
    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    res.json(cliente);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function crearCliente(req, res) {
  try {
    const id_cliente = await clienteModel.create(req.body);

    await registrarAuditoria({
      accion: "CREAR_CLIENTE",
      entidad: "clientes",
      entidad_id: id_cliente,
      detalle: {
        nombres: req.body.nombres,
        apellidos: req.body.apellidos,
        dpi: req.body.dpi
      }
    });

    res.status(201).json({
      message: "Cliente creado correctamente",
      id_cliente
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function actualizarCliente(req, res) {
  try {
    const { id_cliente } = req.params;

    const existe = await clienteModel.findById(id_cliente);
    if (!existe) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    await clienteModel.update(id_cliente, req.body);

    await registrarAuditoria({
      accion: "ACTUALIZAR_CLIENTE",
      entidad: "clientes",
      entidad_id: Number(id_cliente),
      detalle: req.body
    });

    res.json({ message: "Cliente actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function eliminarCliente(req, res) {
  try {
    const { id_cliente } = req.params;

    const eliminado = await clienteModel.deleteById(id_cliente);
    if (!eliminado) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    await registrarAuditoria({
      accion: "ELIMINAR_CLIENTE",
      entidad: "clientes",
      entidad_id: Number(id_cliente),
      detalle: {}
    });

    res.json({ message: "Cliente eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  listarClientes,
  obtenerCliente,
  crearCliente,
  actualizarCliente,
  eliminarCliente
};
