const express = require("express");
const router = express.Router();
const {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  cambiarPassword,
  eliminarUsuario
} = require("../controllers/usuarios.controller");
const { verificarToken } = require("../middlewares/auth.middleware");
const { verificarPermiso } = require("../middlewares/permiso.middleware");

router.get("/", verificarToken, verificarPermiso("GESTIONAR_USUARIOS"), listarUsuarios);
router.get("/:id_usuario", verificarToken, verificarPermiso("GESTIONAR_USUARIOS"), obtenerUsuario);
router.post("/", verificarToken, verificarPermiso("GESTIONAR_USUARIOS"), crearUsuario);
router.put("/:id_usuario", verificarToken, verificarPermiso("GESTIONAR_USUARIOS"), actualizarUsuario);
router.put("/:id_usuario/password", verificarToken, verificarPermiso("GESTIONAR_USUARIOS"), cambiarPassword);
router.delete("/:id_usuario", verificarToken, verificarPermiso("GESTIONAR_USUARIOS"), eliminarUsuario);

module.exports = router;
