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
const { verificarToken } = require("../middlewares/auth.middleware");
const { verificarPermiso } = require("../middlewares/permiso.middleware");

router.get("/", verificarToken, verificarPermiso("VER_CUENTAS"), listarCuentas);
router.get("/:id_cuenta", verificarToken, verificarPermiso("VER_CUENTAS"), obtenerCuenta);
router.post("/", verificarToken, verificarPermiso("GESTIONAR_CUENTAS"), crearCuenta);
router.put("/:id_cuenta", verificarToken, verificarPermiso("GESTIONAR_CUENTAS"), actualizarCuenta);
router.delete("/:id_cuenta", verificarToken, verificarPermiso("ELIMINAR_CUENTAS"), eliminarCuenta);
router.get("/:id_cuenta/movimientos", verificarToken, verificarPermiso("VER_CUENTAS"), obtenerMovimientosCuenta);
router.get("/:id_cuenta/estado-cuenta", verificarToken, verificarPermiso("VER_CUENTAS"), obtenerEstadoCuenta);

module.exports = router;
