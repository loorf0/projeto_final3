// Cadastro: máscaras, validação no navegador e envio para POST /cliente.

function somenteDigitos(valor) {
    return String(valor || "").replace(/\D/g, "")
}

function mascararCpf(valor) {
    const digitos = somenteDigitos(valor).slice(0, 11)
    return digitos
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2")
}

function mascararCelular(valor) {
    const digitos = somenteDigitos(valor).slice(0, 11)
    if (digitos.length <= 10) {
        return digitos
            .replace(/^(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{4})(\d{1,4})$/, "$1-$2")
    }
    return digitos
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d{1,4})$/, "$1-$2")
}

function emailValido(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)
}

function mostrarErro(mensagem, campoId) {
    const caixa = document.getElementById("auth-erro")
    caixa.textContent = mensagem
    caixa.classList.toggle("visivel", Boolean(mensagem))

    if (campoId) {
        const campo = document.getElementById(campoId)
        if (campo) {
            campo.classList.add("is-invalid")
            campo.focus()
        }
    }
}

function limparErros() {
    mostrarErro("")
    document.querySelectorAll(".is-invalid").forEach(campo => campo.classList.remove("is-invalid"))
}

function atualizarForcaSenha() {
    const senha = document.getElementById("senha").value
    const barras = document.querySelectorAll("#senha-forca span")
    const forca = document.getElementById("senha-forca")

    let pontos = 0
    if (senha.length >= 6) pontos++
    if (senha.length >= 10) pontos++
    if (/[A-Z]/.test(senha) && /[0-9]/.test(senha)) pontos++
    if (/[^A-Za-z0-9]/.test(senha) && senha.length >= 8) pontos = Math.max(pontos, 2)

    barras.forEach((barra, indice) => barra.classList.toggle("ativa", indice < pontos))
    forca.classList.toggle("media", pontos === 1)
}

function validarFormulario() {
    const nome = document.getElementById("nome").value.trim()
    const cpf = somenteDigitos(document.getElementById("cpf").value)
    const celular = somenteDigitos(document.getElementById("celular").value)
    const email = document.getElementById("email").value.trim()
    const senha = document.getElementById("senha").value
    const confirmar = document.getElementById("confirmar-senha").value
    const termos = document.getElementById("termos").checked

    if (nome.length < 3) {
        mostrarErro("Informe seu nome completo (pelo menos 3 caracteres).", "nome")
        return null
    }

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        mostrarErro("Informe um CPF válido com 11 dígitos.", "cpf")
        return null
    }

    if (celular.length < 10 || celular.length > 11) {
        mostrarErro("Informe um celular válido com DDD.", "celular")
        return null
    }

    if (!emailValido(email)) {
        mostrarErro("Informe um email válido.", "email")
        return null
    }

    if (senha.length < 6) {
        mostrarErro("A senha deve ter pelo menos 6 caracteres.", "senha")
        return null
    }

    if (senha.length > 72) {
        mostrarErro("A senha deve ter no máximo 72 caracteres.", "senha")
        return null
    }

    if (senha !== confirmar) {
        mostrarErro("As senhas não conferem.", "confirmar-senha")
        return null
    }

    if (!termos) {
        mostrarErro("É necessário aceitar os termos de uso para continuar.")
        return null
    }

    return {
        nome,
        cpf: mascararCpf(cpf),
        celular: mascararCelular(celular),
        email: email.toLowerCase(),
        senha
    }
}

function configurarMascaras() {
    const cpf = document.getElementById("cpf")
    const celular = document.getElementById("celular")

    cpf.addEventListener("input", () => {
        cpf.value = mascararCpf(cpf.value)
    })

    celular.addEventListener("input", () => {
        celular.value = mascararCelular(celular.value)
    })

    document.getElementById("senha").addEventListener("input", atualizarForcaSenha)
}

function configurarSenhaVisivel() {
    const campo = document.getElementById("senha")
    const botao = document.getElementById("btn-ver-senha")

    botao.addEventListener("click", () => {
        const visivel = campo.type === "text"
        campo.type = visivel ? "password" : "text"
        botao.innerHTML = visivel ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>'
        botao.setAttribute("aria-label", visivel ? "Mostrar senha" : "Ocultar senha")
    })
}

function configurarFormulario() {
    const form = document.getElementById("form-cadastro")
    const botao = document.getElementById("btn-cadastrar")

    form.addEventListener("submit", async event => {
        event.preventDefault()
        limparErros()

        const dados = validarFormulario()
        if (!dados) return

        botao.disabled = true
        botao.innerHTML = '<span class="spinner-nextech"></span> Criando conta...'

        try {
            await apiPost("/cliente", dados)
            mostrarToast("Cadastro concluído com sucesso!", "success")
            form.reset()
            document.querySelectorAll("#senha-forca span").forEach(barra => barra.classList.remove("ativa"))

            setTimeout(() => {
                location.href = "login.html?cadastro=1&email=" + encodeURIComponent(dados.email)
            }, 900)
        } catch (error) {
            const mensagem = error.status === 409
                ? error.message || "Email ou CPF já cadastrado."
                : error.status === 400
                    ? error.message || "Confira os dados informados."
                    : "Não foi possível concluir o cadastro: " + error.message

            mostrarErro(mensagem)
            mostrarToast(mensagem, "danger")
        } finally {
            botao.disabled = false
            botao.innerHTML = '<i class="bi bi-person-plus"></i> Criar conta'
        }
    })
}

function iniciarCadastro() {
    configurarMascaras()
    configurarSenhaVisivel()
    configurarFormulario()
    atualizarForcaSenha()
}

iniciarCadastro()
