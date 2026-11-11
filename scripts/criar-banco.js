const mysql = require("mysql2/promise")
require("dotenv").config({ quiet: true })

async function executar() {
    const banco = process.env.DB_DATABASE || "nextech"

    if (!/^[A-Za-z0-9_]+$/.test(banco)) {
        throw new Error("DB_DATABASE deve conter apenas letras, números e _")
    }

    const conexao = await mysql.createConnection({
        host: process.env.DB_HOST || "127.0.0.1",
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || ""
    })

    try {
        await conexao.query(
            `CREATE DATABASE IF NOT EXISTS \`${banco}\`
             CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
        )
        console.log("Banco '" + banco + "' criado/verificado com sucesso.")
    } finally {
        await conexao.end()
    }
}

executar().catch(error => {
    console.error("Erro ao criar o banco:", error.message)
    process.exitCode = 1
})
