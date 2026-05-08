const express = require("express");
const router = express.Router();
const {
  listarTransacciones,
  crearDeposito,
  crearRetiro,
  crearTransferenciaInterna,
  crearTransferenciaExterna,
  crearTransferenciaEntrante
} = require("../controllers/transacciones.controller");
const {
  verificarToken,
  verificarRol
} = require("../middlewares/auth.middleware");

router.get("/", verificarToken, listarTransacciones);

router.post(
  "/deposito",
  verificarToken,
  verificarRol("ADMINISTRADOR", "OPERADOR", "CAJERO"),
  crearDeposito
);

router.post(
  "/retiro",
  verificarToken,
  verificarRol("ADMINISTRADOR", "OPERADOR", "CAJERO"),
  crearRetiro
);

router.post(
  "/transferencia-interna",
  verificarToken,
  verificarRol("ADMINISTRADOR", "OPERADOR"),
  crearTransferenciaInterna
);

router.post(
  "/transferencia-externa",
  verificarToken,
  verificarRol("ADMINISTRADOR", "OPERADOR"),
  crearTransferenciaExterna
);

router.post(
  "/transferencia-entrante",
  crearTransferenciaEntrante
);

module.exports = router;