// Regras de validação e montagem segura das consultas de produtos.
// Nenhum texto do usuário é concatenado diretamente no SQL.

const PRODUTOS_POR_PAGINA = 10

const ORDENACOES = Object.freeze({
    relevancia: "id ASC",
    destaques: "destaque DESC, id ASC",
    menor_preco: "preco ASC, id ASC",
    maior_preco: "preco DESC, id ASC",
    nome_az: "nome ASC, id ASC",
    nome_za: "nome DESC, id ASC",
    avaliacao: "avaliacao DESC, avaliacoes DESC, id ASC",
    novidades: "id DESC"
})

function texto(valor, limite) {
    if (valor === undefined || valor === null) return ""
    return String(valor).trim().slice(0, limite)
}

function numero(valor) {
    if (valor === undefined || valor === null || valor === "") return undefined
    const n = Number(valor)
    return Number.isFinite(n) ? n : NaN
}

function escaparLike(valor) {
    return String(valor).replace(/[\\%_]/g, "\\$&")
}

/**
 * Valida os parâmetros de GET /produtos.
 * Retorna { erro } ou { filtros }.
 */
function validarQueryProdutos(query = {}) {
    const filtros = {
        nome: texto(query.nome, 120) || undefined,
        categoria: texto(query.categoria, 60) || undefined,
        preco_min: numero(query.preco_min),
        preco_max: numero(query.preco_max),
        ordem: texto(query.ordem, 30) || "relevancia",
        pagina: 1
    }

    if (filtros.preco_min !== undefined && (Number.isNaN(filtros.preco_min) || filtros.preco_min < 0)) {
        return { erro: "preco_min inválido" }
    }

    if (filtros.preco_max !== undefined && (Number.isNaN(filtros.preco_max) || filtros.preco_max < 0)) {
        return { erro: "preco_max inválido" }
    }

    if (filtros.preco_min !== undefined && filtros.preco_max !== undefined &&
        filtros.preco_min > filtros.preco_max) {
        return { erro: "preco_min não pode ser maior que preco_max" }
    }

    if (query.pagina !== undefined && query.pagina !== "") {
        const pagina = Number(query.pagina)
        if (!Number.isInteger(pagina) || pagina < 1) {
            return { erro: "pagina inválida" }
        }
        filtros.pagina = pagina
    }

    if (!ORDENACOES[filtros.ordem]) {
        return { erro: "ordem inválida (use menor_preco, maior_preco, nome_az, nome_za, avaliacao, destaques, novidades ou relevancia)" }
    }

    return { filtros }
}

/**
 * Monta o WHERE parametrizado a partir dos filtros já validados.
 */
function montarFiltrosSql(filtros) {
    const condicoes = []
    const valores = []

    if (filtros.nome) {
        condicoes.push("nome LIKE ?")
        valores.push("%" + escaparLike(filtros.nome) + "%")
    }

    if (filtros.categoria) {
        // LIKE permite que "processador" encontre "Processadores",
        // mantendo o filtro exato funcionando para o nome completo da categoria.
        condicoes.push("categoria LIKE ?")
        valores.push("%" + escaparLike(filtros.categoria) + "%")
    }

    if (filtros.preco_min !== undefined) {
        condicoes.push("preco >= ?")
        valores.push(filtros.preco_min)
    }

    if (filtros.preco_max !== undefined) {
        condicoes.push("preco <= ?")
        valores.push(filtros.preco_max)
    }

    return {
        where: condicoes.length ? " WHERE " + condicoes.join(" AND ") : "",
        valores
    }
}

function montarOrdenacao(ordem) {
    return ORDENACOES[ordem] || ORDENACOES.relevancia
}

module.exports = {
    PRODUTOS_POR_PAGINA,
    ORDENACOES,
    escaparLike,
    validarQueryProdutos,
    montarFiltrosSql,
    montarOrdenacao
}
