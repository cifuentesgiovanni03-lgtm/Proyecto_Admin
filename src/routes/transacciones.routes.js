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
  verificarPermiso("REALIZAR_TRANSFERENCIA_EXTERNA"),
  crearTransferenciaExterna
);

router.post(
  "/transferencia-entrante",
  crearTransferenciaEntrante
);

router.post(
  "/validar-cuenta-externa",
  verificarToken,
  verificarPermiso("REALIZAR_TRANSFERENCIA_EXTERNA"),
  validarCuentaExterna
);

module.exports = router;
