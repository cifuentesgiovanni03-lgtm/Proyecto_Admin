const express = require("express");
const router = express.Router();
const {
  listarPermisos,
  obtenerPermiso,
  crearPermiso,
  actualizarPermiso,
  eliminarPermiso
} = require("../controllers/permisos.controller");
const {
  verificarToken,
  verificarRol
} = require("../middlewares/auth.middleware");

router.get("/", verificarToken, verificarRol("ADMINISTRADOR"), listarPermisos);
router.get("/:id_permiso", verificarToken, verificarRol("ADMINISTRADOR"), obtenerPermiso);
router.post("/", verificarToken, verificarRol("ADMINISTRADOR"), crearPermiso);
router.put("/:id_permiso", verificarToken, verificarRol("ADMINISTRADOR"), actualizarPermiso);
router.delete("/:id_permiso", verificarToken, verificarRol("ADMINISTRADOR"), eliminarPermiso);

module.exports = router;
