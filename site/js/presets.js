// Presets de montagem usados na home e na página Monte seu PC.
// Os IDs correspondem aos produtos de data/produtos.js.
const PRESETS_PC = Object.freeze({
    escritorio: {
        nome: "PC Escritório",
        descricao: "Para trabalhar, estudar e navegar com fluidez, com Windows 11 instalado.",
        icone: "bi-briefcase",
        tag: "Econômico",
        ids: [2, 11, 15, 19, 23, 26, 31, 34, 48, 50]
    },
    intermediario: {
        nome: "PC Intermediário",
        descricao: "Equilíbrio entre produtividade e jogos em Full HD com excelente custo-benefício.",
        icone: "bi-layers",
        tag: "Mais vendido",
        ids: [3, 12, 16, 20, 8, 24, 27, 29, 32, 34, 48, 50]
    },
    gamer: {
        nome: "PC Gamer",
        descricao: "Alto desempenho em 1080p e 1440p, com RTX 4060, DDR5 e refrigeração líquida.",
        icone: "bi-controller",
        tag: "Alta performance",
        ids: [5, 13, 18, 21, 7, 25, 27, 30, 33, 36, 48, 50]
    },
    lazer: {
        nome: "PC Lazer",
        descricao: "Para jogos casuais, streaming, séries e música com ótimo acabamento.",
        icone: "bi-play-circle",
        tag: "Custo-benefício",
        ids: [1, 11, 16, 20, 6, 23, 26, 29, 31, 34, 48, 50]
    }
})

function calcularTotalPreset(produtos, preset) {
    const mapa = new Map(produtos.map(produto => [Number(produto.id), produto]))
    return preset.ids.reduce((total, id) => {
        const produto = mapa.get(Number(id))
        return total + (produto ? Number(produto.preco) : 0)
    }, 0)
}
