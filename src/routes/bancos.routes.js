const express = require("express");
const router = express.Router();
const {
  listarBancos,
  crearBanco
} = require("../controllers/bancos.controller");
const {
  verificarToken,
  verificarRol
} = require("../middlewares/auth.middleware");

router.get(
  "/",
  verificarToken,
  listarBancos
);

router.post(
  "/",
  verificarToken,
  verificarRol("ADMINISTRADOR", "OPERADOR"),
  crearBanco
);

module.exports = router;