const pool = require("../config/mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { registrarLog } = require("../services/auditoria.service");

async function login(req, res) {
  try {
    const { username, password } = req.body;

    const [rows] = await pool.query(
      `SELECT u.id_usuario, u.username, u.password_hash, u.nombre_completo, r.nombre AS rol
       FROM usuarios u
       INNER JOIN roles r ON u.id_rol = r.id_rol
       WHERE u.username = ? AND u.estado = 'ACTIVO'`,
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Usuario no válido" });
    }

    const usuario = rows[0];
    const ok = await bcrypt.compare(password, usuario.password_hash);

    if (!ok) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        username: usuario.username,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    await registrarLog({
      nivel: "INFO",
      modulo: "AUTH",
      mensaje: "Inicio de sesión exitoso",
      usuario_id: usuario.id_usuario,
      username: usuario.username
    });

    res.json({
      message: "Login exitoso",
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  login
};