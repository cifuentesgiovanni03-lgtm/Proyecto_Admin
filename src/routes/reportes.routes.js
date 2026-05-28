const express = require("express");
const router = express.Router();
const {
  reporteTransacciones,
  reporteClientes,
  resumenSaldos
} = require("../controllers/reportes.controller");
const { verificarToken } = require("../middlewares/auth.middleware");
const { verificarPermiso } = require("../middlewares/permiso.middleware");

router.get(
  "/transacciones",
  verificarToken,
  verificarPermiso("VER_REPORTES"),
  reporteTransacciones
);

router.get(
  "/clientes",
  verificarToken,
  verificarPermiso("VER_REPORTES"),
  reporteClientes
);

router.get(
  "/saldos",
  verificarToken,
  verificarPermiso("VER_REPORTES"),
  resumenSaldos
);

module.exports = router;
