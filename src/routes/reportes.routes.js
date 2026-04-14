const express = require("express");
const router = express.Router();
const {
  reporteTransacciones,
  reporteClientes,
  resumenSaldos
} = require("../controllers/reportes.controller");
const {
  verificarToken,
  verificarRol
} = require("../middlewares/auth.middleware");

router.get(
  "/transacciones",
  verificarToken,
  verificarRol("ADMINISTRADOR", "OPERADOR"),
  reporteTransacciones
);

router.get(
  "/clientes",
  verificarToken,
  verificarRol("ADMINISTRADOR", "OPERADOR"),
  reporteClientes
);

router.get(
  "/saldos",
  verificarToken,
  verificarRol("ADMINISTRADOR", "OPERADOR"),
  resumenSaldos
);

module.exports = router;