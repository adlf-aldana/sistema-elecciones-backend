const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Leer token del header
    const token = req.header('x-auth-token')
    // Revisar si no hay token
    if (!token) {
        return res.status(401).json({ msg: 'Permiso no válido' })
    }

    // Validar el token
    try {
        const cifrado = jwt.verify(token, process.env.SECRETA)
        req.universitario = cifrado.usuario
        next()
    } catch (error) {
        res.status(401).json({ msg: 'Token no válido' })
    }
}