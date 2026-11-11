const express = require("express")
const db = require("../db")
const {
    PRODUTOS_POR_PAGINA,
    validarQueryProdutos,
    montarFiltrosSql,
    montarOrdenacao
} = require("./validacao")

const router = express.Router()

const CAMPOS = `id, nome, descricao, categoria, marca, preco, preco_antigo,
    estoque, destaque, caminho_img, quantidade_img, avaliacao, avaliacoes`

// GET /produtos (e /produto) -> lista paginada com filtros e ordenação
router.get("/", async (req, res, next) => {
    try {
        const { erro, filtros } = validarQueryProdutos(req.query)
        if (erro) return res.status(400).json({ erro })

        const { where, valores } = montarFiltrosSql(filtros)
        const ordenacao = montarOrdenacao(filtros.ordem)
        const offset = (filtros.pagina - 1) * PRODUTOS_POR_PAGINA

        const [produtos] = await db.pool.query(
            `SELECT ${CAMPOS} FROM produto ${where} ORDER BY ${ordenacao} LIMIT ? OFFSET ?`,
            [...valores, PRODUTOS_POR_PAGINA, offset]
        )

        const [contagem] = await db.pool.query(
            `SELECT COUNT(*) AS total FROM produto ${where}`,
            valores
        )

        const total = Number(contagem[0].total)
        const totalPaginas = Math.max(1, Math.ceil(total / PRODUTOS_POR_PAGINA))

        return res.status(200).json({
            pagina: filtros.pagina,
            por_pagina: PRODUTOS_POR_PAGINA,
            total,
            total_paginas: totalPaginas,
            tem_anterior: filtros.pagina > 1,
            tem_proxima: filtros.pagina < totalPaginas,
            produtos
        })
    } catch (error) {
        next(error)
    }
})

// GET /produtos/categorias -> categorias com contagem
router.get("/categorias", async (req, res, next) => {
    try {
        const [linhas] = await db.pool.query(
            `SELECT categoria, COUNT(*) AS total
             FROM produto
             GROUP BY categoria
             ORDER BY categoria`
        )

        return res.status(200).json(
            linhas.map(linha => ({
                nome: linha.categoria,
                categoria: linha.categoria,
                total: Number(linha.total)
            }))
        )
    } catch (error) {
        next(error)
    }
})

// GET /produtos/filtros -> faixa de preço + categorias
router.get("/filtros", async (req, res, next) => {
    try {
        const [resumo] = await db.pool.query(
            "SELECT MIN(preco) AS preco_min, MAX(preco) AS preco_max, COUNT(*) AS total FROM produto"
        )
        const [categorias] = await db.pool.query(
            `SELECT categoria, COUNT(*) AS total
             FROM produto
             GROUP BY categoria
             ORDER BY categoria`
        )

        const dados = resumo[0] || {}
        return res.status(200).json({
            preco_min: dados.preco_min === null ? 0 : Number(dados.preco_min),
            preco_max: dados.preco_max === null ? 0 : Number(dados.preco_max),
            total: Number(dados.total || 0),
            categorias: categorias.map(linha => ({
                nome: linha.categoria,
                categoria: linha.categoria,
                total: Number(linha.total)
            }))
        })
    } catch (error) {
        next(error)
    }
})

// GET /produtos/destaques -> produtos em destaque
router.get("/destaques", async (req, res, next) => {
    try {
        const [produtos] = await db.pool.query(
            `SELECT ${CAMPOS} FROM produto
             WHERE destaque = 1
             ORDER BY avaliacao DESC, id ASC
             LIMIT 8`
        )
        return res.status(200).json(produtos)
    } catch (error) {
        next(error)
    }
})

// GET /produtos/todos -> lista completa em array (compatibilidade)
router.get("/todos", async (req, res, next) => {
    try {
        const { erro, filtros } = validarQueryProdutos(req.query)
        if (erro) return res.status(400).json({ erro })

        const { where, valores } = montarFiltrosSql(filtros)
        const [produtos] = await db.pool.query(
            `SELECT ${CAMPOS} FROM produto ${where} ORDER BY id ASC`,
            valores
        )
        return res.status(200).json(produtos)
    } catch (error) {
        next(error)
    }
})

// GET /produtos/:id -> produto específico
router.get("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id)
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ erro: "ID inválido" })
        }

        const [linhas] = await db.pool.query(
            `SELECT ${CAMPOS} FROM produto WHERE id = ? LIMIT 1`,
            [id]
        )

        if (linhas.length === 0) {
            return res.status(404).json({ erro: "Produto não encontrado" })
        }

        return res.status(200).json(linhas[0])
    } catch (error) {
        next(error)
    }
})

module.exports = router
