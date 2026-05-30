const express = require("express");
const router = express.Router();
const {
  listarTransacciones,
  crearDeposito,
  crearRetiro,
  crearTransferenciaInterna,
  crearTransferenciaExterna,
  crearTransferenciaEntrante,
  validarCuentaExterna
} = require("../controllers/transacciones.controller");
const { verificarToken } = require("../middlewares/auth.middleware");
const { verificarPermiso } = require("../middlewares/permiso.middleware");

router.get("/", verificarToken, verificarPermiso("VER_TRANSACCIONES"), listarTransacciones);

router.post(
  "/deposito",
  verificarToken,
  verificarPermiso("REALIZAR_DEPOSITO"),
  crearDeposito
);

router.post(
  "/retiro",
  verificarToken,
  verificarPermiso("REALIZAR_RETIRO"),
  crearRetiro
);

router.post(
  "/transferencia-interna",
  verificarToken,
  verificarPermiso("REALIZAR_TRANSFERENCIA_INTERNA"),
  crearTransferenciaInterna
);

router.post(
  "/transferencia-externa",
  verificarToken,
  crearTransferenciaExterna
);

router.post(
  "/validar-cuenta-externa",
  verificarToken,
  validarCuentaExterna
);

router.post(
  "/transferencia-entrante",
  crearTransferenciaEntrante
);

module.exports = router;
