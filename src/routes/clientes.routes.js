const express = require("express");
const router = express.Router();
const {
  listarClientes,
  obtenerCliente,
  crearCliente,
  actualizarCliente,
  eliminarCliente
} = require("../controllers/clientes.controller");
const {
  verificarToken,
  verificarRol
} = require("../middlewares/auth.middleware");

router.get("/", verificarToken, listarClientes);
router.get("/:id_cliente", verificarToken, obtenerCliente);
router.post("/", verificarToken, verificarRol("ADMINISTRADOR", "OPERADOR"), crearCliente);
router.put("/:id_cliente", verificarToken, verificarRol("ADMINISTRADOR", "OPERADOR"), actualizarCliente);
router.delete("/:id_cliente", verificarToken, verificarRol("ADMINISTRADOR"), eliminarCliente);

module.exports = router;
