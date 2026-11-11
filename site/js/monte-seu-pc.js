// Monte seu PC: presets, seleção de componentes, serviços e total em tempo real.

const ETAPAS_MONTAGEM = [
    { chave: "cpu", rotulo: "Processador", categoria: "Processadores", icone: "bi-cpu", obrigatorio: true },
    { chave: "mb", rotulo: "Placa-mãe", categoria: "Placas-mãe", icone: "bi-motherboard", obrigatorio: true },
    { chave: "ram", rotulo: "Memória RAM", categoria: "Memórias", icone: "bi-memory", obrigatorio: true },
    { chave: "storage", rotulo: "Armazenamento", categoria: "Armazenamento", icone: "bi-hdd", obrigatorio: true },
    { chave: "gpu", rotulo: "Placa de vídeo", categoria: "Placas de Vídeo", icone: "bi-gpu-card", textoVazio: "Usar vídeo integrado / não incluir" },
    { chave: "psu", rotulo: "Fonte", categoria: "Fontes", icone: "bi-plug", obrigatorio: true },
    { chave: "case", rotulo: "Gabinete", categoria: "Gabinetes", icone: "bi-pc", obrigatorio: true },
    { chave: "cooler", rotulo: "Cooler", categoria: "Coolers", icone: "bi-fan", textoVazio: "Cooler padrão / não incluir" },
    { chave: "monitor", rotulo: "Monitor", categoria: "Monitores", icone: "bi-display", textoVazio: "Não incluir monitor" }
]

const estadoMontagem = {
    produtos: [],
    mapa: new Map(),
    porCategoria: new Map(),
    selecionados: {
        cpu: null, mb: null, ram: null, storage: null, gpu: null,
        psu: null, case: null, cooler: null, monitor: null
    },
    perifericos: new Set(),
    servicos: new Set(),
    presetAtivo: null
}

function obterProduto(id) {
    return estadoMontagem.mapa.get(Number(id)) || null
}

function produtosDaCategoria(categoria) {
    return estadoMontagem.porCategoria.get(categoria) || []
}

function configurarEstado(produtos) {
    estadoMontagem.produtos = produtos
    estadoMontagem.mapa = new Map(produtos.map(produto => [Number(produto.id), produto]))
    estadoMontagem.porCategoria = new Map()

    produtos.forEach(produto => {
        if (!estadoMontagem.porCategoria.has(produto.categoria)) {
            estadoMontagem.porCategoria.set(produto.categoria, [])
        }
        estadoMontagem.porCategoria.get(produto.categoria).push(produto)
    })
}

/* ------------------------------ Presets ------------------------------ */

function renderizarPresets() {
    const container = document.getElementById("presets-builder")
    container.replaceChildren()

    Object.entries(PRESETS_PC).forEach(([chave, preset]) => {
        const total = calcularTotalPreset(estadoMontagem.produtos, preset)
        const botao = document.createElement("button")
        botao.type = "button"
        botao.className = "preset-btn"
        botao.dataset.preset = chave
        botao.innerHTML = `
            <strong><i class="bi ${preset.icone} me-1"></i> ${preset.nome}</strong>
            <span>${preset.tag} • ${formatarPreco(total)}</span>`
        botao.addEventListener("click", () => aplicarPreset(chave))
        container.append(botao)
    })
}

function aplicarPreset(chave) {
    const preset = PRESETS_PC[chave]
    if (!preset) return

    Object.keys(estadoMontagem.selecionados).forEach(item => {
        estadoMontagem.selecionados[item] = null
    })
    estadoMontagem.perifericos.clear()
    estadoMontagem.servicos.clear()

    preset.ids.forEach(id => {
        const produto = obterProduto(id)
        if (!produto) return

        const etapa = ETAPAS_MONTAGEM.find(item => item.categoria === produto.categoria)
        if (etapa) {
            estadoMontagem.selecionados[etapa.chave] = Number(produto.id)
            return
        }
        if (produto.categoria === "Periféricos") {
            estadoMontagem.perifericos.add(Number(produto.id))
            return
        }
        if (produto.categoria === "Serviços") {
            estadoMontagem.servicos.add(Number(produto.id))
        }
    })

    estadoMontagem.presetAtivo = chave
    sincronizarControles()
    renderizarResumo()
    mostrarToast("Perfil " + preset.nome + " aplicado. Ajuste o que quiser!", "success")
}

function sincronizarControles() {
    ETAPAS_MONTAGEM.forEach(etapa => {
        const select = document.getElementById("select-" + etapa.chave)
        if (select) select.value = estadoMontagem.selecionados[etapa.chave] || ""
    })

    document.querySelectorAll("[data-periferico]").forEach(input => {
        input.checked = estadoMontagem.perifericos.has(Number(input.dataset.periferico))
    })

    document.querySelectorAll("[data-servico]").forEach(input => {
        input.checked = estadoMontagem.servicos.has(Number(input.dataset.servico))
    })

    document.querySelectorAll("[data-preset]").forEach(botao => {
        botao.classList.toggle("ativo", botao.dataset.preset === estadoMontagem.presetAtivo)
    })
}

/* --------------------------- Componentes --------------------------- */

function criarEtapa(etapa) {
    const linha = document.createElement("div")
    linha.className = "builder-step"

    const icone = document.createElement("span")
    icone.className = "builder-step-icone"
    icone.innerHTML = '<i class="bi ' + etapa.icone + '"></i>'

    const corpo = document.createElement("div")
    const label = document.createElement("label")
    label.setAttribute("for", "select-" + etapa.chave)
    label.textContent = etapa.rotulo

    const select = document.createElement("select")
    select.id = "select-" + etapa.chave

    const vazio = document.createElement("option")
    vazio.value = ""
    vazio.textContent = etapa.textoVazio || "Selecione " + etapa.rotulo.toLowerCase()
    select.append(vazio)

    const opcoes = produtosDaCategoria(etapa.categoria)
    opcoes.forEach(produto => {
        const option = document.createElement("option")
        option.value = String(produto.id)
        option.textContent = produto.nome + " — " + formatarPreco(produto.preco)
        select.append(option)
    })

    select.addEventListener("change", () => {
        estadoMontagem.selecionados[etapa.chave] = select.value ? Number(select.value) : null
        estadoMontagem.presetAtivo = null
        sincronizarControles()
        renderizarResumo()
    })

    corpo.append(label, select)

    const preco = document.createElement("div")
    preco.className = "step-preco"
    preco.id = "preco-" + etapa.chave

    linha.append(icone, corpo, preco)
    return linha
}

function renderizarComponentes() {
    const container = document.getElementById("etapas-componentes")
    container.replaceChildren()
    ETAPAS_MONTAGEM.forEach(etapa => container.append(criarEtapa(etapa)))
}

function renderizarPerifericos() {
    const container = document.getElementById("servicos-builder")

    const titulo = document.createElement("h3")
    titulo.className = "mt-0"
    titulo.innerHTML = '<i class="bi bi-keyboard me-1"></i> Periféricos (opcional)'
    container.append(titulo)

    produtosDaCategoria("Periféricos").forEach(produto => {
        const label = document.createElement("label")
        label.className = "servico-check"

        const input = document.createElement("input")
        input.type = "checkbox"
        input.dataset.periferico = String(produto.id)
        input.addEventListener("change", () => {
            if (input.checked) estadoMontagem.perifericos.add(Number(produto.id))
            else estadoMontagem.perifericos.delete(Number(produto.id))
            estadoMontagem.presetAtivo = null
            renderizarResumo()
        })

        const texto = document.createElement("span")
        texto.innerHTML = '<strong>' + produto.nome + '</strong> — ' + formatarPreco(produto.preco)

        label.append(input, texto)
        container.append(label)
    })

    const tituloServicos = document.createElement("h3")
    tituloServicos.className = "mt-3"
    tituloServicos.innerHTML = '<i class="bi bi-tools me-1"></i> Serviços NexTech'
    container.append(tituloServicos)

    produtosDaCategoria("Serviços").forEach(produto => {
        const label = document.createElement("label")
        label.className = "servico-check"

        const input = document.createElement("input")
        input.type = "checkbox"
        input.dataset.servico = String(produto.id)
        input.addEventListener("change", () => {
            if (input.checked) estadoMontagem.servicos.add(Number(produto.id))
            else estadoMontagem.servicos.delete(Number(produto.id))
            estadoMontagem.presetAtivo = null
            renderizarResumo()
        })

        const texto = document.createElement("span")
        texto.innerHTML = '<strong>' + produto.nome + '</strong> — ' + formatarPreco(produto.preco)

        label.append(input, texto)
        container.append(label)
    })
}

/* ------------------------------ Resumo ------------------------------ */

function itensSelecionados() {
    const itens = []

    ETAPAS_MONTAGEM.forEach(etapa => {
        const produto = obterProduto(estadoMontagem.selecionados[etapa.chave])
        if (produto) itens.push({ produto, etapa: etapa.rotulo })
    })

    estadoMontagem.perifericos.forEach(id => {
        const produto = obterProduto(id)
        if (produto) itens.push({ produto, etapa: "Periférico" })
    })

    estadoMontagem.servicos.forEach(id => {
        const produto = obterProduto(id)
        if (produto) itens.push({ produto, etapa: "Serviço" })
    })

    return itens
}

function renderizarResumo() {
    const itens = itensSelecionados()
    const lista = document.getElementById("resumo-lista")
    const total = itens.reduce((soma, item) => soma + Number(item.produto.preco), 0)

    ETAPAS_MONTAGEM.forEach(etapa => {
        const preco = document.getElementById("preco-" + etapa.chave)
        if (!preco) return
        const produto = obterProduto(estadoMontagem.selecionados[etapa.chave])
        preco.innerHTML = produto
            ? formatarPreco(produto.preco) + "<small>à vista</small>"
            : "<small>não selecionado</small>"
    })

    lista.replaceChildren()

    if (!itens.length) {
        const vazio = document.createElement("div")
        vazio.className = "resumo-vazio"
        vazio.textContent = "Nenhum componente selecionado ainda."
        lista.append(vazio)
    } else {
        itens.forEach(item => {
            const linha = document.createElement("div")
            linha.className = "resumo-item"

            const nome = document.createElement("span")
            nome.textContent = item.produto.nome

            const valor = document.createElement("span")
            valor.textContent = formatarPreco(item.produto.preco)

            linha.append(nome, valor)
            lista.append(linha)
        })
    }

    document.getElementById("resumo-quantidade").textContent = itens.length
    document.getElementById("resumo-total").textContent = formatarPreco(total)

    const parcelas = opcoesParcelamento(total)
    document.getElementById("resumo-parcelas").textContent = total > 0
        ? parcelas.vezes + "x de " + formatarPreco(parcelas.valor)
        : "—"

    const botao = document.getElementById("btn-adicionar-tudo")
    botao.disabled = itens.length === 0
    botao.style.opacity = itens.length === 0 ? ".55" : "1"
}

function limparMontagem() {
    Object.keys(estadoMontagem.selecionados).forEach(chave => {
        estadoMontagem.selecionados[chave] = null
    })
    estadoMontagem.perifericos.clear()
    estadoMontagem.servicos.clear()
    estadoMontagem.presetAtivo = null
    sincronizarControles()
    renderizarResumo()
    mostrarToast("Seleção limpa.", "warning")
}

function adicionarTudoAoCarrinho() {
    const itens = itensSelecionados()

    if (!itens.length) {
        mostrarToast("Selecione ao menos um componente.", "warning")
        return
    }

    itens.forEach(item => adicionarAoCarrinho(item.produto, 1))
    mostrarToast(itens.length + " item(ns) adicionado(s) ao carrinho!", "success")
}

function aplicarPresetDaUrl() {
    const chave = queryParams().get("preset")
    if (chave && PRESETS_PC[chave]) aplicarPreset(chave)
}

async function iniciarMontagem() {
    document.getElementById("btn-adicionar-tudo").addEventListener("click", adicionarTudoAoCarrinho)
    document.getElementById("btn-limpar-montagem").addEventListener("click", limparMontagem)

    try {
        const produtos = await apiGet("/produtos/todos")
        configurarEstado(produtos)
        renderizarPresets()
        renderizarComponentes()
        renderizarPerifericos()
        renderizarResumo()
        aplicarPresetDaUrl()
    } catch (error) {
        mostrarToast("Erro ao carregar as peças: " + error.message, "danger")
    }
}

iniciarMontagem()
