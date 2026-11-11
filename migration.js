const dotenv = require("dotenv")
dotenv.config({ quiet: true })

const mysql = require("mysql2/promise")
const bcrypt = require("bcrypt")
const db = require("./db")
const produtos = require("./data/produtos")

const RESET = process.argv.includes("--reset")
const NOME_BANCO = process.env.DB_DATABASE || "nextech"

const ESTRUTURA_CLIENTE = `
    CREATE TABLE IF NOT EXISTS cliente (
        id INT NOT NULL AUTO_INCREMENT,
        nome VARCHAR(100) NOT NULL,
        cpf CHAR(14) NOT NULL,
        celular CHAR(14) NOT NULL,
        email VARCHAR(100) NOT NULL,
        senha VARCHAR(512) NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY uq_cliente_cpf (cpf),
        UNIQUE KEY uq_cliente_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`

const ESTRUTURA_PRODUTO = `
    CREATE TABLE IF NOT EXISTS produto (
        id INT NOT NULL AUTO_INCREMENT,
        nome VARCHAR(200) NOT NULL,
        descricao TEXT NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        marca VARCHAR(60) NOT NULL,
        preco DECIMAL(10,2) NOT NULL,
        preco_antigo DECIMAL(10,2) NULL,
        estoque INT NOT NULL DEFAULT 0,
        destaque TINYINT(1) NOT NULL DEFAULT 0,
        caminho_img VARCHAR(255) NOT NULL,
        quantidade_img INT NOT NULL DEFAULT 1,
        avaliacao DECIMAL(2,1) NOT NULL DEFAULT 0,
        avaliacoes INT NOT NULL DEFAULT 0,
        PRIMARY KEY (id),
        KEY idx_produto_categoria (categoria),
        KEY idx_produto_preco (preco),
        KEY idx_produto_destaque (destaque)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`

async function garantirBanco() {
    if (!/^[A-Za-z0-9_]+$/.test(NOME_BANCO)) {
        throw new Error("O nome do banco em DB_DATABASE deve conter apenas letras, números e _")
    }

    const conexao = await mysql.createConnection({
        host: process.env.DB_HOST || "127.0.0.1",
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || ""
    })

    try {
        await conexao.query(
            `CREATE DATABASE IF NOT EXISTS \`${NOME_BANCO}\`
             CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
        )
    } finally {
        await conexao.end()
    }
}

async function tabelaTemColuna(conexao, tabela, coluna) {
    const [linhas] = await conexao.query(
        `SHOW COLUMNS FROM \`${tabela}\` LIKE ?`,
        [coluna]
    )
    return linhas.length > 0
}

async function criarTabelas(conexao) {
    if (RESET) {
        console.log("Modo --reset: removendo tabelas existentes...")
        await conexao.query("DROP TABLE IF EXISTS produto")
        await conexao.query("DROP TABLE IF EXISTS cliente")
    }

    // Estrutura antiga (peças automotivas) não tem a coluna marca.
    // Nesse caso, recria apenas a tabela de produtos para aplicar o novo schema.
    const [existeProduto] = await conexao.query("SHOW TABLES LIKE 'produto'")
    if (existeProduto.length > 0 && !(await tabelaTemColuna(conexao, "produto", "marca"))) {
        console.log("Schema antigo de produto detectado: recriando a tabela de produtos...")
        await conexao.query("DROP TABLE produto")
    }

    await conexao.query(ESTRUTURA_CLIENTE)
    await conexao.query(ESTRUTURA_PRODUTO)
}

async function inserirProdutos(conexao) {
    const [linhas] = await conexao.query("SELECT COUNT(*) AS total FROM produto")
    if (Number(linhas[0].total) > 0) {
        console.log("Produtos já existentes: nenhuma carga duplicada.")
        return Number(linhas[0].total)
    }

    const valores = produtos.map(produto => [
        produto.nome,
        produto.descricao,
        produto.categoria,
        produto.marca,
        produto.preco,
        produto.preco_antigo,
        produto.estoque,
        produto.destaque,
        produto.caminho_img,
        produto.quantidade_img,
        produto.avaliacao,
        produto.avaliacoes
    ])

    await conexao.query(
        `INSERT INTO produto
         (nome, descricao, categoria, marca, preco, preco_antigo, estoque,
          destaque, caminho_img, quantidade_img, avaliacao, avaliacoes)
         VALUES ?`,
        [valores]
    )

    console.log("Produtos inseridos: " + valores.length)
    return valores.length
}

async function inserirClienteDemo(conexao) {
    const [linhas] = await conexao.query("SELECT COUNT(*) AS total FROM cliente")
    if (Number(linhas[0].total) > 0) {
        console.log("Clientes já existentes: nenhum cliente demo duplicado.")
        return
    }

    const senha = await bcrypt.hash("demo1234", 10)
    await conexao.query(
        `INSERT INTO cliente (nome, cpf, celular, email, senha)
         VALUES (?, ?, ?, ?, ?)`,
        [
            "Cliente Demo",
            "123.456.789-09",
            "(42)99999-0000",
            "demo@nextech.com",
            senha
        ]
    )
    console.log("Cliente demo criado: demo@nextech.com / demo1234")
}

async function executar() {
    let conexao
    try {
        console.log("Garantindo que o banco '" + NOME_BANCO + "' exista...")
        await garantirBanco()

        conexao = await db.pool.getConnection()
        await conexao.beginTransaction()

        await criarTabelas(conexao)
        const totalProdutos = await inserirProdutos(conexao)
        await inserirClienteDemo(conexao)

        await conexao.commit()

        const [clientes] = await conexao.query("SELECT COUNT(*) AS total FROM cliente")
        console.log("---------------------------------------------")
        console.log("Migration concluída com sucesso!")
        console.log("Banco: " + NOME_BANCO)
        console.log("Produtos: " + totalProdutos)
        console.log("Clientes: " + clientes[0].total)
        console.log("---------------------------------------------")
    } catch (error) {
        if (conexao) await conexao.rollback()
        console.error("Falha na migration:", error.message)
        if (error.code === "ECONNREFUSED") {
            console.error("O MySQL não está rodando em " + (process.env.DB_HOST || "127.0.0.1") + ":" + (process.env.DB_PORT || 3306))
        }
        process.exitCode = 1
    } finally {
        if (conexao) conexao.release()
        await db.pool.end()
    }
}

executar()
