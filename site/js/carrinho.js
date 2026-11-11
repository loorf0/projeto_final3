// Carrinho: itens no localStorage, totais, cupom, frete e finalização com login.

const CHAVE_PEDIDOS = "nextech_pedidos"
const CUPOM_VALIDO = "NEXTECH10"
const DESCONTO_CUPOM = 0.10
const FRETE_GRATIS_A_PARTIR = 299
const VALOR_FRETE = 29.90

const estadoCarrinho = {
    cupom: "",
    desconto: 0
}

function calcularResumo() {
    const itens = getCarrinho()
    const subtotal = totalCarrinho(itens)
    const desconto = subtotal * estadoCarrinho.desconto
    const frete = itens.length === 0 || subtotal >= FRETE_GRATIS_A_PARTIR ? 0 : VALOR_FRETE
    const total = Math.max(0, subtotal - desconto + frete)

    return { itens, subtotal, desconto, frete, total }
}

function atualizarSubtitulo(itens) {
    const subtitulo = document.getElementById("carrinho-subtitulo")
    if (!subtitulo) return

    const quantidade = itens.reduce((soma, item) => soma + Number(item.qtd || 1), 0)
    subtitulo.textContent = quantidade === 0
        ? "Seu carrinho está vazio."
        : quantidade + (quantidade === 1 ? " item" : " itens") + " no carrinho."
}

function renderizarVazio() {
    const container = document.getElementById("carrinho-conteudo")
    container.innerHTML = `
        <div class="empty-state mt-4">
            <i class="bi bi-bag"></i>
            <h3>Seu carrinho está vazio</h3>
            <p>Que tal explorar nossos produtos e montar o setup dos seus sonhos?</p>
            <div class="d-flex gap-2 justify-content-center flex-wrap">
                <a href="produtos.html" class="btn-nextech"><i class="bi bi-grid"></i> Ver produtos</a>
                <a href="monte-seu-pc.html" class="btn-outline-nextech"><i class="bi bi-tools"></i> Monte seu PC</a>
            </div>
        </div>`
    atualizarSubtitulo([])
}

function criarLinhaItem(item) {
    const linha = document.createElement("div")
    linha.className = "carrinho-item"

    const link = document.createElement("a")
    link.href = "produto.html?id=" + item.id
    const imagem = document.createElement("img")
    configurarImagem(imagem, item)
    link.append(imagem)

    const info = document.createElement("div")
    const titulo = document.createElement("h3")
    const linkTitulo = document.createElement("a")
    linkTitulo.href = "produto.html?id=" + item.id
    linkTitulo.textContent = item.nome
    linkTitulo.style.color = "inherit"
    titulo.append(linkTitulo)

    const meta = document.createElement("div")
    meta.className = "item-meta"
    meta.textContent = (item.marca || "NexTech") + " • " + (item.categoria || "Produto")

    const preco = document.createElement("div")
    preco.className = "item-preco"
    preco.textContent = formatarPreco(Number(item.preco) * Number(item.qtd || 1))

    const unitario = document.createElement("div")
    unitario.className = "item-meta"
    unitario.textContent = Number(item.qtd || 1) + " × " + formatarPreco(item.preco)

    info.append(titulo, meta, preco, unitario)

    const acoes = document.createElement("div")
    acoes.className = "item-acoes"

    const controle = document.createElement("div")
    controle.className = "qtd-control"

    const menos = document.createElement("button")
    menos.type = "button"
    menos.textContent = "−"
    menos.setAttribute("aria-label", "Diminuir quantidade de " + item.nome)
    menos.addEventListener("click", () => {
        alterarQuantidadeCarrinho(item.id, -1)
        renderizarCarrinho()
    })

    const campo = document.createElement("input")
    campo.type = "text"
    campo.inputMode = "numeric"
    campo.value = String(item.qtd || 1)
    campo.setAttribute("aria-label", "Quantidade de " + item.nome)
    campo.addEventListener("change", () => {
        const limite = Number(item.estoque || 999)
        const valor = Math.max(1, Math.min(Number.parseInt(campo.value, 10) || 1, limite))
        const carrinho = getCarrinho()
        const alvo = carrinho.find(produto => Number(produto.id) === Number(item.id))
        if (alvo) {
            alvo.qtd = valor
            salvarCarrinho(carrinho)
        }
        renderizarCarrinho()
    })

    const mais = document.createElement("button")
    mais.type = "button"
    mais.textContent = "+"
    mais.setAttribute("aria-label", "Aumentar quantidade de " + item.nome)
    mais.addEventListener("click", () => {
        alterarQuantidadeCarrinho(item.id, 1)
        renderizarCarrinho()
    })

    controle.append(menos, campo, mais)

    const remover = document.createElement("button")
    remover.type = "button"
    remover.className = "btn-remover"
    remover.innerHTML = '<i class="bi bi-trash3"></i> Remover'
    remover.addEventListener("click", () => {
        removerDoCarrinho(item.id)
        mostrarToast("Item removido do carrinho.", "warning")
        renderizarCarrinho()
    })

    acoes.append(controle, remover)
    linha.append(link, info, acoes)
    return linha
}

function renderizarResumo(resumo) {
    const painel = document.createElement("aside")
    painel.className = "resumo-carrinho"

    painel.innerHTML = `
        <h2>Resumo do pedido</h2>
        <div class="cupom">
            <input type="text" id="cupom-input" placeholder="Cupom de desconto" aria-label="Cupom de desconto">
            <button type="button" id="btn-cupom">Aplicar</button>
        </div>
        <div id="cupom-status" class="mb-2" style="font-size:11px"></div>
        <div class="resumo-linha"><span>Subtotal</span><span id="resumo-subtotal"></span></div>
        <div class="resumo-linha" id="linha-desconto" style="display:none">
            <span>Desconto</span><span class="texto-verde" id="resumo-desconto"></span>
        </div>
        <div class="resumo-linha">
            <span>Frete</span><span id="resumo-frete"></span>
        </div>
        <div class="resumo-totais">
            <div class="resumo-linha total"><span>Total</span><strong id="resumo-total"></strong></div>
            <div class="resumo-linha" style="font-size:11px;margin-top:2px">
                <span>ou <span id="resumo-parcelas"></span> sem juros</span>
            </div>
        </div>
        <button type="button" class="btn-nextech" id="btn-finalizar">
            <i class="bi bi-lock"></i> Finalizar compra
        </button>
        <a href="produtos.html" class="btn-outline-nextech">
            <i class="bi bi-arrow-left"></i> Continuar comprando
        </a>
        <div class="selo-seguro"><i class="bi bi-shield-check"></i> Ambiente 100% seguro</div>`

    const descontoLinha = painel.querySelector("#linha-desconto")
    const descontoValor = painel.querySelector("#resumo-desconto")
    const campoCupom = painel.querySelector("#cupom-input")
    const statusCupom = painel.querySelector("#cupom-status")

    painel.querySelector("#resumo-subtotal").textContent = formatarPreco(resumo.subtotal)
    painel.querySelector("#resumo-frete").textContent = resumo.frete === 0 ? "Grátis" : formatarPreco(resumo.frete)
    painel.querySelector("#resumo-total").textContent = formatarPreco(resumo.total)

    const parcelas = opcoesParcelamento(resumo.total)
    painel.querySelector("#resumo-parcelas").textContent =
        parcelas.vezes + "x de " + formatarPreco(parcelas.valor)

    if (resumo.desconto > 0) {
        descontoLinha.style.display = "flex"
        descontoValor.textContent = "− " + formatarPreco(resumo.desconto)
        campoCupom.value = estadoCarrinho.cupom
        statusCupom.innerHTML = '<span class="texto-verde"><i class="bi bi-check-circle-fill"></i> Cupom aplicado</span>'
    }

    painel.querySelector("#btn-cupom").addEventListener("click", () => {
        const codigo = campoCupom.value.trim().toUpperCase()

        if (!codigo) {
            estadoCarrinho.cupom = ""
            estadoCarrinho.desconto = 0
            renderizarCarrinho()
            return
        }

        if (codigo === CUPOM_VALIDO) {
            estadoCarrinho.cupom = codigo
            estadoCarrinho.desconto = DESCONTO_CUPOM
            mostrarToast("Cupom aplicado: 10% de desconto!", "success")
        } else {
            estadoCarrinho.cupom = ""
            estadoCarrinho.desconto = 0
            mostrarToast("Cupom inválido.", "danger")
        }
        renderizarCarrinho()
    })

    campoCupom.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault()
            painel.querySelector("#btn-cupom").click()
        }
    })

    painel.querySelector("#btn-finalizar").addEventListener("click", finalizarCompra)
    return painel
}

function renderizarCarrinho() {
    const resumo = calcularResumo()
    atualizarSubtitulo(resumo.itens)

    const container = document.getElementById("carrinho-conteudo")

    if (resumo.itens.length === 0) {
        renderizarVazio()
        return
    }

    container.innerHTML = `
        <div class="carrinho-grid">
            <div class="carrinho-lista" id="carrinho-lista"></div>
            <div id="carrinho-resumo"></div>
        </div>`

    const lista = document.getElementById("carrinho-lista")
    resumo.itens.forEach(item => lista.append(criarLinhaItem(item)))
    document.getElementById("carrinho-resumo").append(renderizarResumo(resumo))
}

/* --------------------------- Finalização --------------------------- */

function montarHtmlItens(itens) {
    return itens.map(item =>
        '<div class="resumo-item"><span>' + item.qtd + '× ' + escapeHtml(item.nome) + '</span><span>' +
        formatarPreco(Number(item.preco) * Number(item.qtd)) + '</span></div>'
    ).join("")
}

function montarHtmlTotais(resumo) {
    return `
        <div class="resumo-linha"><span>Subtotal</span><span>${formatarPreco(resumo.subtotal)}</span></div>
        ${resumo.desconto > 0
            ? '<div class="resumo-linha"><span>Desconto</span><span class="texto-verde">− ' + formatarPreco(resumo.desconto) + '</span></div>'
            : ""}
        <div class="resumo-linha"><span>Frete</span><span>${resumo.frete === 0 ? "Grátis" : formatarPreco(resumo.frete)}</span></div>
        <div class="resumo-linha total"><span>Total</span><strong>${formatarPreco(resumo.total)}</strong></div>`
}

function abrirModal(id) {
    const elemento = document.getElementById(id)
    if (window.bootstrap && bootstrap.Modal) {
        bootstrap.Modal.getOrCreateInstance(elemento).show()
        return
    }
    elemento.classList.add("show")
    elemento.style.display = "block"
}

function finalizarCompra() {
    const resumo = calcularResumo()

    if (resumo.itens.length === 0) {
        mostrarToast("Seu carrinho está vazio.", "warning")
        return
    }

    if (!estaLogado()) {
        const botao = document.getElementById("modal-btn-login")
        botao.href = loginUrl("carrinho.html")
        abrirModal("modal-login")
        return
    }

    document.getElementById("pedido-itens").innerHTML = montarHtmlItens(resumo.itens)
    document.getElementById("pedido-totais").innerHTML = montarHtmlTotais(resumo)
    abrirModal("modal-pedido")
}

function salvarPedido(resumo) {
    let pedidos = []
    try {
        pedidos = JSON.parse(localStorage.getItem(CHAVE_PEDIDOS) || "[]")
        if (!Array.isArray(pedidos)) pedidos = []
    } catch {
        pedidos = []
    }

    const pedido = {
        codigo: "NX" + Date.now().toString().slice(-8),
        data: new Date().toISOString(),
        cliente: getNomeCliente() || "Cliente",
        itens: resumo.itens.map(item => ({
            id: item.id,
            nome: item.nome,
            qtd: Number(item.qtd),
            preco: Number(item.preco)
        })),
        total: resumo.total
    }

    pedidos.unshift(pedido)
    localStorage.setItem(CHAVE_PEDIDOS, JSON.stringify(pedidos.slice(0, 20)))
    return pedido
}

function renderizarSucesso(pedido) {
    const container = document.getElementById("carrinho-conteudo")
    container.innerHTML = `
        <div class="empty-state mt-4">
            <i class="bi bi-check-circle-fill" style="color:var(--verde)"></i>
            <h3>Pedido confirmado!</h3>
            <p>Obrigado pela compra, <strong>${escapeHtml(pedido.cliente)}</strong>. Seu pedido
               <strong>${escapeHtml(pedido.codigo)}</strong> foi registrado.</p>
            <p class="mb-4" style="font-size:13px">Total: <strong>${formatarPreco(pedido.total)}</strong></p>
            <div class="d-flex gap-2 justify-content-center flex-wrap">
                <a href="produtos.html" class="btn-nextech"><i class="bi bi-grid"></i> Continuar comprando</a>
                <a href="perfil.html" class="btn-outline-nextech"><i class="bi bi-person"></i> Ver meus pedidos</a>
            </div>
        </div>`
    atualizarSubtitulo([])
    atualizarBadgeCarrinho()
}

function configurarConfirmacao() {
    document.getElementById("btn-confirmar-pedido").addEventListener("click", () => {
        const resumo = calcularResumo()
        if (!resumo.itens.length) {
            mostrarToast("Seu carrinho está vazio.", "warning")
            return
        }

        const pedido = salvarPedido(resumo)
        limparCarrinho()
        estadoCarrinho.cupom = ""
        estadoCarrinho.desconto = 0

        const modal = document.getElementById("modal-pedido")
        if (window.bootstrap && bootstrap.Modal) {
            bootstrap.Modal.getOrCreateInstance(modal).hide()
        }

        renderizarSucesso(pedido)
        mostrarToast("Pedido " + pedido.codigo + " confirmado!", "success")
    })
}

configurarConfirmacao()
renderizarCarrinho()
