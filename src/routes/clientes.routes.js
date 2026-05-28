const express = require("express");
const router = express.Router();
const {
  listarClientes,
  obtenerCliente,
  crearCliente,
  actualizarCliente,
  eliminarCliente
} = require("../controllers/clientes.controller");
const { verificarToken } = require("../middlewares/auth.middleware");
const { verificarPermiso } = require("../middlewares/permiso.middleware");

router.get("/", verificarToken, verificarPermiso("VER_CLIENTES"), listarClientes);
router.get("/:id_cliente", verificarToken, verificarPermiso("VER_CLIENTES"), obtenerCliente);
router.post("/", verificarToken, verificarPermiso("GESTIONAR_CLIENTES"), crearCliente);
router.put("/:id_cliente", verificarToken, verificarPermiso("GESTIONAR_CLIENTES"), actualizarCliente);
router.delete("/:id_cliente", verificarToken, verificarPermiso("ELIMINAR_CLIENTES"), eliminarCliente);

module.exports = router;
