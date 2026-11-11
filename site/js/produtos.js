// Catálogo com busca, categoria, faixa de preço, ordenação e paginação.

const estadoCatalogo = {
    nome: "",
    categoria: "",
    preco_min: null,
    preco_max: null,
    ordem: "relevancia",
    pagina: 1,
    total: 0,
    totalPaginas: 1,
    limites: { min: 0, max: 0 }
}

const ORDENS_VALIDAS = ["relevancia", "destaques", "menor_preco", "maior_preco", "nome_az", "nome_za", "avaliacao", "novidades"]
const POR_PAGINA = 10

function el(id) {
    return document.getElementById(id)
}

function lerUrl() {
    const params = queryParams()
    estadoCatalogo.nome = params.get("nome") || ""
    estadoCatalogo.categoria = params.get("categoria") || ""

    const min = params.get("preco_min")
    const max = params.get("preco_max")
    estadoCatalogo.preco_min = min !== null && min !== "" && Number.isFinite(Number(min)) ? Number(min) : null
    estadoCatalogo.preco_max = max !== null && max !== "" && Number.isFinite(Number(max)) ? Number(max) : null

    const ordem = params.get("ordem") || "relevancia"
    estadoCatalogo.ordem = ORDENS_VALIDAS.includes(ordem) ? ordem : "relevancia"

    const pagina = Number(params.get("pagina") || 1)
    estadoCatalogo.pagina = Number.isInteger(pagina) && pagina > 0 ? pagina : 1
}

function atualizarUrl() {
    const params = new URLSearchParams()
    if (estadoCatalogo.nome) params.set("nome", estadoCatalogo.nome)
    if (estadoCatalogo.categoria) params.set("categoria", estadoCatalogo.categoria)
    if (estadoCatalogo.preco_min !== null) params.set("preco_min", estadoCatalogo.preco_min)
    if (estadoCatalogo.preco_max !== null) params.set("preco_max", estadoCatalogo.preco_max)
    if (estadoCatalogo.ordem !== "relevancia") params.set("ordem", estadoCatalogo.ordem)
    if (estadoCatalogo.pagina > 1) params.set("pagina", estadoCatalogo.pagina)

    const query = params.toString()
    history.replaceState(null, "", location.pathname + (query ? "?" + query : ""))
}

function valorMinimo() {
    return estadoCatalogo.preco_min === null ? estadoCatalogo.limites.min : estadoCatalogo.preco_min
}

function valorMaximo() {
    return estadoCatalogo.preco_max === null ? estadoCatalogo.limites.max : estadoCatalogo.preco_max
}

function atualizarPrecoUI() {
    const min = valorMinimo()
    const max = valorMaximo()
    const limiteMin = estadoCatalogo.limites.min
    const limiteMax = estadoCatalogo.limites.max
    const intervalo = Math.max(1, limiteMax - limiteMin)

    const rangeMin = el("range-min")
    const rangeMax = el("range-max")
    const inputMin = el("preco-min")
    const inputMax = el("preco-max")

    if (!rangeMin || !rangeMax) return

    rangeMin.min = limiteMin
    rangeMin.max = limiteMax
    rangeMax.min = limiteMin
    rangeMax.max = limiteMax
    rangeMin.value = min
    rangeMax.value = max
    if (inputMin) { inputMin.min = limiteMin; inputMin.max = limiteMax; inputMin.value = Math.round(min) }
    if (inputMax) { inputMax.min = limiteMin; inputMax.max = limiteMax; inputMax.value = Math.round(max) }

    const fill = el("price-fill")
    if (fill) {
        fill.style.left = ((min - limiteMin) / intervalo * 100) + "%"
        fill.style.width = ((max - min) / intervalo * 100) + "%"
    }
}

function renderizarCategorias(categorias) {
    const container = el("lista-categorias")
    if (!container) return

    const total = categorias.reduce((soma, categoria) => soma + Number(categoria.total), 0)
    container.replaceChildren()

    const botaoTodas = document.createElement("button")
    botaoTodas.type = "button"
    botaoTodas.classList.toggle("ativo", !estadoCatalogo.categoria)
    botaoTodas.innerHTML = "<span>Todas as categorias</span><span>" + total + "</span>"
    botaoTodas.addEventListener("click", () => selecionarCategoria(""))
    container.append(botaoTodas)

    categorias.forEach(categoria => {
        const botao = document.createElement("button")
        botao.type = "button"
        botao.classList.toggle("ativo", categoria.nome === estadoCatalogo.categoria)
        const nome = document.createElement("span")
        nome.textContent = categoria.nome
        const quantidade = document.createElement("span")
        quantidade.textContent = categoria.total
        botao.append(nome, quantidade)
        botao.addEventListener("click", () => selecionarCategoria(categoria.nome))
        container.append(botao)
    })
}

function selecionarCategoria(categoria) {
    estadoCatalogo.categoria = categoria
    estadoCatalogo.pagina = 1
    fecharFiltrosMobile()
    carregarProdutos()
}

function montarParametros() {
    const params = new URLSearchParams()
    params.set("pagina", estadoCatalogo.pagina)
    if (estadoCatalogo.nome) params.set("nome", estadoCatalogo.nome)
    if (estadoCatalogo.categoria) params.set("categoria", estadoCatalogo.categoria)
    if (estadoCatalogo.preco_min !== null) params.set("preco_min", estadoCatalogo.preco_min)
    if (estadoCatalogo.preco_max !== null) params.set("preco_max", estadoCatalogo.preco_max)
    if (estadoCatalogo.ordem !== "relevancia") params.set("ordem", estadoCatalogo.ordem)
    return params.toString()
}

function renderizarVazio() {
    const container = el("grid-catalogo")
    container.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
            <i class="bi bi-search"></i>
            <h3>Nenhum produto encontrado</h3>
            <p>Tente remover alguns filtros ou buscar por outro termo.</p>
            <button type="button" class="btn-nextech" id="btn-limpar-vazio">Limpar filtros</button>
        </div>`
    const botao = el("btn-limpar-vazio")
    if (botao) botao.addEventListener("click", limparFiltros)
}

function renderizarProdutos(produtos) {
    const container = el("grid-catalogo")
    if (!container) return

    if (!produtos.length) {
        renderizarVazio()
        return
    }

    container.replaceChildren()
    produtos.forEach(produto => container.append(criarCardProduto(produto)))
}

function atualizarResultado(produtos) {
    const info = el("resultado-info")
    if (!info) return

    if (estadoCatalogo.total === 0) {
        info.innerHTML = "Mostrando <strong>0</strong> produtos";
        return
    }

    const inicio = (estadoCatalogo.pagina - 1) * POR_PAGINA + 1
    const fim = inicio + produtos.length - 1
    info.innerHTML = "Mostrando <strong>" + inicio + "–" + fim + "</strong> de <strong>" +
        estadoCatalogo.total + "</strong> produtos"
}

function renderizarPaginacao() {
    const container = el("paginacao")
    if (!container) return
    container.replaceChildren()

    const total = estadoCatalogo.totalPaginas
    if (total <= 1) return

    const criarBotao = (texto, pagina, desabilitado = false, ativo = false, aria = "") => {
        const botao = document.createElement("button")
        botao.type = "button"
        botao.innerHTML = texto
        botao.disabled = desabilitado
        botao.classList.toggle("ativo", ativo)
        if (aria) botao.setAttribute("aria-label", aria)
        if (!desabilitado && !ativo) {
            botao.addEventListener("click", () => {
                estadoCatalogo.pagina = pagina
                carregarProdutos()
                const topo = document.querySelector(".catalogo-hero")
                if (topo) topo.scrollIntoView({ behavior: "smooth", block: "start" })
            })
        }
        return botao
    }

    container.append(criarBotao('<i class="bi bi-chevron-left"></i>', estadoCatalogo.pagina - 1, estadoCatalogo.pagina <= 1, false, "Página anterior"))

    const paginas = []
    if (total <= 7) {
        for (let i = 1; i <= total; i++) paginas.push(i)
    } else {
        paginas.push(1)
        if (estadoCatalogo.pagina > 3) paginas.push("...")
        for (let i = Math.max(2, estadoCatalogo.pagina - 1); i <= Math.min(total - 1, estadoCatalogo.pagina + 1); i++) paginas.push(i)
        if (estadoCatalogo.pagina < total - 2) paginas.push("...")
        paginas.push(total)
    }

    paginas.forEach(pagina => {
        if (pagina === "...") {
            const span = document.createElement("button")
            span.type = "button"
            span.textContent = "..."
            span.disabled = true
            container.append(span)
        } else {
            container.append(criarBotao(String(pagina), pagina, false, pagina === estadoCatalogo.pagina, "Página " + pagina))
        }
    })

    container.append(criarBotao('<i class="bi bi-chevron-right"></i>', estadoCatalogo.pagina + 1, estadoCatalogo.pagina >= total, false, "Próxima página"))
}

function renderizarChips() {
    const container = el("chips-filtros")
    if (!container) return
    container.replaceChildren()

    const adicionar = (texto, limpar) => {
        const chip = document.createElement("span")
        chip.className = "chip-filtro"
        const label = document.createElement("span")
        label.textContent = texto
        const botao = document.createElement("button")
        botao.type = "button"
        botao.innerHTML = '<i class="bi bi-x"></i>'
        botao.setAttribute("aria-label", "Remover filtro " + texto)
        botao.addEventListener("click", limpar)
        chip.append(label, botao)
        container.append(chip)
    }

    if (estadoCatalogo.nome) {
        adicionar('Busca: "' + estadoCatalogo.nome + '"', () => {
            estadoCatalogo.nome = ""
            estadoCatalogo.pagina = 1
            carregarProdutos()
        })
    }

    if (estadoCatalogo.categoria) {
        adicionar(estadoCatalogo.categoria, () => selecionarCategoria(""))
    }

    if (estadoCatalogo.preco_min !== null || estadoCatalogo.preco_max !== null) {
        adicionar(
            "Preço: " + formatarPreco(valorMinimo()) + " – " + formatarPreco(valorMaximo()),
            () => {
                estadoCatalogo.preco_min = null
                estadoCatalogo.preco_max = null
                estadoCatalogo.pagina = 1
                carregarProdutos()
            }
        )
    }
}

function atualizarTitulo() {
    const titulo = el("titulo-catalogo")
    const subtitulo = el("subtitulo-catalogo")
    if (titulo) titulo.textContent = estadoCatalogo.categoria || "Todos os produtos"
    if (subtitulo) {
        subtitulo.textContent = estadoCatalogo.categoria
            ? "Confira os melhores produtos da categoria " + estadoCatalogo.categoria + "."
            : "Encontre o componente, celular ou PC ideal para você."
    }
    document.title = (estadoCatalogo.categoria || "Produtos") + " | NexTech Informática"
}

async function carregarProdutos() {
    const grid = el("grid-catalogo")
    preencherSkeletons(grid, 9)
    const info = el("resultado-info")
    if (info) info.textContent = "Carregando produtos..."

    try {
        const dados = await apiGet("/produtos?" + montarParametros())
        estadoCatalogo.total = dados.total
        estadoCatalogo.totalPaginas = dados.total_paginas

        if (estadoCatalogo.pagina > dados.total_paginas && dados.total > 0) {
            estadoCatalogo.pagina = dados.total_paginas
            return carregarProdutos()
        }

        renderizarProdutos(dados.produtos)
        atualizarResultado(dados.produtos)
        renderizarPaginacao()
        renderizarChips()
        atualizarUrl()
        atualizarTitulo()
        atualizarPrecoUI()
    } catch (error) {
        if (grid) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1">
                    <i class="bi bi-wifi-off"></i>
                    <h3>Não foi possível carregar os produtos</h3>
                    <p>${escapeHtml(error.message)}</p>
                    <button type="button" class="btn-nextech" onclick="location.reload()">Tentar novamente</button>
                </div>`
        }
        mostrarToast("Erro ao carregar produtos: " + error.message, "danger")
    }
}

async function carregarFiltros() {
    try {
        const dados = await apiGet("/produtos/filtros")
        estadoCatalogo.limites.min = Math.floor(Number(dados.preco_min) || 0)
        estadoCatalogo.limites.max = Math.ceil(Number(dados.preco_max) || 0)

        // Aceita categorias no singular/parcial, como "processador".
        if (estadoCatalogo.categoria) {
            const exata = dados.categorias.find(categoria =>
                categoria.nome.toLowerCase() === estadoCatalogo.categoria.toLowerCase()
            )
            if (!exata) {
                const parcial = dados.categorias.find(categoria =>
                    categoria.nome.toLowerCase().includes(estadoCatalogo.categoria.toLowerCase())
                )
                if (parcial) estadoCatalogo.categoria = parcial.nome
            }
        }

        renderizarCategorias(dados.categorias)
        atualizarPrecoUI()
    } catch (error) {
        mostrarToast("Erro ao carregar filtros: " + error.message, "danger")
    }
}

function aplicarPreco() {
    const rangeMin = Number(el("range-min").value)
    const rangeMax = Number(el("range-max").value)
    const min = Math.min(rangeMin, rangeMax)
    const max = Math.max(rangeMin, rangeMax)

    estadoCatalogo.preco_min = min > estadoCatalogo.limites.min ? min : null
    estadoCatalogo.preco_max = max < estadoCatalogo.limites.max ? max : null
    estadoCatalogo.pagina = 1
    carregarProdutos()
}

const aplicarPrecoComDebounce = debounce(aplicarPreco, 450)

function configurarPreco() {
    const rangeMin = el("range-min")
    const rangeMax = el("range-max")
    const inputMin = el("preco-min")
    const inputMax = el("preco-max")

    if (!rangeMin || !rangeMax) return

    rangeMin.addEventListener("input", () => {
        if (Number(rangeMin.value) > Number(rangeMax.value) - 10) {
            rangeMin.value = Math.max(estadoCatalogo.limites.min, Number(rangeMax.value) - 10)
        }
        atualizarPrecoUI()
        aplicarPrecoComDebounce()
    })

    rangeMax.addEventListener("input", () => {
        if (Number(rangeMax.value) < Number(rangeMin.value) + 10) {
            rangeMax.value = Math.min(estadoCatalogo.limites.max, Number(rangeMin.value) + 10)
        }
        atualizarPrecoUI()
        aplicarPrecoComDebounce()
    })

    rangeMin.addEventListener("change", aplicarPreco)
    rangeMax.addEventListener("change", aplicarPreco)

    const aplicarInputs = () => {
        let min = Number(inputMin.value || estadoCatalogo.limites.min)
        let max = Number(inputMax.value || estadoCatalogo.limites.max)
        if (min > max) [min, max] = [max, min]
        min = Math.max(estadoCatalogo.limites.min, Math.min(min, estadoCatalogo.limites.max))
        max = Math.max(estadoCatalogo.limites.min, Math.min(max, estadoCatalogo.limites.max))
        inputMin.value = Math.round(min)
        inputMax.value = Math.round(max)
        atualizarPrecoUI()
        aplicarPreco()
    }

    inputMin.addEventListener("change", aplicarInputs)
    inputMax.addEventListener("change", aplicarInputs)
}

function limparFiltros() {
    estadoCatalogo.nome = ""
    estadoCatalogo.categoria = ""
    estadoCatalogo.preco_min = null
    estadoCatalogo.preco_max = null
    estadoCatalogo.ordem = "relevancia"
    estadoCatalogo.pagina = 1
    const busca = el("busca-catalogo")
    const ordenar = el("ordenar")
    if (busca) busca.value = ""
    if (ordenar) ordenar.value = "relevancia"
    atualizarPrecoUI()
    fecharFiltrosMobile()
    carregarProdutos()
}

function abrirFiltrosMobile() {
    el("filtros-painel").classList.add("aberto")
    el("filtros-backdrop").classList.add("visivel")
}

function fecharFiltrosMobile() {
    const painel = el("filtros-painel")
    const backdrop = el("filtros-backdrop")
    if (painel) painel.classList.remove("aberto")
    if (backdrop) backdrop.classList.remove("visivel")
}

function configurarEventos() {
    const formBusca = el("form-busca-catalogo")
    if (formBusca) {
        formBusca.addEventListener("submit", event => {
            event.preventDefault()
            estadoCatalogo.nome = el("busca-catalogo").value.trim()
            estadoCatalogo.pagina = 1
            fecharFiltrosMobile()
            carregarProdutos()
        })
    }

    const ordenar = el("ordenar")
    if (ordenar) {
        ordenar.addEventListener("change", () => {
            estadoCatalogo.ordem = ordenar.value
            estadoCatalogo.pagina = 1
            carregarProdutos()
        })
    }

    const limpar = el("btn-limpar-filtros")
    if (limpar) limpar.addEventListener("click", limparFiltros)

    const abrir = el("btn-abrir-filtros")
    if (abrir) abrir.addEventListener("click", abrirFiltrosMobile)

    const fechar = el("btn-fechar-filtros")
    if (fechar) fechar.addEventListener("click", fecharFiltrosMobile)

    const backdrop = el("filtros-backdrop")
    if (backdrop) backdrop.addEventListener("click", fecharFiltrosMobile)

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") fecharFiltrosMobile()
    })

    configurarPreco()
}

async function iniciarCatalogo() {
    lerUrl()
    configurarEventos()

    const busca = el("busca-catalogo")
    const ordenar = el("ordenar")
    if (busca) busca.value = estadoCatalogo.nome
    if (ordenar) ordenar.value = estadoCatalogo.ordem

    await carregarFiltros()
    await carregarProdutos()
}

iniciarCatalogo()
