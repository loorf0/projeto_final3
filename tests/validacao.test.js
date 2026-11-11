const test = require("node:test")
const assert = require("node:assert/strict")

const {
    PRODUTOS_POR_PAGINA,
    ORDENACOES,
    escaparLike,
    validarQueryProdutos,
    montarFiltrosSql,
    montarOrdenacao
} = require("../src/validacao")

test("a paginação usa 10 produtos por página", () => {
    assert.equal(PRODUTOS_POR_PAGINA, 10)
})

test("valores padrão da query", () => {
    const { erro, filtros } = validarQueryProdutos({})

    assert.equal(erro, undefined)
    assert.equal(filtros.pagina, 1)
    assert.equal(filtros.ordem, "relevancia")
    assert.equal(filtros.nome, undefined)
    assert.equal(filtros.categoria, undefined)
    assert.equal(filtros.preco_min, undefined)
    assert.equal(filtros.preco_max, undefined)
})

test("converte preços e página para número", () => {
    const { filtros } = validarQueryProdutos({
        preco_min: "200",
        preco_max: "700.5",
        pagina: "2",
        nome: "  ryzen  ",
        categoria: "Processadores"
    })

    assert.equal(filtros.preco_min, 200)
    assert.equal(filtros.preco_max, 700.5)
    assert.equal(filtros.pagina, 2)
    assert.equal(filtros.nome, "ryzen")
    assert.equal(filtros.categoria, "Processadores")
})

test("rejeita preços inválidos e faixa invertida", () => {
    assert.equal(validarQueryProdutos({ preco_min: "abc" }).erro, "preco_min inválido")
    assert.equal(validarQueryProdutos({ preco_max: "-1" }).erro, "preco_max inválido")
    assert.equal(
        validarQueryProdutos({ preco_min: 700, preco_max: 200 }).erro,
        "preco_min não pode ser maior que preco_max"
    )
})

test("rejeita página e ordenação inválidas", () => {
    assert.equal(validarQueryProdutos({ pagina: "0" }).erro, "pagina inválida")
    assert.equal(validarQueryProdutos({ pagina: "1.5" }).erro, "pagina inválida")
    assert.equal(validarQueryProdutos({ pagina: "abc" }).erro, "pagina inválida")
    assert.match(validarQueryProdutos({ ordem: "invalida" }).erro, /ordem inválida/)
})

test("aceita todas as ordenações permitidas", () => {
    Object.keys(ORDENACOES).forEach(ordem => {
        const { erro } = validarQueryProdutos({ ordem })
        assert.equal(erro, undefined, "ordem deveria ser aceita: " + ordem)
    })
})

test("montarOrdenacao nunca interpola texto do usuário", () => {
    assert.equal(montarOrdenacao("menor_preco"), "preco ASC, id ASC")
    assert.equal(montarOrdenacao("maior_preco"), "preco DESC, id ASC")
    assert.equal(montarOrdenacao("relevancia"), "id ASC")
    assert.equal(montarOrdenacao("'; DROP TABLE produto; --"), "id ASC")
})

test("escaparLike neutraliza curingas do LIKE", () => {
    assert.equal(escaparLike("100%"), "100\\%")
    assert.equal(escaparLike("a_b"), "a\\_b")
    assert.equal(escaparLike("c\\d"), "c\\\\d")
})

test("monta WHERE parametrizado sem concatenar valores", () => {
    const { filtros } = validarQueryProdutos({
        nome: "Ryzen",
        categoria: "Processadores",
        preco_min: 200,
        preco_max: 700
    })
    const { where, valores } = montarFiltrosSql(filtros)

    assert.equal(
        where,
        " WHERE nome LIKE ? AND categoria LIKE ? AND preco >= ? AND preco <= ?"
    )
    assert.deepEqual(valores, ["%Ryzen%", "%Processadores%", 200, 700])
})

test("sem filtros o WHERE fica vazio", () => {
    const { filtros } = validarQueryProdutos({})
    const { where, valores } = montarFiltrosSql(filtros)

    assert.equal(where, "")
    assert.deepEqual(valores, [])
})
