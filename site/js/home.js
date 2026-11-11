// Página inicial: destaques, categorias, presets de PC e serviços.

const CATEGORIAS_HOME = [
    { nome: "Processadores", icone: "bi-cpu" },
    { nome: "Placas de Vídeo", icone: "bi-gpu-card" },
    { nome: "Memórias", icone: "bi-memory" },
    { nome: "Armazenamento", icone: "bi-hdd" },
    { nome: "Monitores", icone: "bi-display" },
    { nome: "Periféricos", icone: "bi-keyboard" },
    { nome: "Smartphones", icone: "bi-phone" }
]

const ICONES_SERVICO = {
    "Instalação do Windows 11 + Drivers": "bi-windows",
    "Formatação e Otimização de PC": "bi-gear",
    "Montagem de PC + Teste de Estresse": "bi-tools"
}

function renderizarCategorias(categorias) {
    const container = document.getElementById("categorias-home")
    if (!container) return

    const mapa = new Map(categorias.map(categoria => [categoria.nome, categoria.total]))
    container.replaceChildren()

    CATEGORIAS_HOME.forEach(item => {
        const link = document.createElement("a")
        link.className = "categoria-card"
        link.href = "produtos.html?categoria=" + encodeURIComponent(item.nome)

        const icone = document.createElement("span")
        icone.className = "categoria-icone"
        icone.innerHTML = '<i class="bi ' + item.icone + '"></i>'

        const nome = document.createElement("strong")
        nome.textContent = item.nome

        const total = document.createElement("small")
        total.textContent = (mapa.get(item.nome) || 0) + " produtos"

        link.append(icone, nome, total)
        container.append(link)
    })
}

function renderizarDestaques(produtos) {
    const container = document.getElementById("destaques-grid")
    if (!container) return
    container.replaceChildren()
    produtos.slice(0, 8).forEach(produto => container.append(criarCardProduto(produto)))
}

function renderizarPresets(produtos) {
    const container = document.getElementById("presets-home")
    if (!container) return
    container.replaceChildren()

    Object.entries(PRESETS_PC).forEach(([chave, preset]) => {
        const total = calcularTotalPreset(produtos, preset)
        const card = document.createElement("a")
        card.className = "preset-card"
        card.href = "monte-seu-pc.html?preset=" + chave

        card.innerHTML = `
            <span class="preset-icone"><i class="bi ${preset.icone}"></i></span>
            <span class="badge-oferta" style="width:max-content">${preset.tag}</span>
            <h3>${preset.nome}</h3>
            <p>${preset.descricao}</p>
            <div class="preset-preco">a partir de<strong>${formatarPreco(total)}</strong></div>`

        container.append(card)
    })
}

function renderizarServicos(produtos) {
    const container = document.getElementById("servicos-home")
    if (!container) return

    const servicos = produtos
        .filter(produto => produto.categoria === "Serviços")
        .sort((a, b) => Number(a.preco) - Number(b.preco))
        .slice(0, 3)

    container.replaceChildren()

    servicos.forEach(servico => {
        const card = document.createElement("a")
        card.className = "servico-card"
        card.href = "produto.html?id=" + servico.id

        const icone = document.createElement("span")
        icone.className = "servico-icone"
        icone.innerHTML = '<i class="bi ' + (ICONES_SERVICO[servico.nome] || "bi-tools") + '"></i>'

        const texto = document.createElement("div")
        const titulo = document.createElement("h3")
        titulo.textContent = servico.nome
        const descricao = document.createElement("p")
        descricao.textContent = servico.descricao
        const preco = document.createElement("div")
        preco.className = "preco"
        preco.textContent = formatarPreco(servico.preco)

        texto.append(titulo, descricao, preco)
        card.append(icone, texto)
        container.append(card)
    })
}

function atualizarEstatisticas(filtros) {
    const produtos = document.getElementById("stat-produtos")
    const categorias = document.getElementById("stat-categorias")
    const menor = document.getElementById("stat-menor")

    if (produtos) produtos.textContent = filtros.total + "+"
    if (categorias) categorias.textContent = filtros.categorias.length
    if (menor) menor.textContent = formatarPreco(filtros.preco_min)
}

async function carregarHome() {
    preencherSkeletons(document.getElementById("destaques-grid"), 8)

    try {
        const [destaques, filtros, produtos] = await Promise.all([
            apiGet("/produtos/destaques"),
            apiGet("/produtos/filtros"),
            apiGet("/produtos/todos")
        ])

        renderizarDestaques(destaques)
        renderizarCategorias(filtros.categorias)
        renderizarPresets(produtos)
        renderizarServicos(produtos)
        atualizarEstatisticas(filtros)
    } catch (error) {
        const container = document.getElementById("destaques-grid")
        if (container) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1">
                    <i class="bi bi-wifi-off"></i>
                    <h3>Não foi possível carregar a loja</h3>
                    <p>Verifique se a API está rodando em http://localhost:3000.</p>
                    <button class="btn-nextech" onclick="location.reload()">Tentar novamente</button>
                </div>`
        }
        mostrarToast("Erro ao carregar a página inicial: " + error.message, "danger")
    }
}

carregarHome()
