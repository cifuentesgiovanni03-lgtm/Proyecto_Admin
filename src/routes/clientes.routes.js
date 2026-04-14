const express = require("express");
const router = express.Router();
const {
  listarClientes,
  crearCliente
} = require("../controllers/clientes.controller");
const {
  verificarToken,
  verificarRol
} = require("../middlewares/auth.middleware");

router.get("/", verificarToken, listarClientes);
router.post("/", verificarToken, verificarRol("ADMINISTRADOR", "OPERADOR"), crearCliente);

module.exports = router;