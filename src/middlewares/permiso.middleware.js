const pool = require("../config/mysql");

function verificarPermiso(...permisosRequeridos) {
  return async (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    try {
      const [rows] = await pool.query(
        `SELECT 1 FROM rol_permiso rp
         INNER JOIN permisos p ON rp.id_permiso = p.id_permiso
         WHERE rp.id_rol = ? AND p.nombre IN (?)
         LIMIT 1`,
        [req.usuario.id_rol, permisosRequeridos]
      );

      if (rows.length === 0) {
        return res.status(403).json({ message: "No tiene permisos para esta operación" });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: "Error al verificar permisos" });
    }
  };
}

module.exports = { verificarPermiso };