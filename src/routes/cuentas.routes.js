const express = require("express");
const router = express.Router();
const {
  listarCuentas,
  crearCuenta,
  obtenerMovimientosCuenta,
  obtenerEstadoCuenta
} = require("../controllers/cuentas.controller");
const {
  verificarToken,
  verificarRol
} = require("../middlewares/auth.middleware");

router.get("/", verificarToken, listarCuentas);

router.post(
  "/",
  verificarToken,
  verificarRol("ADMINISTRADOR", "OPERADOR"),
  crearCuenta
);

router.get(
  "/:id_cuenta/movimientos",
  verificarToken,
  obtenerMovimientosCuenta
);

router.get(
  "/:id_cuenta/estado-cuenta",
  verificarToken,
  obtenerEstadoCuenta
);

module.exports = router;