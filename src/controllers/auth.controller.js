const jwt = require("jsonwebtoken");
const usuarioModel = require("../models/usuario.model");
const { registrarLog } = require("../services/auditoria.service");

async function login(req, res) {
  try {
    const { username, password } = req.body;

    const usuario = await usuarioModel.findByUsername(username);

    if (!usuario) {
      return res.status(401).json({ message: "Usuario no válido" });
    }

    const validPassword = await usuarioModel.verifyPassword(password, usuario.password_hash);

    if (!validPassword) {
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

    res.json({ message: "Login exitoso", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { login };
