// Camada de acesso à API da NexTech.
// Quando o site é aberto pelo Express (http://localhost:3000), usa a mesma origem.
// Se o HTML for aberto como arquivo, cai para http://localhost:3000.
const API_URL = location.protocol === "file:" ? "http://localhost:3000" : location.origin

async function apiFetch(caminho, opcoes = {}) {
    const resposta = await fetch(API_URL + caminho, opcoes)
    const texto = await resposta.text()
    let dados = null

    try {
        dados = texto ? JSON.parse(texto) : null
    } catch {
        dados = { erro: texto }
    }

    if (!resposta.ok) {
        const erro = new Error((dados && dados.erro) || "Erro " + resposta.status)
        erro.status = resposta.status
        erro.dados = dados
        throw erro
    }

    return dados
}

function apiGet(caminho) {
    return apiFetch(caminho)
}

function apiPost(caminho, corpo) {
    return apiFetch(caminho, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo)
    })
}

function apiGetAuth(caminho) {
    const token = getToken()
    return apiFetch(caminho, {
        headers: token ? { Authorization: "Bearer " + token } : {}
    })
}

function getToken() {
    return localStorage.getItem("token")
}

function getNomeCliente() {
    return localStorage.getItem("nome_cliente") || ""
}

function salvarSessao(nome, token) {
    localStorage.setItem("nome_cliente", nome)
    localStorage.setItem("token", token)
}

function limparSessao() {
    localStorage.removeItem("nome_cliente")
    localStorage.removeItem("token")
}

function estaLogado() {
    return Boolean(getToken())
}

function loginUrl(redirect) {
    const destino = redirect || (location.pathname.split("/").pop() + location.search)
    return "login.html?redirect=" + encodeURIComponent(destino)
}

function irParaLogin(redirect) {
    location.href = loginUrl(redirect)
}

function queryParams() {
    return new URLSearchParams(location.search)
}
