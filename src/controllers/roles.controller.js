const rolModel = require("../models/rol.model");

async function listarRoles(req, res) {
  try {
    const roles = await rolModel.findAll();
    const result = [];

    for (const rol of roles) {
      const permisos = await rolModel.getPermisos(rol.id_rol);
      result.push({ ...rol, permisos });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function obtenerRol(req, res) {
  try {
    const rol = await rolModel.findById(req.params.id_rol);
    if (!rol) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }

    const permisos = await rolModel.getPermisos(rol.id_rol);
    res.json({ ...rol, permisos });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function crearRol(req, res) {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) {
      return res.status(400).json({ message: "nombre es obligatorio" });
    }

    const id_rol = await rolModel.create({ nombre, descripcion });
    res.status(201).json({ message: "Rol creado correctamente", id_rol });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "El rol ya existe" });
    }
    res.status(500).json({ message: error.message });
  }
}

async function actualizarRol(req, res) {
  try {
    const { id_rol } = req.params;

    const existe = await rolModel.findById(id_rol);
    if (!existe) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }

    const { nombre, descripcion } = req.body;
    await rolModel.update(id_rol, {
      nombre: nombre || existe.nombre,
      descripcion: descripcion ?? existe.descripcion
    });

    res.json({ message: "Rol actualizado correctamente" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "El rol ya existe" });
    }
    res.status(500).json({ message: error.message });
  }
}

async function eliminarRol(req, res) {
  try {
    const eliminado = await rolModel.deleteById(req.params.id_rol);
    if (!eliminado) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }
    res.json({ message: "Rol eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function asignarPermisos(req, res) {
  try {
    const { id_rol } = req.params;

    const rol = await rolModel.findById(id_rol);
    if (!rol) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }

    const { permisos } = req.body;
    if (!Array.isArray(permisos)) {
      return res.status(400).json({ message: "permisos debe ser un array de IDs" });
    }

    await rolModel.setPermisos(id_rol, permisos);
    res.json({ message: "Permisos asignados correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  listarRoles,
  obtenerRol,
  crearRol,
  actualizarRol,
  eliminarRol,
  asignarPermisos
};
