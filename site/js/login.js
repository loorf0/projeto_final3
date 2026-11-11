// Login: autentica na API, grava nome_cliente e token no localStorage.

function destinoSeguro(valor) {
    if (!valor) return "index.html"
    // Aceita somente caminhos relativos do próprio site (evita redirecionamento externo).
    if (/^([a-z]+:)?\/\//i.test(valor) || valor.startsWith("\\") || valor.startsWith("javascript:")) {
        return "index.html"
    }
    return valor
}

function mostrarErro(mensagem) {
    const caixa = document.getElementById("auth-erro")
    caixa.textContent = mensagem
    caixa.classList.toggle("visivel", Boolean(mensagem))
}

function configurarSenha() {
    const campo = document.getElementById("senha")
    const botao = document.getElementById("btn-ver-senha")

    botao.addEventListener("click", () => {
        const visivel = campo.type === "text"
        campo.type = visivel ? "password" : "text"
        botao.innerHTML = visivel ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>'
        botao.setAttribute("aria-label", visivel ? "Mostrar senha" : "Ocultar senha")
    })
}

function configurarDemo() {
    document.getElementById("btn-demo").addEventListener("click", () => {
        document.getElementById("email").value = "demo@nextech.com"
        document.getElementById("senha").value = "demo1234"
        document.getElementById("email").focus()
    })
}

function configurarFormulario() {
    const form = document.getElementById("form-login")
    const botao = document.getElementById("btn-entrar")

    form.addEventListener("submit", async event => {
        event.preventDefault()
        mostrarErro("")

        const email = document.getElementById("email").value.trim().toLowerCase()
        const senha = document.getElementById("senha").value

        if (!email || !senha) {
            mostrarErro("Informe email e senha para continuar.")
            return
        }

        botao.disabled = true
        botao.innerHTML = '<span class="spinner-nextech"></span> Entrando...'

        try {
            const dados = await apiPost("/login", { email, senha })
            salvarSessao(dados.nome, dados.token)

            const destino = destinoSeguro(queryParams().get("redirect"))
            mostrarToast("Bem-vindo, " + dados.nome.split(" ")[0] + "!", "success")

            setTimeout(() => {
                location.href = destino
            }, 500)
        } catch (error) {
            const mensagem = error.status === 401
                ? "Email ou senha inválidos. Confira os dados e tente novamente."
                : error.status === 400
                    ? "Informe um email válido e a senha."
                    : "Não foi possível entrar: " + error.message

            mostrarErro(mensagem)
            mostrarToast(mensagem, "danger")
            document.getElementById("senha").select()
        } finally {
            botao.disabled = false
            botao.innerHTML = '<i class="bi bi-box-arrow-in-right"></i> Entrar'
        }
    })
}

function iniciarLogin() {
    configurarSenha()
    configurarDemo()
    configurarFormulario()

    const params = queryParams()
    const emailParam = params.get("email")
    if (emailParam) {
        document.getElementById("email").value = emailParam
        document.getElementById("senha").focus()
    }

    if (params.get("cadastro") === "1") {
        mostrarToast("Cadastro concluído! Agora entre com sua senha.", "success")
    }

    if (estaLogado() && !params.get("redirect")) {
        mostrarToast("Você já está logado como " + (getNomeCliente() || "cliente") + ".", "warning")
    }
}

iniciarLogin()
