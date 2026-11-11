// Perfil: consome GET /cliente/perfil com o JWT e lista os pedidos locais.

const CHAVE_PEDIDOS_PERFIL = "nextech_pedidos"

function lerPedidos() {
    try {
        const pedidos = JSON.parse(localStorage.getItem(CHAVE_PEDIDOS_PERFIL) || "[]")
        return Array.isArray(pedidos) ? pedidos : []
    } catch {
        return []
    }
}

function formatarData(iso) {
    const data = new Date(iso)
    if (Number.isNaN(data.getTime())) return "—"
    return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    })
}

function iniciais(nome) {
    const partes = String(nome || "Cliente").trim().split(/\s+/)
    const primeira = partes[0] ? partes[0].charAt(0) : "N"
    const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : ""
    return (primeira + ultima).toUpperCase()
}

function criarDado(rotulo, valor) {
    const bloco = document.createElement("div")
    bloco.className = "dado"
    const span = document.createElement("span")
    span.textContent = rotulo
    const strong = document.createElement("strong")
    strong.textContent = valor || "—"
    bloco.append(span, strong)
    return bloco
}

function renderizarPedidos(container) {
    const pedidos = lerPedidos()
    const bloco = document.createElement("div")
    bloco.className = "perfil-pedidos"

    const titulo = document.createElement("h2")
    titulo.textContent = "Meus pedidos"
    bloco.append(titulo)

    if (!pedidos.length) {
        const vazio = document.createElement("div")
        vazio.className = "pedido-vazio"
        vazio.innerHTML = `
            <i class="bi bi-receipt"></i>
            Você ainda não fez nenhum pedido.<br>
            <a href="produtos.html" class="fw-800">Explorar produtos</a>`
        bloco.append(vazio)
        container.append(bloco)
        return
    }

    pedidos.forEach(pedido => {
        const cartao = document.createElement("div")
        cartao.style.cssText = "border:1px solid var(--linha);border-radius:14px;padding:14px;margin-bottom:10px"

        const topo = document.createElement("div")
        topo.className = "d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2"

        const codigo = document.createElement("strong")
        codigo.style.fontSize = "13px"
        codigo.textContent = "Pedido " + pedido.codigo

        const total = document.createElement("strong")
        total.style.cssText = "color:var(--azul-700);font-size:14px"
        total.textContent = formatarPreco(pedido.total)

        topo.append(codigo, total)

        const data = document.createElement("div")
        data.className = "texto-muted"
        data.style.fontSize = "11px"
        data.textContent = formatarData(pedido.data)

        const itens = document.createElement("div")
        itens.className = "mt-2"
        itens.style.fontSize = "11.5px"
        itens.style.color = "var(--texto-soft)"
        itens.textContent = (pedido.itens || [])
            .map(item => item.qtd + "× " + item.nome)
            .join(" • ")

        cartao.append(topo, data, itens)
        bloco.append(cartao)
    })

    container.append(bloco)
}

function renderizarPerfil(cliente) {
    const container = document.getElementById("perfil-conteudo")
    const primeiroNome = String(cliente.nome || "Cliente").split(" ")[0]

    container.innerHTML = `
        <div class="perfil-grid">
            <aside class="perfil-sidebar">
                <div class="perfil-avatar" id="perfil-avatar"></div>
                <h2 id="perfil-nome"></h2>
                <p id="perfil-email"></p>
                <div class="perfil-menu">
                    <button type="button" class="ativo"><i class="bi bi-person"></i> Meus dados</button>
                    <a href="carrinho.html"><i class="bi bi-bag"></i> Meu carrinho</a>
                    <a href="produtos.html"><i class="bi bi-grid"></i> Catálogo</a>
                    <button type="button" class="text-danger" id="btn-sair-perfil">
                        <i class="bi bi-box-arrow-right"></i> Sair da conta
                    </button>
                </div>
            </aside>

            <section class="perfil-conteudo">
                <h1>Olá, <span id="perfil-primeiro-nome"></span>!</h1>
                <p>Estes são os dados da sua conta NexTech.</p>
                <div class="dados-grid" id="dados-cliente"></div>
                <div id="pedidos-container"></div>
            </section>
        </div>`

    document.getElementById("perfil-avatar").textContent = iniciais(cliente.nome)
    document.getElementById("perfil-nome").textContent = cliente.nome
    document.getElementById("perfil-email").textContent = cliente.email
    document.getElementById("perfil-primeiro-nome").textContent = primeiroNome

    const dados = document.getElementById("dados-cliente")
    dados.append(
        criarDado("Nome completo", cliente.nome),
        criarDado("Email", cliente.email),
        criarDado("CPF", cliente.cpf),
        criarDado("Celular", cliente.celular)
    )

    renderizarPedidos(document.getElementById("pedidos-container"))

    document.getElementById("btn-sair-perfil").addEventListener("click", sairDaConta)
}

function renderizarErro(titulo, mensagem) {
    const container = document.getElementById("perfil-conteudo")
    container.innerHTML = `
        <div class="empty-state mt-4">
            <i class="bi bi-person-lock"></i>
            <h3>${escapeHtml(titulo)}</h3>
            <p>${escapeHtml(mensagem)}</p>
            <a href="login.html?redirect=perfil.html" class="btn-nextech">
                <i class="bi bi-box-arrow-in-right"></i> Entrar na minha conta
            </a>
        </div>`
}

async function carregarPerfil() {
    if (!estaLogado()) {
        renderizarErro("Você não está logado", "Entre com sua conta para ver seus dados e pedidos.")
        return
    }

    try {
        const cliente = await apiGetAuth("/cliente/perfil")
        renderizarPerfil(cliente)
    } catch (error) {
        if (error.status === 401 || error.status === 403) {
            limparSessao()
            renderizarErro("Sua sessão expirou", "Por segurança, entre novamente para continuar.")
            return
        }

        renderizarErro("Não foi possível carregar o perfil", error.message)
        mostrarToast("Erro ao carregar o perfil: " + error.message, "danger")
    }
}

carregarPerfil()
