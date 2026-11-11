// Componentes reutilizáveis: cards, preços, estrelas, toast e carrinho local.

const IMG_PADRAO = "data:image/svg+xml;utf8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#061a2e"/><stop offset="1" stop-color="#0b3b6f"/></linearGradient></defs>' +
    '<rect width="800" height="600" fill="url(#g)"/>' +
    '<text x="400" y="300" fill="#22d3ee" font-family="Arial" font-size="34" font-weight="bold" text-anchor="middle" dominant-baseline="middle">NEXTECH</text>' +
    '<text x="400" y="342" fill="#94a3b8" font-family="Arial" font-size="18" text-anchor="middle">Imagem indisponível</text></svg>'
)

const CHAVE_CARRINHO = "nextech_carrinho"
const CHAVE_FAVORITOS = "nextech_favoritos"

function escapeHtml(valor) {
    return String(valor === undefined || valor === null ? "" : valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
}

function formatarPreco(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    })
}

function formatarNumero(valor) {
    return Number(valor || 0).toLocaleString("pt-BR")
}

function opcoesParcelamento(preco) {
    const valor = Number(preco || 0)
    const vezes = valor >= 300 ? 12 : valor >= 120 ? 6 : valor >= 60 ? 3 : 1
    return { vezes, valor: valor / vezes }
}

function calcularDesconto(preco, precoAntigo) {
    if (!precoAntigo || Number(precoAntigo) <= Number(preco)) return 0
    return Math.round((1 - Number(preco) / Number(precoAntigo)) * 100)
}

function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag)
    if (classe) elemento.className = classe
    if (texto !== undefined && texto !== null) elemento.textContent = texto
    return elemento
}

function configurarImagem(img, produto) {
    img.loading = "lazy"
    img.alt = produto ? produto.nome : "Produto NexTech"
    img.addEventListener("error", () => {
        img.onerror = null
        img.src = IMG_PADRAO
    }, { once: true })
    if (produto && produto.caminho_img) img.src = produto.caminho_img
    else img.src = IMG_PADRAO
}

function criarEstrelas(nota, avaliacoes) {
    const container = criarElemento("div", "rating")
    const valor = Number(nota || 0)

    for (let i = 1; i <= 5; i++) {
        const icone = document.createElement("i")
        if (valor >= i) icone.className = "bi bi-star-fill"
        else if (valor >= i - 0.5) icone.className = "bi bi-star-half"
        else icone.className = "bi bi-star"
        container.append(icone)
    }

    const texto = document.createElement("span")
    texto.textContent = valor.toFixed(1) + (avaliacoes ? " (" + formatarNumero(avaliacoes) + ")" : "")
    container.append(texto)
    return container
}

function mostrarToast(mensagem, tipo = "success") {
    let container = document.getElementById("toast-container")
    if (!container) {
        container = criarElemento("div", "toast-container position-fixed top-0 end-0 p-3")
        container.id = "toast-container"
        container.style.zIndex = "1090"
        document.body.append(container)
    }

    const toast = criarElemento("div", "toast align-items-center text-bg-" + tipo + " border-0")
    toast.setAttribute("role", "alert")
    toast.setAttribute("aria-live", "assertive")
    toast.setAttribute("aria-atomic", "true")

    const flex = criarElemento("div", "d-flex")
    const corpo = criarElemento("div", "toast-body d-flex align-items-center gap-2")
    const icone = document.createElement("i")
    icone.className = tipo === "danger"
        ? "bi bi-exclamation-triangle-fill"
        : tipo === "warning"
            ? "bi bi-exclamation-circle-fill"
            : "bi bi-check-circle-fill"
    const texto = document.createElement("span")
    texto.textContent = mensagem
    corpo.append(icone, texto)

    const fechar = criarElemento("button", "btn-close btn-close-white me-2 m-auto")
    fechar.type = "button"
    fechar.setAttribute("data-bs-dismiss", "toast")
    fechar.setAttribute("aria-label", "Fechar")

    flex.append(corpo, fechar)
    toast.append(flex)
    container.append(toast)

    if (window.bootstrap && bootstrap.Toast) {
        const instancia = new bootstrap.Toast(toast, { delay: 3800 })
        toast.addEventListener("hidden.bs.toast", () => toast.remove())
        instancia.show()
    } else {
        setTimeout(() => toast.remove(), 3800)
    }
}

/* ----------------------------- Carrinho ----------------------------- */
function getCarrinho() {
    try {
        const dados = JSON.parse(localStorage.getItem(CHAVE_CARRINHO) || "[]")
        return Array.isArray(dados) ? dados.filter(item => item && item.id) : []
    } catch {
        return []
    }
}

function salvarCarrinho(carrinho) {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho))
    atualizarBadgeCarrinho()
}

function adicionarAoCarrinho(produto, quantidade = 1) {
    const carrinho = getCarrinho()
    const existente = carrinho.find(item => Number(item.id) === Number(produto.id))
    const limite = Number(produto.estoque || 999)

    if (existente) {
        existente.qtd = Math.min(Number(existente.qtd || 0) + Number(quantidade), limite)
    } else {
        carrinho.push({
            id: Number(produto.id),
            nome: produto.nome,
            preco: Number(produto.preco),
            preco_antigo: produto.preco_antigo ? Number(produto.preco_antigo) : null,
            caminho_img: produto.caminho_img,
            categoria: produto.categoria,
            marca: produto.marca,
            estoque: limite,
            qtd: Math.min(Number(quantidade), limite)
        })
    }

    salvarCarrinho(carrinho)
    return carrinho
}

function removerDoCarrinho(id) {
    salvarCarrinho(getCarrinho().filter(item => Number(item.id) !== Number(id)))
}

function alterarQuantidadeCarrinho(id, delta) {
    const carrinho = getCarrinho()
    const item = carrinho.find(produto => Number(produto.id) === Number(id))
    if (!item) return

    const limite = Number(item.estoque || 999)
    item.qtd = Math.max(1, Math.min(Number(item.qtd || 1) + Number(delta), limite))
    salvarCarrinho(carrinho)
}

function limparCarrinho() {
    localStorage.removeItem(CHAVE_CARRINHO)
    atualizarBadgeCarrinho()
}

function totalCarrinho(carrinho = getCarrinho()) {
    return carrinho.reduce((total, item) => total + Number(item.preco) * Number(item.qtd || 1), 0)
}

function quantidadeCarrinho() {
    return getCarrinho().reduce((total, item) => total + Number(item.qtd || 1), 0)
}

function atualizarBadgeCarrinho() {
    const quantidade = quantidadeCarrinho()
    document.querySelectorAll("[data-cart-count]").forEach(elemento => {
        elemento.textContent = quantidade > 99 ? "99+" : String(quantidade)
        elemento.style.display = quantidade > 0 ? "grid" : "none"
    })
}

/* ----------------------------- Favoritos ----------------------------- */
function getFavoritos() {
    try {
        const dados = JSON.parse(localStorage.getItem(CHAVE_FAVORITOS) || "[]")
        return Array.isArray(dados) ? dados.map(Number) : []
    } catch {
        return []
    }
}

function toggleFavorito(id) {
    const favoritos = getFavoritos()
    const numero = Number(id)
    const indice = favoritos.indexOf(numero)
    if (indice >= 0) favoritos.splice(indice, 1)
    else favoritos.push(numero)
    localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(favoritos))
    return favoritos.includes(numero)
}

/* ----------------------------- Cards ----------------------------- */
function criarCardProduto(produto) {
    const card = criarElemento("article", "product-card")
    const desconto = calcularDesconto(produto.preco, produto.preco_antigo)
    const parcelas = opcoesParcelamento(produto.preco)
    const link = "produto.html?id=" + produto.id

    const media = criarElemento("div", "product-media")
    const linkImagem = document.createElement("a")
    linkImagem.href = link
    linkImagem.setAttribute("aria-label", "Ver " + produto.nome)
    const imagem = document.createElement("img")
    configurarImagem(imagem, produto)
    linkImagem.append(imagem)
    media.append(linkImagem)

    const badges = criarElemento("div", "product-badges")
    if (desconto > 0) badges.append(criarElemento("span", "badge-oferta", "-" + desconto + "%"))
    if (Number(produto.preco) >= 299) badges.append(criarElemento("span", "badge-frete", "Frete grátis"))
    if (badges.children.length) media.append(badges)

    const favorito = criarElemento("button", "product-fav")
    favorito.type = "button"
    favorito.setAttribute("aria-label", "Favoritar produto")
    const favoritos = getFavoritos()
    const ativo = favoritos.includes(Number(produto.id))
    favorito.classList.toggle("ativo", ativo)
    favorito.innerHTML = ativo ? '<i class="bi bi-heart-fill"></i>' : '<i class="bi bi-heart"></i>'
    favorito.addEventListener("click", event => {
        event.preventDefault()
        const marcado = toggleFavorito(produto.id)
        favorito.classList.toggle("ativo", marcado)
        favorito.innerHTML = marcado ? '<i class="bi bi-heart-fill"></i>' : '<i class="bi bi-heart"></i>'
        mostrarToast(marcado ? "Produto adicionado aos favoritos." : "Produto removido dos favoritos.", "success")
    })
    media.append(favorito)

    const corpo = criarElemento("div", "product-body")
    const marca = criarElemento("div", "product-brand")
    marca.append(criarElemento("span", "", produto.marca || "NexTech"))
    marca.append(criarElemento("span", "", produto.categoria || ""))
    corpo.append(marca)

    const nome = document.createElement("a")
    nome.className = "product-name"
    nome.href = link
    nome.textContent = produto.nome
    corpo.append(nome)

    corpo.append(criarEstrelas(produto.avaliacao, produto.avaliacoes))

    const preco = criarElemento("div", "product-price")
    if (produto.preco_antigo && Number(produto.preco_antigo) > Number(produto.preco)) {
        preco.append(criarElemento("div", "price-old", "De " + formatarPreco(produto.preco_antigo)))
    }
    preco.append(criarElemento("div", "price-current", formatarPreco(produto.preco)))
    const parcelamento = criarElemento("div", "price-installments")
    parcelamento.innerHTML = "ou <strong>" + parcelas.vezes + "x de " + formatarPreco(parcelas.valor) + "</strong> sem juros"
    preco.append(parcelamento)
    corpo.append(preco)

    const estoque = Number(produto.estoque || 0)
    const status = criarElemento("div", "product-stock" + (estoque <= 5 ? " baixo" : ""))
    status.innerHTML = estoque > 0
        ? '<i class="bi bi-check-circle-fill"></i> ' + (estoque > 5 ? "Em estoque" : "Últimas " + estoque + " unidades")
        : '<i class="bi bi-x-circle-fill"></i> Esgotado'
    corpo.append(status)

    const acoes = criarElemento("div", "product-actions")
    const adicionar = criarElemento("button", "btn-add-cart")
    adicionar.type = "button"
    adicionar.innerHTML = '<i class="bi bi-bag-plus"></i> Adicionar'
    adicionar.disabled = estoque <= 0
    adicionar.addEventListener("click", () => {
        adicionarAoCarrinho(produto, 1)
        mostrarToast("Produto adicionado ao carrinho!", "success")
    })
    const detalhes = document.createElement("a")
    detalhes.className = "btn-detail"
    detalhes.href = link
    detalhes.setAttribute("aria-label", "Ver detalhes de " + produto.nome)
    detalhes.innerHTML = '<i class="bi bi-arrow-right"></i>'
    acoes.append(adicionar, detalhes)
    corpo.append(acoes)

    card.append(media, corpo)
    return card
}

function criarSkeletonCard() {
    const card = criarElemento("div", "skeleton-card")
    card.innerHTML = `
        <div class="skeleton sk-img"></div>
        <div class="sk-body">
            <div class="skeleton sk-line curta"></div>
            <div class="skeleton sk-line media"></div>
            <div class="skeleton sk-line"></div>
            <div class="skeleton sk-line alta"></div>
        </div>`
    return card
}

function preencherSkeletons(container, quantidade = 10) {
    container.replaceChildren()
    for (let i = 0; i < quantidade; i++) container.append(criarSkeletonCard())
}

function debounce(funcao, espera = 400) {
    let timer
    return (...args) => {
        clearTimeout(timer)
        timer = setTimeout(() => funcao(...args), espera)
    }
}

window.addEventListener("storage", event => {
    if (event.key === CHAVE_CARRINHO) atualizarBadgeCarrinho()
})
