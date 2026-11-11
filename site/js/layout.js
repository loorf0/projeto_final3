// Cabeçalho, rodapé e estado de autenticação compartilhados por todas as páginas.

function renderLayout() {
    const header = document.getElementById("site-header")
    const footer = document.getElementById("site-footer")

    if (header) {
        header.innerHTML = `
            <div class="topbar">
                <div class="container-nextech">
                    <div class="topbar-links">
                        <span><i class="bi bi-truck"></i> Frete grátis acima de R$ 299</span>
                        <span><i class="bi bi-shield-check"></i> Garantia de 12 meses</span>
                    </div>
                    <div class="topbar-links">
                        <a href="produtos.html?categoria=Servi%C3%A7os"><i class="bi bi-tools"></i> Serviços</a>
                        <a href="monte-seu-pc.html"><i class="bi bi-pc-display"></i> Monte seu PC</a>
                        <span><i class="bi bi-telephone"></i> (42) 99999-0000</span>
                    </div>
                </div>
            </div>
            <div class="site-header">
                <div class="container-nextech header-main">
                    <a class="brand" href="index.html" aria-label="NexTech Informática - início">
                        <img src="assets/img/logo.svg" alt="NexTech Informática">
                    </a>
                    <form class="search-form" action="produtos.html" method="get" role="search">
                        <i class="bi bi-search search-icon"></i>
                        <input type="search" name="nome" placeholder="Busque por processador, celular, PC gamer..." aria-label="Buscar produtos">
                        <button type="submit" aria-label="Buscar"><i class="bi bi-arrow-right"></i></button>
                    </form>
                    <div class="header-actions">
                        <a class="header-link oculto-mobile" href="monte-seu-pc.html">
                            <i class="bi bi-pc-display"></i><span>Monte seu PC</span>
                        </a>
                        <div id="area-conta"></div>
                        <a class="header-link cart-link" href="carrinho.html" aria-label="Carrinho">
                            <i class="bi bi-bag"></i><span>Carrinho</span>
                            <span class="cart-count" data-cart-count style="display:none">0</span>
                        </a>
                    </div>
                </div>
                <nav class="nav-categorias" aria-label="Categorias">
                    <div class="container-nextech">
                        <a href="index.html" data-nav="home"><i class="bi bi-house-door"></i> Início</a>
                        <a href="produtos.html" data-nav="produtos"><i class="bi bi-grid"></i> Todos os produtos</a>
                        <a href="produtos.html?categoria=Processadores">Processadores</a>
                        <a href="produtos.html?categoria=Placas%20de%20V%C3%ADdeo">Placas de vídeo</a>
                        <a href="produtos.html?categoria=Smartphones">Celulares</a>
                        <a href="produtos.html?categoria=PCs%20Prontos">PCs prontos</a>
                        <a href="produtos.html?categoria=Perif%C3%A9ricos">Periféricos</a>
                        <a href="produtos.html?categoria=Servi%C3%A7os">Serviços</a>
                        <a href="monte-seu-pc.html"><i class="bi bi-tools"></i> Monte seu PC</a>
                    </div>
                </nav>
            </div>`
    }

    if (footer) {
        footer.innerHTML = `
            <footer class="site-footer">
                <div class="container-nextech">
                    <div class="footer-main">
                        <div class="footer-brand">
                            <img src="assets/img/logo.svg" alt="NexTech Informática">
                            <p>Tecnologia para trabalhar, estudar, criar e jogar. Montamos seu PC, instalamos o sistema e cuidamos de cada detalhe.</p>
                            <div class="footer-social">
                                <a href="#" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
                                <a href="#" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
                                <a href="#" aria-label="YouTube"><i class="bi bi-youtube"></i></a>
                                <a href="#" aria-label="WhatsApp"><i class="bi bi-whatsapp"></i></a>
                            </div>
                        </div>
                        <div class="footer-col">
                            <h3>Institucional</h3>
                            <a href="index.html">Quem somos</a>
                            <a href="produtos.html">Nossos produtos</a>
                            <a href="monte-seu-pc.html">Monte seu PC</a>
                            <a href="produtos.html?categoria=Servi%C3%A7os">Serviços</a>
                        </div>
                        <div class="footer-col">
                            <h3>Ajuda</h3>
                            <a href="carrinho.html">Meu carrinho</a>
                            <a href="perfil.html">Minha conta</a>
                            <a href="login.html">Entrar</a>
                            <a href="cadastro.html">Criar conta</a>
                        </div>
                        <div class="footer-col">
                            <h3>Atendimento</h3>
                            <p><i class="bi bi-telephone"></i> (42) 99999-0000</p>
                            <p><i class="bi bi-envelope"></i> contato@nextech.com.br</p>
                            <p><i class="bi bi-clock"></i> Seg. a sex., 8h às 18h</p>
                            <p><i class="bi bi-geo-alt"></i> Ponta Grossa - PR</p>
                            <div class="footer-pagamentos">
                                <span>PIX</span><span>VISA</span><span>MASTER</span><span>BOLETO</span>
                            </div>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <span>© ${new Date().getFullYear()} <strong>NexTech Informática</strong> — Todos os direitos reservados.</span>
                        <span>Projeto acadêmico de Desenvolvimento de Sistemas • API Node.js + MySQL</span>
                    </div>
                </div>
            </footer>`
    }

    atualizarNavbar()
    atualizarBadgeCarrinho()
    marcarNavAtiva()
}

function atualizarNavbar() {
    const area = document.getElementById("area-conta")
    if (!area) return

    if (estaLogado()) {
        const nome = getNomeCliente() || "Cliente"
        const primeiro = nome.trim().split(/\s+/)[0]
        const inicial = primeiro.charAt(0).toUpperCase()
        const primeiroSeguro = escapeHtml(primeiro)
        const inicialSegura = escapeHtml(inicial)

        area.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-outline-nextech dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <span class="perfil-avatar" style="width:24px;height:24px;font-size:11px;margin:0;box-shadow:none">${inicialSegura}</span>
                    <span class="d-none d-md-inline">Olá, ${primeiroSeguro}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow border-0" style="border-radius:14px;padding:8px">
                    <li><a class="dropdown-item" href="perfil.html"><i class="bi bi-person me-2"></i>Meu perfil</a></li>
                    <li><a class="dropdown-item" href="carrinho.html"><i class="bi bi-bag me-2"></i>Meu carrinho</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><button class="dropdown-item text-danger" type="button" id="btn-sair"><i class="bi bi-box-arrow-right me-2"></i>Sair</button></li>
                </ul>
            </div>`

        const sair = document.getElementById("btn-sair")
        if (sair) sair.addEventListener("click", sairDaConta)
    } else {
        area.innerHTML = `
            <a href="login.html" class="btn btn-outline-nextech">Entrar</a>
            <a href="cadastro.html" class="btn btn-nextech d-none d-lg-inline-flex">Criar conta</a>`
    }
}

function sairDaConta() {
    limparSessao()
    mostrarToast("Você saiu da sua conta.", "success")
    setTimeout(() => {
        location.href = "index.html"
    }, 450)
}

function marcarNavAtiva() {
    const pagina = document.body.dataset.page
    if (!pagina) return
    document.querySelectorAll("[data-nav]").forEach(link => {
        link.classList.toggle("ativo", link.dataset.nav === pagina)
    })
}

// Garante o container de toasts em todas as páginas.
document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("toast-container")) {
        const container = document.createElement("div")
        container.id = "toast-container"
        container.className = "toast-container position-fixed top-0 end-0 p-3"
        container.style.zIndex = "1090"
        document.body.append(container)
    }
})

renderLayout()
