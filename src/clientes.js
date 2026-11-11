const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const db = require("../db")
const { autenticar } = require("./auth")

const router = express.Router()

function somenteDigitos(valor) {
    return String(valor || "").replace(/\D/g, "")
}

function formatarCpf(valor) {
    const digitos = somenteDigitos(valor)
    if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) return null
    return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

function formatarCelular(valor) {
    const digitos = somenteDigitos(valor)
    if (digitos.length === 11) {
        return digitos.replace(/(\d{2})(\d{5})(\d{4})/, "($1)$2-$3")
    }
    if (digitos.length === 10) {
        return digitos.replace(/(\d{2})(\d{4})(\d{4})/, "($1)$2-$3")
    }
    return null
}

function emailValido(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)
}

function texto(valor, limite) {
    return String(valor === undefined || valor === null ? "" : valor).trim().slice(0, limite)
}

// POST /cliente -> cadastro com senha criptografada
router.post("/cliente", async (req, res, next) => {
    try {
        const body = req.body || {}
        const nome = texto(body.nome, 100)
        const cpf = formatarCpf(body.cpf)
        const celular = formatarCelular(body.celular)
        const email = texto(body.email, 100).toLowerCase()
        const senha = String(body.senha === undefined || body.senha === null ? "" : body.senha)

        if (nome.length < 3) {
            return res.status(400).json({ erro: "Informe um nome com pelo menos 3 caracteres" })
        }
        if (!cpf) {
            return res.status(400).json({ erro: "CPF inválido. Informe os 11 dígitos" })
        }
        if (!celular) {
            return res.status(400).json({ erro: "Celular inválido. Informe DDD + número" })
        }
        if (!emailValido(email)) {
            return res.status(400).json({ erro: "Email inválido" })
        }
        if (senha.length < 6) {
            return res.status(400).json({ erro: "A senha deve ter pelo menos 6 caracteres" })
        }
        if (senha.length > 72) {
            return res.status(400).json({ erro: "A senha deve ter no máximo 72 caracteres" })
        }

        const [existentes] = await db.pool.query(
            "SELECT id, email, cpf FROM cliente WHERE email = ? OR cpf = ? LIMIT 1",
            [email, cpf]
        )

        if (existentes.length > 0) {
            const registro = existentes[0]
            if (registro.email === email) {
                return res.status(409).json({ erro: "Este email já está cadastrado" })
            }
            return res.status(409).json({ erro: "Este CPF já está cadastrado" })
        }

        const senhaHash = await bcrypt.hash(senha, 10)
        const [resultado] = await db.pool.query(
            `INSERT INTO cliente (nome, cpf, celular, email, senha)
             VALUES (?, ?, ?, ?, ?)`,
            [nome, cpf, celular, email, senhaHash]
        )

        return res.status(201).json({
            msg: "Cliente cadastrado com sucesso",
            id: resultado.insertId
        })
    } catch (error) {
        if (error && error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ erro: "Email ou CPF já cadastrado" })
        }
        next(error)
    }
})

// POST /login -> confere email + senha e devolve o JWT
router.post("/login", async (req, res, next) => {
    try {
        const body = req.body || {}
        const email = texto(body.email, 100).toLowerCase()
        const senha = String(body.senha === undefined || body.senha === null ? "" : body.senha)

        if (!emailValido(email) || !senha) {
            return res.status(400).json({ erro: "Informe email e senha" })
        }

        const [linhas] = await db.pool.query(
            "SELECT id, nome, email, senha FROM cliente WHERE email = ? LIMIT 1",
            [email]
        )
        const cliente = linhas[0]

        // Mesma resposta para email inexistente e senha errada.
        if (!cliente) {
            return res.status(401).json({ erro: "Email ou senha inválidos" })
        }

        const senhaValida = await bcrypt.compare(senha, cliente.senha)
        if (!senhaValida) {
            return res.status(401).json({ erro: "Email ou senha inválidos" })
        }

        const token = jwt.sign(
            { id: cliente.id, email: cliente.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        )

        return res.status(200).json({
            nome: cliente.nome,
            email: cliente.email,
            token
        })
    } catch (error) {
        next(error)
    }
})

// GET /cliente/perfil -> rota protegida por JWT
router.get("/cliente/perfil", autenticar, async (req, res, next) => {
    try {
        const [linhas] = await db.pool.query(
            "SELECT id, nome, cpf, celular, email FROM cliente WHERE id = ? LIMIT 1",
            [req.usuario.id]
        )

        if (linhas.length === 0) {
            return res.status(404).json({ erro: "Cliente não encontrado" })
        }

        return res.status(200).json(linhas[0])
    } catch (error) {
        next(error)
    }
})

module.exports = router
