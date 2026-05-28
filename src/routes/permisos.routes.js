const express = require("express");
const router = express.Router();
const {
  listarPermisos,
  obtenerPermiso,
  crearPermiso,
  actualizarPermiso,
  eliminarPermiso
} = require("../controllers/permisos.controller");
const { verificarToken } = require("../middlewares/auth.middleware");
const { verificarPermiso } = require("../middlewares/permiso.middleware");

router.get("/", verificarToken, verificarPermiso("GESTIONAR_PERMISOS"), listarPermisos);
router.get("/:id_permiso", verificarToken, verificarPermiso("GESTIONAR_PERMISOS"), obtenerPermiso);
router.post("/", verificarToken, verificarPermiso("GESTIONAR_PERMISOS"), crearPermiso);
router.put("/:id_permiso", verificarToken, verificarPermiso("GESTIONAR_PERMISOS"), actualizarPermiso);
router.delete("/:id_permiso", verificarToken, verificarPermiso("GESTIONAR_PERMISOS"), eliminarPermiso);

module.exports = router;
