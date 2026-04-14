const express = require("express");
const router = express.Router();
const {
  listarCuentas,
  crearCuenta
} = require("../controllers/cuentas.controller");
const {
  verificarToken,
  verificarRol
} = require("../middlewares/auth.middleware");

router.get("/", verificarToken, listarCuentas);
router.post("/", verificarToken, verificarRol("ADMINISTRADOR", "OPERADOR"), crearCuenta);

module.exports = router;