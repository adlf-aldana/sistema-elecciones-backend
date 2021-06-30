const { Router } = require("express");
const router = Router();

const { autenticarUsuario, usuarioAutenticado } = require('../controllers/authController')

const auth = require('../middleware/auth')

// Inicia Sesion
router.route("/").post(autenticarUsuario);

// Obtiene el usuario autenticado
router.route("/").get(auth, usuarioAutenticado)

module.exports = router;