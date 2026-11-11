const jwt = require("jsonwebtoken")

function autenticar(req, res, next) {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : null

    if (!token) {
        return res.status(401).json({
            erro: "Token não enviado. Use o cabeçalho Authorization: Bearer <token>"
        })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
        if (err) {
            return res.status(403).json({ erro: "Token inválido ou expirado" })
        }
        req.usuario = usuario
        next()
    })
}

module.exports = { autenticar }
