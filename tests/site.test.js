// Testes estáticos do front-end: arquivos, referências e elementos essenciais.

const test = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")

const raiz = path.join(__dirname, "..")
const site = path.join(raiz, "site")

const paginas = [
    "index.html",
    "produtos.html",
    "produto.html",
    "carrinho.html",
    "monte-seu-pc.html",
    "login.html",
    "cadastro.html",
    "perfil.html"
]

function ler(relativo) {
    return fs.readFileSync(path.join(site, relativo), "utf8")
}

test("todas as páginas existem e usam o layout novo", () => {
    paginas.forEach(pagina => {
        const caminho = path.join(site, pagina)
        assert.ok(fs.existsSync(caminho), "faltando: " + pagina)

        const html = ler(pagina)
        assert.match(html, /<html lang="pt-BR">/, pagina)
        assert.match(html, /<meta name="viewport"/, pagina)
        assert.match(html, /css\/style\.css/, pagina)
        assert.match(html, /js\/layout\.js/, pagina)
        assert.match(html, /id="site-header"/, pagina)
        assert.match(html, /id="site-footer"/, pagina)
        assert.match(html, /NexTech/, pagina)
    })
})

test("arquivos antigos foram removidos", () => {
    ;["pages.js", "produtos.js", "style.css", "logo.png"].forEach(antigo => {
        assert.equal(fs.existsSync(path.join(site, antigo)), false, "ainda existe: " + antigo)
    })
})

test("scripts e folhas de estilo referenciados existem", () => {
    paginas.forEach(pagina => {
        const html = ler(pagina)
        const referencias = [...html.matchAll(/(?:src|href)="((?:js|css|assets|vendor)\/[^"]+)"/g)].map(m => m[1])

        referencias.forEach(referencia => {
            const alvo = path.join(site, referencia)
            assert.ok(fs.existsSync(alvo), pagina + " -> " + referencia)
        })
    })
})

test("as 50 imagens de produto existem e são SVG válidos", () => {
    const produtos = require("../data/produtos")
    assert.equal(produtos.length, 50)

    produtos.forEach(produto => {
        const arquivo = path.join(site, produto.caminho_img)
        assert.ok(fs.existsSync(arquivo), "faltando imagem: " + produto.caminho_img)

        const svg = fs.readFileSync(arquivo, "utf8")
        assert.match(svg, /^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)
        assert.match(svg, /<\/svg>\s*$/)

        // Atributos duplicados invalidam o XML e fazem o navegador descartar o SVG.
        const tags = svg.match(/<[a-zA-Z][^>]*>/g) || []
        tags.forEach(tag => {
            const nomes = [...tag.matchAll(/([\w:-]+)\s*=/g)].map(m => m[1])
            const vistos = new Set()
            nomes.forEach(nome => {
                assert.equal(vistos.has(nome), false, produto.caminho_img + " atributo duplicado: " + nome)
                vistos.add(nome)
            })
        })
    })
})

test("catálogo tem busca, categoria, preço, ordenação e paginação", () => {
    const html = ler("produtos.html")

    ;["busca-catalogo", "lista-categorias", "range-min", "range-max", "ordenar", "grid-catalogo", "paginacao", "chips-filtros"]
        .forEach(id => assert.match(html, new RegExp('id="' + id + '"'), "faltando #" + id))

    const js = ler("js/produtos.js")
    assert.match(js, /const POR_PAGINA = 10/)
    assert.match(js, /preco_min/)
    assert.match(js, /preco_max/)
    assert.match(js, /menor_preco/)
    assert.match(js, /maior_preco/)
})

test("carrinho exige login para finalizar a compra", () => {
    const html = ler("carrinho.html")
    const js = ler("js/carrinho.js")

    assert.match(html, /id="modal-login"/)
    assert.match(js, /estaLogado\(\)/)
    assert.match(js, /loginUrl\("carrinho\.html"\)/)
    assert.match(js, /nextech_carrinho|getCarrinho/)
})

test("login guarda nome_cliente e token no localStorage", () => {
    const api = ler("js/api.js")
    const login = ler("js/login.js")

    assert.match(api, /localStorage\.setItem\("nome_cliente"/)
    assert.match(api, /localStorage\.setItem\("token"/)
    assert.match(login, /apiPost\("\/login"/)
    assert.match(login, /salvarSessao/)
})

test("cadastro envia os campos esperados para POST /cliente", () => {
    const html = ler("cadastro.html")
    const js = ler("js/cadastro.js")

    ;["nome", "cpf", "celular", "email", "senha"].forEach(campo => {
        assert.match(html, new RegExp('id="' + campo + '"'), "campo ausente no HTML: " + campo)
        assert.match(js, new RegExp('getElementById\\("' + campo + '"\\)'), "campo ausente no JS: " + campo)
    })

    assert.match(js, /apiPost\("\/cliente"/)
})

test("perfil usa a rota protegida e o token", () => {
    const js = ler("js/perfil.js")

    assert.match(js, /apiGetAuth\("\/cliente\/perfil"\)/)
    assert.match(js, /estaLogado\(\)/)
})

test("layout escapa o nome do cliente antes de montar o HTML", () => {
    const js = ler("js/layout.js")
    const ui = ler("js/ui.js")

    assert.match(ui, /function escapeHtml/)
    assert.match(js, /escapeHtml\(primeiro\)/)
    assert.match(js, /escapeHtml\(inicial\)/)
})
