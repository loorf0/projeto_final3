// Testes de integração: sobem o Express em uma porta livre e conversam com o MySQL real.
// Uso: npm test

const test = require("node:test")
const assert = require("node:assert/strict")

const app = require("../app")
const db = require("../db")

let servidor
let base
let clienteCriado = null

function documentoUnico() {
    const digitos = String(Math.floor(Math.random() * 1e11)).padStart(11, "0").slice(-11)
    return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

async function pedir(caminho, opcoes = {}) {
    const resposta = await fetch(base + caminho, opcoes)
    const texto = await resposta.text()
    let corpo = null

    try {
        corpo = texto ? JSON.parse(texto) : null
    } catch {
        corpo = texto
    }

    return { status: resposta.status, corpo, headers: resposta.headers }
}

function postJson(caminho, dados) {
    return pedir(caminho, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    })
}

test.before(async () => {
    await new Promise(resolve => {
        servidor = app.listen(0, "127.0.0.1", resolve)
    })
    base = "http://127.0.0.1:" + servidor.address().port
})

test.after(async () => {
    if (clienteCriado) {
        await db.pool.query("DELETE FROM cliente WHERE email = ?", [clienteCriado.email])
    }
    await new Promise(resolve => servidor.close(resolve))
    await db.pool.end()
})

test("GET /health confirma a conexão com o MySQL", async () => {
    const { status, corpo } = await pedir("/health")

    assert.equal(status, 200)
    assert.equal(corpo.status, "ok")
    assert.equal(corpo.banco, "conectado")
    assert.ok(corpo.produtos >= 30 && corpo.produtos <= 50)
    assert.ok(corpo.clientes >= 1)
})

test("GET /produtos retorna 10 itens por página", async () => {
    const primeira = await pedir("/produtos?pagina=1")
    const segunda = await pedir("/produtos?pagina=2")

    assert.equal(primeira.status, 200)
    assert.equal(primeira.corpo.por_pagina, 10)
    assert.equal(primeira.corpo.produtos.length, 10)
    assert.equal(segunda.corpo.produtos.length, 10)
    assert.equal(primeira.corpo.total, segunda.corpo.total)
    assert.equal(primeira.corpo.total_paginas, Math.ceil(primeira.corpo.total / 10))

    assert.equal(primeira.corpo.produtos[0].id, 1)
    assert.equal(primeira.corpo.produtos[9].id, 10)
    assert.equal(segunda.corpo.produtos[0].id, 11)
    assert.equal(segunda.corpo.produtos[9].id, 20)

    assert.equal(primeira.corpo.tem_anterior, false)
    assert.equal(primeira.corpo.tem_proxima, true)
    assert.equal(segunda.corpo.tem_anterior, true)
})

test("GET /produtos pagina todas as páginas sem repetir itens", async () => {
    const primeira = await pedir("/produtos?pagina=1")
    const totalPaginas = primeira.corpo.total_paginas
    const vistos = new Set()

    for (let pagina = 1; pagina <= totalPaginas; pagina++) {
        const { corpo } = await pedir("/produtos?pagina=" + pagina)
        assert.equal(corpo.pagina, pagina)
        assert.ok(corpo.produtos.length > 0)

        corpo.produtos.forEach(produto => {
            assert.equal(vistos.has(produto.id), false, "produto repetido: " + produto.id)
            vistos.add(produto.id)
        })
    }

    assert.equal(vistos.size, primeira.corpo.total)
})

test("GET /produtos?pagina=2 traz exatamente os itens 11 a 20", async () => {
    const { corpo } = await pedir("/produtos?pagina=2")
    const ids = corpo.produtos.map(produto => produto.id)

    assert.deepEqual(ids, [11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
})

test("filtro por nome busca trecho do nome", async () => {
    const { status, corpo } = await pedir("/produtos?nome=Ryzen")

    assert.equal(status, 200)
    assert.ok(corpo.total > 0)
    corpo.produtos.forEach(produto => {
        assert.match(produto.nome.toLowerCase(), /ryzen/)
    })
})

test("filtro por categoria aceita singular e plural", async () => {
    const singular = await pedir("/produtos?categoria=processador")
    const plural = await pedir("/produtos?categoria=Processadores")

    assert.ok(singular.corpo.total > 0)
    assert.equal(singular.corpo.total, plural.corpo.total)
    singular.corpo.produtos.forEach(produto => {
        assert.equal(produto.categoria, "Processadores")
    })
})

test("filtro por faixa de preço respeita mínimo e máximo", async () => {
    const { status, corpo } = await pedir("/produtos?preco_min=200&preco_max=700")

    assert.equal(status, 200)
    assert.ok(corpo.total > 0)
    corpo.produtos.forEach(produto => {
        assert.ok(Number(produto.preco) >= 200)
        assert.ok(Number(produto.preco) <= 700)
    })
})

test("ordenação por menor e maior preço", async () => {
    const menor = await pedir("/produtos?ordem=menor_preco")
    const maior = await pedir("/produtos?ordem=maior_preco")

    const precosMenor = menor.corpo.produtos.map(produto => Number(produto.preco))
    const precosMaior = maior.corpo.produtos.map(produto => Number(produto.preco))

    assert.deepEqual(precosMenor, [...precosMenor].sort((a, b) => a - b))
    assert.deepEqual(precosMaior, [...precosMaior].sort((a, b) => b - a))
})

test("ordenação alfabética", async () => {
    const { corpo } = await pedir("/produtos?ordem=nome_az")
    const nomes = corpo.produtos.map(produto => produto.nome)

    assert.deepEqual(nomes, [...nomes].sort((a, b) => a.localeCompare(b, "pt-BR")))
})

test("parâmetros inválidos retornam 400 com mensagem", async () => {
    const casos = [
        ["/produtos?pagina=0", /pagina inválida/],
        ["/produtos?pagina=abc", /pagina inválida/],
        ["/produtos?ordem=preco", /ordem inválida/],
        ["/produtos?preco_min=abc", /preco_min inválido/],
        ["/produtos?preco_min=900&preco_max=100", /preco_min não pode ser maior/]
    ]

    for (const [caminho, esperado] of casos) {
        const { status, corpo } = await pedir(caminho)
        assert.equal(status, 400, caminho)
        assert.match(corpo.erro, esperado)
    }
})

test("GET /produtos/:id retorna um produto e trata erros", async () => {
    const encontrado = await pedir("/produtos/1")
    assert.equal(encontrado.status, 200)
    assert.equal(encontrado.corpo.id, 1)
    assert.ok(encontrado.corpo.nome)
    assert.equal(typeof encontrado.corpo.preco, "number")

    const inexistente = await pedir("/produtos/99999")
    assert.equal(inexistente.status, 404)

    const invalido = await pedir("/produtos/abc")
    assert.equal(invalido.status, 400)
})

test("rotas auxiliares do catálogo", async () => {
    const categorias = await pedir("/produtos/categorias")
    assert.equal(categorias.status, 200)
    assert.ok(Array.isArray(categorias.corpo))
    assert.ok(categorias.corpo.every(item => item.nome && item.total > 0))

    const filtros = await pedir("/produtos/filtros")
    assert.equal(filtros.status, 200)
    assert.ok(filtros.corpo.preco_min > 0)
    assert.ok(filtros.corpo.preco_max >= filtros.corpo.preco_min)
    assert.ok(Array.isArray(filtros.corpo.categorias))

    const destaques = await pedir("/produtos/destaques")
    assert.equal(destaques.status, 200)
    assert.ok(Array.isArray(destaques.corpo))
    assert.ok(destaques.corpo.length > 0)
    assert.ok(destaques.corpo.every(produto => Number(produto.destaque) === 1))

    const todos = await pedir("/produtos/todos")
    assert.equal(todos.status, 200)
    assert.ok(Array.isArray(todos.corpo))
    assert.ok(todos.corpo.length >= 30)
})

test("alias /produto responde igual a /produtos", async () => {
    const a = await pedir("/produto?pagina=1")
    const b = await pedir("/produtos?pagina=1")

    assert.equal(a.status, 200)
    assert.deepEqual(a.corpo.produtos.map(p => p.id), b.corpo.produtos.map(p => p.id))
})

test("POST /cliente valida os dados obrigatórios", async () => {
    const casos = [
        [{ nome: "A", cpf: "123.456.789-09", celular: "(42)99999-0000", email: "a@b.com", senha: "123456" }, /nome/],
        [{ nome: "Cliente Teste", cpf: "123", celular: "(42)99999-0000", email: "a@b.com", senha: "123456" }, /CPF/],
        [{ nome: "Cliente Teste", cpf: "123.456.789-09", celular: "42", email: "a@b.com", senha: "123456" }, /Celular/],
        [{ nome: "Cliente Teste", cpf: "123.456.789-09", celular: "(42)99999-0000", email: "sem-email", senha: "123456" }, /Email/],
        [{ nome: "Cliente Teste", cpf: "123.456.789-09", celular: "(42)99999-0000", email: "a@b.com", senha: "123" }, /senha/]
    ]

    for (const [dados, esperado] of casos) {
        const { status, corpo } = await postJson("/cliente", dados)
        assert.equal(status, 400)
        assert.match(corpo.erro, esperado)
    }
})

test("cadastro, login e perfil com JWT", async () => {
    const email = "teste_" + Date.now() + "@nextech.com"
    const dados = {
        nome: "Cliente Automatizado",
        cpf: documentoUnico(),
        celular: "(42)99999-1234",
        email,
        senha: "senhaSegura123"
    }

    const cadastro = await postJson("/cliente", dados)
    assert.equal(cadastro.status, 201)
    assert.ok(cadastro.corpo.id > 0)
    clienteCriado = { email }

    const duplicado = await postJson("/cliente", dados)
    assert.equal(duplicado.status, 409)

    const senhaErrada = await postJson("/login", { email, senha: "errada123" })
    assert.equal(senhaErrada.status, 401)

    const inexistente = await postJson("/login", { email: "ninguem_" + Date.now() + "@nextech.com", senha: "123456" })
    assert.equal(inexistente.status, 401)

    const login = await postJson("/login", { email, senha: "senhaSegura123" })
    assert.equal(login.status, 200)
    assert.ok(login.corpo.token)
    assert.equal(login.corpo.email, email)

    const semToken = await pedir("/cliente/perfil")
    assert.equal(semToken.status, 401)

    const tokenInvalido = await pedir("/cliente/perfil", {
        headers: { Authorization: "Bearer token.invalido.aqui" }
    })
    assert.equal(tokenInvalido.status, 403)

    const perfil = await pedir("/cliente/perfil", {
        headers: { Authorization: "Bearer " + login.corpo.token }
    })
    assert.equal(perfil.status, 200)
    assert.equal(perfil.corpo.email, email)
    assert.equal(perfil.corpo.nome, dados.nome)
    assert.equal(perfil.corpo.senha, undefined)
})

test("o cliente demo consegue entrar com a senha cadastrada", async () => {
    const { status, corpo } = await postJson("/login", {
        email: "demo@nextech.com",
        senha: "demo1234"
    })

    assert.equal(status, 200)
    assert.ok(corpo.token)
    assert.equal(corpo.nome, "Cliente Demo")
})

test("o site é servido pelo Express", async () => {
    const home = await pedir("/")
    assert.equal(home.status, 200)
    assert.match(home.headers.get("content-type"), /text\/html/)
    assert.match(String(home.corpo), /NexTech/)

    for (const pagina of ["produtos.html", "produto.html", "carrinho.html", "monte-seu-pc.html", "login.html", "cadastro.html", "perfil.html"]) {
        const resposta = await pedir("/" + pagina)
        assert.equal(resposta.status, 200, pagina)
    }

    const script = await pedir("/js/produtos.js")
    assert.equal(script.status, 200)
    assert.match(script.headers.get("content-type"), /javascript/)

    const imagem = await pedir("/assets/img/produtos/01-ryzen-5-5600.svg")
    assert.equal(imagem.status, 200)
})

test("rota inexistente retorna 404 em JSON", async () => {
    const { status, corpo } = await pedir("/rota-que-nao-existe")
    assert.equal(status, 404)
    assert.equal(corpo.erro, "Rota não encontrada")
})

test("corpo JSON inválido retorna 400", async () => {
    const { status, corpo } = await pedir("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{ isso não é json"
    })

    assert.equal(status, 400)
    assert.match(corpo.erro, /JSON inválido/)
})
