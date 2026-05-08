const express = require("express");
const router = express.Router();
const {
  listarCuentas,
  obtenerCuenta,
  crearCuenta,
  actualizarCuenta,
  eliminarCuenta,
  obtenerMovimientosCuenta,
  obtenerEstadoCuenta
} = require("../controllers/cuentas.controller");
const {
  verificarToken,
  verificarRol
} = require("../middlewares/auth.middleware");

router.get("/", verificarToken, listarCuentas);
router.get("/:id_cuenta", verificarToken, obtenerCuenta);
router.post("/", verificarToken, verificarRol("ADMINISTRADOR", "OPERADOR"), crearCuenta);
router.put("/:id_cuenta", verificarToken, verificarRol("ADMINISTRADOR", "OPERADOR"), actualizarCuenta);
router.delete("/:id_cuenta", verificarToken, verificarRol("ADMINISTRADOR"), eliminarCuenta);
router.get("/:id_cuenta/movimientos", verificarToken, obtenerMovimientosCuenta);
router.get("/:id_cuenta/estado-cuenta", verificarToken, obtenerEstadoCuenta);

module.exports = router;
