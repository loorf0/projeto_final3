const path = require("path")
const express = require("express")
const cors = require("cors")
require("dotenv").config({ quiet: true })

const db = require("./db")
const produtosRouter = require("./src/produtos")
const clientesRouter = require("./src/clientes")

const app = express()

app.use(cors())
app.use(express.json({ limit: "1mb" }))

// Front-end estático servido pelo próprio Express
app.use(express.static(path.join(__dirname, "site")))

// Rotas de autenticação: /cliente, /login e /cliente/perfil
app.use(clientesRouter)

// Rotas de produtos: /produtos e o alias /produto
app.use("/produtos", produtosRouter)
app.use("/produto", produtosRouter)

// Teste rápido de conexão com o banco
app.get("/health", async (req, res) => {
    try {
        const [linhas] = await db.pool.query(
            "SELECT COUNT(*) AS produtos, (SELECT COUNT(*) FROM cliente) AS clientes FROM produto"
        )
        res.status(200).json({
            status: "ok",
            banco: "conectado",
            produtos: Number(linhas[0].produtos),
            clientes: Number(linhas[0].clientes)
        })
    } catch (error) {
        console.error("Health check falhou:", error.message)
        res.status(503).json({ status: "erro", banco: "desconectado" })
    }
})

app.use((req, res) => {
    res.status(404).json({ erro: "Rota não encontrada" })
})

app.use((error, req, res, next) => {
    if (error && error.type === "entity.parse.failed") {
        return res.status(400).json({ erro: "JSON inválido no corpo da requisição" })
    }
    console.error(error)
    res.status(500).json({ erro: "Erro interno do servidor" })
})

module.exports = app
