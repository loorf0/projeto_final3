// Página de detalhe do produto: dados da API, quantidade, carrinho e relacionados.

const estadoDetalhe = {
    produto: null,
    quantidade: 1
}

function obterIdProduto() {
    const id = Number(queryParams().get("id"))
    return Number.isInteger(id) && id > 0 ? id : null
}

function montarBeneficios() {
    return `
        <div><i class="bi bi-truck"></i><div><strong>Frete grátis</strong>Em compras acima de R$ 299</div></div>
        <div><i class="bi bi-shield-check"></i><div><strong>Garantia 12 meses</strong>Produto original e nota fiscal</div></div>
        <div><i class="bi bi-credit-card"></i><div><strong>Até 12x sem juros</strong>No cartão de crédito</div></div>
        <div><i class="bi bi-headset"></i><div><strong>Suporte NexTech</strong>Atendimento especializado</div></div>`
}

function renderizarDetalhe(produto) {
    estadoDetalhe.produto = produto
    estadoDetalhe.quantidade = 1

    const container = document.getElementById("detalhe-conteudo")
    const desconto = calcularDesconto(produto.preco, produto.preco_antigo)
    const parcelas = opcoesParcelamento(produto.preco)
    const estoque = Number(produto.estoque || 0)
    const categoriaUrl = "produtos.html?categoria=" + encodeURIComponent(produto.categoria)

    document.title = produto.nome + " | NexTech Informática"
    document.getElementById("breadcrumb-produto").textContent = produto.nome

    const temAntigo = produto.preco_antigo && Number(produto.preco_antigo) > Number(produto.preco)

    container.innerHTML = `
        <div class="detalhe-grid">
            <div>
                <div class="detalhe-media">
                    ${desconto > 0 ? '<span class="selo">-' + desconto + '% OFF</span>' : ""}
                    <img id="detalhe-imagem" alt="">
                </div>
                <div class="detalhe-beneficios mt-3">
                    ${montarBeneficios()}
                </div>
            </div>

            <div class="detalhe-info">
                <div class="detalhe-meta">
                    <a class="detalhe-categoria" id="detalhe-categoria" href="${categoriaUrl}"></a>
                    <span class="detalhe-codigo" id="detalhe-codigo"></span>
                </div>
                <h1 id="detalhe-nome"></h1>
                <div id="detalhe-estrelas" class="mb-3"></div>
                <p class="detalhe-descricao" id="detalhe-descricao"></p>

                <div class="detalhe-preco-box">
                    ${temAntigo ? '<div class="price-old" id="detalhe-preco-antigo"></div>' : ""}
                    <div class="price-current" id="detalhe-preco"></div>
                    <div class="pix" id="detalhe-pix"></div>
                    <div class="parcelas" id="detalhe-parcelas"></div>
                </div>

                <div class="product-stock mb-1" id="detalhe-estoque"></div>

                <div class="compra-linha">
                    <div class="qtd-control" aria-label="Quantidade">
                        <button type="button" id="btn-menos" aria-label="Diminuir quantidade">−</button>
                        <input type="text" id="qtd-produto" value="1" inputmode="numeric" aria-label="Quantidade">
                        <button type="button" id="btn-mais" aria-label="Aumentar quantidade">+</button>
                    </div>
                    <button type="button" class="btn-nextech" id="btn-adicionar">
                        <i class="bi bi-bag-plus"></i> Adicionar ao carrinho
                    </button>
                    <button type="button" class="btn-outline-nextech" id="btn-comprar">
                        <i class="bi bi-lightning-charge"></i> Comprar
                    </button>
                </div>

                <div class="d-flex align-items-center gap-3 flex-wrap">
                    <button type="button" class="btn-remover" id="btn-favoritar">
                        <i class="bi bi-heart"></i> Adicionar aos favoritos
                    </button>
                    <span class="texto-muted" style="font-size:11.5px">
                        <i class="bi bi-box-seam"></i> Vendido e entregue por NexTech Informática
                    </span>
                </div>

                <div class="especificacoes">
                    <h2>Especificações</h2>
                    <table>
                        <tbody id="tabela-especificacoes"></tbody>
                    </table>
                </div>
            </div>
        </div>`

    const imagem = document.getElementById("detalhe-imagem")
    configurarImagem(imagem, produto)

    document.getElementById("detalhe-categoria").textContent = produto.categoria
    document.getElementById("detalhe-codigo").textContent = "Código #" + String(produto.id).padStart(4, "0")
    document.getElementById("detalhe-nome").textContent = produto.nome
    document.getElementById("detalhe-descricao").textContent = produto.descricao
    document.getElementById("detalhe-estrelas").append(criarEstrelas(produto.avaliacao, produto.avaliacoes))
    document.getElementById("detalhe-preco").textContent = formatarPreco(produto.preco)

    if (temAntigo) {
        document.getElementById("detalhe-preco-antigo").textContent = "De " + formatarPreco(produto.preco_antigo)
    }

    document.getElementById("detalhe-pix").textContent =
        formatarPreco(Number(produto.preco) * 0.95) + " no PIX (5% de desconto)"
    document.getElementById("detalhe-parcelas").innerHTML =
        "ou <strong>" + parcelas.vezes + "x de " + formatarPreco(parcelas.valor) + "</strong> sem juros"

    const estoqueEl = document.getElementById("detalhe-estoque")
    if (estoque > 0) {
        estoqueEl.classList.toggle("baixo", estoque <= 5)
        estoqueEl.innerHTML = estoque > 5
            ? '<i class="bi bi-check-circle-fill"></i> Em estoque — pronto para envio'
            : '<i class="bi bi-exclamation-circle-fill"></i> Apenas ' + estoque + ' unidades em estoque'
    } else {
        estoqueEl.classList.add("baixo")
        estoqueEl.innerHTML = '<i class="bi bi-x-circle-fill"></i> Produto esgotado'
    }

    const tabela = document.getElementById("tabela-especificacoes")
    const linhas = [
        ["Marca", produto.marca || "NexTech"],
        ["Categoria", produto.categoria],
        ["Código", "#" + String(produto.id).padStart(4, "0")],
        ["Disponibilidade", estoque > 0 ? estoque + " unidades" : "Esgotado"],
        ["Avaliação", Number(produto.avaliacao).toFixed(1) + " de 5 (" + formatarNumero(produto.avaliacoes) + " avaliações)"],
        ["Garantia", "12 meses"]
    ]

    linhas.forEach(([rotulo, valor]) => {
        const tr = document.createElement("tr")
        const tdRotulo = document.createElement("td")
        tdRotulo.textContent = rotulo
        const tdValor = document.createElement("td")
        tdValor.textContent = valor
        tr.append(tdRotulo, tdValor)
        tabela.append(tr)
    })

    configurarCompra(produto, estoque)
    configurarFavorito(produto)
    carregarRelacionados(produto)
}

function lerQuantidade() {
    const limite = Number(estadoDetalhe.produto.estoque || 999)
    const valor = Math.max(1, Math.min(Number.parseInt(document.getElementById("qtd-produto").value, 10) || 1, limite))
    estadoDetalhe.quantidade = valor
    document.getElementById("qtd-produto").value = valor
    return valor
}

function configurarCompra(produto, estoque) {
    const campo = document.getElementById("qtd-produto")
    const menos = document.getElementById("btn-menos")
    const mais = document.getElementById("btn-mais")

    if (estoque <= 0) {
        document.getElementById("btn-adicionar").disabled = true
        document.getElementById("btn-comprar").disabled = true
        return
    }

    menos.addEventListener("click", () => {
        campo.value = Math.max(1, lerQuantidade() - 1)
        lerQuantidade()
    })

    mais.addEventListener("click", () => {
        campo.value = lerQuantidade() + 1
        lerQuantidade()
    })

    campo.addEventListener("change", lerQuantidade)

    document.getElementById("btn-adicionar").addEventListener("click", () => {
        adicionarAoCarrinho(produto, lerQuantidade())
        mostrarToast("Produto adicionado ao carrinho!", "success")
    })

    document.getElementById("btn-comprar").addEventListener("click", () => {
        adicionarAoCarrinho(produto, lerQuantidade())
        location.href = "carrinho.html"
    })
}

function configurarFavorito(produto) {
    const botao = document.getElementById("btn-favoritar")
    const atualizar = () => {
        const ativo = getFavoritos().includes(Number(produto.id))
        botao.innerHTML = ativo
            ? '<i class="bi bi-heart-fill"></i> Remover dos favoritos'
            : '<i class="bi bi-heart"></i> Adicionar aos favoritos'
        botao.style.color = ativo ? "var(--vermelho)" : ""
    }

    atualizar()
    botao.addEventListener("click", () => {
        const marcado = toggleFavorito(produto.id)
        atualizar()
        mostrarToast(marcado ? "Produto adicionado aos favoritos." : "Produto removido dos favoritos.", "success")
    })
}

async function carregarRelacionados(produto) {
    const secao = document.getElementById("secao-relacionados")
    const grid = document.getElementById("relacionados-grid")
    const link = document.getElementById("link-relacionados")

    link.href = "produtos.html?categoria=" + encodeURIComponent(produto.categoria)

    try {
        const dados = await apiGet(
            "/produtos?categoria=" + encodeURIComponent(produto.categoria) + "&por_pagina=4"
        )
        const relacionados = dados.produtos
            .filter(item => Number(item.id) !== Number(produto.id))
            .slice(0, 4)

        if (!relacionados.length) return

        grid.replaceChildren()
        relacionados.forEach(item => grid.append(criarCardProduto(item)))
        secao.style.display = "block"
    } catch {
        secao.style.display = "none"
    }
}

function renderizarErro(mensagem, titulo) {
    const container = document.getElementById("detalhe-conteudo")
    container.innerHTML = `
        <div class="empty-state">
            <i class="bi bi-box-seam"></i>
            <h3>${escapeHtml(titulo)}</h3>
            <p>${escapeHtml(mensagem)}</p>
            <a href="produtos.html" class="btn-nextech"><i class="bi bi-arrow-left"></i> Voltar ao catálogo</a>
        </div>`
}

async function iniciarDetalhe() {
    const id = obterIdProduto()

    if (!id) {
        renderizarErro("O link acessado não informa um produto válido.", "Produto não encontrado")
        return
    }

    try {
        const produto = await apiGet("/produtos/" + id)
        renderizarDetalhe(produto)
    } catch (error) {
        const naoEncontrado = error.status === 404
        renderizarErro(
            naoEncontrado
                ? "O produto que você procura não existe ou foi removido do catálogo."
                : "Não foi possível carregar o produto: " + error.message,
            naoEncontrado ? "Produto não encontrado" : "Erro ao carregar"
        )
    }
}

iniciarDetalhe()
