const bcrypt = require("bcrypt")
const db = require("../db")
const {
    validarQueryProdutos,
    montarFiltrosSql,
    montarOrdenacao,
    PRODUTOS_POR_PAGINA
} = require("../src/validacao")

function titulo(texto) {
    console.log("\n" + texto)
    console.log("-".repeat(texto.length))
}

async function executar() {
    try {
        titulo("1. Conexão")
        const [versao] = await db.pool.query("SELECT VERSION() AS versao, DATABASE() AS banco")
        console.log("MySQL:", versao[0].versao)
        console.log("Banco:", versao[0].banco)

        titulo("2. Contagens")
        const [contagemProdutos] = await db.pool.query("SELECT COUNT(*) AS total FROM produto")
        const [contagemClientes] = await db.pool.query("SELECT COUNT(*) AS total FROM cliente")
        const totalProdutos = Number(contagemProdutos[0].total)
        const totalClientes = Number(contagemClientes[0].total)
        console.log("Produtos:", totalProdutos)
        console.log("Clientes:", totalClientes)

        if (totalProdutos < 30 || totalProdutos > 50) {
            throw new Error("O catálogo deve ter entre 30 e 50 produtos. Encontrado: " + totalProdutos)
        }

        titulo("3. Categorias")
        const [categorias] = await db.pool.query(
            "SELECT categoria, COUNT(*) AS total FROM produto GROUP BY categoria ORDER BY categoria"
        )
        categorias.forEach(c => console.log(c.categoria.padEnd(20, ".") + " " + c.total))

        titulo("4. Faixa de preço")
        const [faixa] = await db.pool.query(
            "SELECT MIN(preco) AS menor, MAX(preco) AS maior, AVG(preco) AS media FROM produto"
        )
        console.log("Menor: R$ " + Number(faixa[0].menor).toFixed(2))
        console.log("Maior: R$ " + Number(faixa[0].maior).toFixed(2))
        console.log("Média: R$ " + Number(faixa[0].media).toFixed(2))

        titulo("5. Paginação")
        const paginas = Math.ceil(totalProdutos / PRODUTOS_POR_PAGINA)
        console.log("Itens por página:", PRODUTOS_POR_PAGINA)
        console.log("Total de páginas:", paginas)

        for (let pagina = 1; pagina <= paginas; pagina++) {
            const { filtros } = validarQueryProdutos({ pagina })
            const { where, valores } = montarFiltrosSql(filtros)
            const [linhas] = await db.pool.query(
                `SELECT id FROM produto ${where} ORDER BY ${montarOrdenacao(filtros.ordem)} LIMIT ? OFFSET ?`,
                [...valores, PRODUTOS_POR_PAGINA, (pagina - 1) * PRODUTOS_POR_PAGINA]
            )
            console.log("Página " + pagina + ": " + linhas.length + " itens (IDs " +
                (linhas.length ? linhas[0].id + " a " + linhas[linhas.length - 1].id : "-") + ")")
        }

        titulo("6. Filtros de teste")
        const testes = [
            { nome: "categoria", query: { categoria: "processador" } },
            { nome: "preço 200-700", query: { preco_min: 200, preco_max: 700 } },
            { nome: "menor preço", query: { ordem: "menor_preco" } },
            { nome: "maior preço", query: { ordem: "maior_preco" } }
        ]

        for (const teste of testes) {
            const { filtros, erro } = validarQueryProdutos(teste.query)
            if (erro) throw new Error(erro)
            const { where, valores } = montarFiltrosSql(filtros)
            const [linhas] = await db.pool.query(
                `SELECT id, nome, preco FROM produto ${where} ORDER BY ${montarOrdenacao(filtros.ordem)} LIMIT 3`,
                valores
            )
            console.log(teste.nome + ": " + linhas.length + " resultado(s) na amostra")
            linhas.forEach(l => console.log("  - " + l.nome + " (R$ " + Number(l.preco).toFixed(2) + ")"))
        }

        titulo("7. Cliente demo")
        const [demo] = await db.pool.query(
            "SELECT email, senha FROM cliente WHERE email = ? LIMIT 1",
            ["demo@nextech.com"]
        )
        if (demo.length === 0) {
            console.log("Cliente demo não encontrado (o cadastro pela tela continua funcionando).")
        } else {
            const hash = demo[0].senha
            const valida = await bcrypt.compare("demo1234", hash)
            console.log("Email: demo@nextech.com")
            console.log("Hash bcrypt:", hash.slice(0, 20) + "...")
            console.log("Senha demo1234 confere:", valida ? "SIM" : "NÃO")
            if (!valida) throw new Error("A senha do cliente demo não confere")
        }

        titulo("Resultado final")
        console.log("Banco de dados validado com sucesso.")
    } catch (error) {
        console.error("\nFalha no teste do banco:", error.message)
        process.exitCode = 1
    } finally {
        await db.pool.end()
    }
}

executar()
