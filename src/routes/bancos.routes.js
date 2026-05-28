const express = require("express");
const router = express.Router();
const {
  listarBancos,
  obtenerBanco,
  crearBanco,
  actualizarBanco,
  eliminarBanco
} = require("../controllers/bancos.controller");
const { verificarToken } = require("../middlewares/auth.middleware");
const { verificarPermiso } = require("../middlewares/permiso.middleware");

router.get("/", verificarToken, verificarPermiso("VER_BANCOS"), listarBancos);
router.get("/:id_banco", verificarToken, verificarPermiso("VER_BANCOS"), obtenerBanco);
router.post("/", verificarToken, verificarPermiso("GESTIONAR_BANCOS"), crearBanco);
router.put("/:id_banco", verificarToken, verificarPermiso("GESTIONAR_BANCOS"), actualizarBanco);
router.delete("/:id_banco", verificarToken, verificarPermiso("ELIMINAR_BANCOS"), eliminarBanco);

module.exports = router;
