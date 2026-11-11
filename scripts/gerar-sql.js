// Gera o arquivo produto.sql a partir de data/produtos.js.
// Uso: npm run sql
const fs = require("fs")
const path = require("path")
const produtos = require("../data/produtos")

function texto(valor) {
    return "'" + String(valor).replace(/\\/g, "\\\\").replace(/'/g, "''") + "'"
}

function dinheiro(valor) {
    return Number(valor).toFixed(2)
}

const linhas = produtos.map(produto => {
    return "(" + [
        produto.id,
        texto(produto.nome),
        texto(produto.descricao),
        texto(produto.categoria),
        texto(produto.marca),
        dinheiro(produto.preco),
        produto.preco_antigo === null ? "NULL" : dinheiro(produto.preco_antigo),
        produto.estoque,
        produto.destaque,
        texto(produto.caminho_img),
        produto.quantidade_img,
        dinheiro(produto.avaliacao),
        produto.avaliacoes
    ].join(", ") + ")"
}).join(",\n")

const sql = `-- NexTech Informática - estrutura e carga inicial do catálogo (50 produtos)
-- Execute no MySQL Workbench ou no terminal, no banco definido em DB_DATABASE.

DROP TABLE IF EXISTS produto;

CREATE TABLE produto (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    marca VARCHAR(60) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    preco_antigo DECIMAL(10,2) NULL,
    estoque INT NOT NULL DEFAULT 0,
    destaque TINYINT(1) NOT NULL DEFAULT 0,
    caminho_img VARCHAR(255) NOT NULL,
    quantidade_img INT NOT NULL DEFAULT 1,
    avaliacao DECIMAL(2,1) NOT NULL DEFAULT 0,
    avaliacoes INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_produto_categoria (categoria),
    KEY idx_produto_preco (preco),
    KEY idx_produto_destaque (destaque)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO produto
    (id, nome, descricao, categoria, marca, preco, preco_antigo, estoque,
     destaque, caminho_img, quantidade_img, avaliacao, avaliacoes)
VALUES
${linhas};

-- Consultas de teste
SELECT COUNT(*) AS total FROM produto;
SELECT * FROM produto ORDER BY id LIMIT 10;
SELECT * FROM produto WHERE categoria = 'Processadores';
SELECT * FROM produto WHERE preco BETWEEN 200 AND 700 ORDER BY preco ASC;
`

fs.writeFileSync(path.join(__dirname, "..", "produto.sql"), sql, "utf8")
console.log("produto.sql gerado com", produtos.length, "produtos.")
