# NexTech Informática

Loja de informática completa: catálogo em MySQL, API Node.js/Express com autenticação JWT e
front-end responsivo com carrinho, montador de PC e área do cliente.

> **Slogan:** Seu próximo upgrade começa aqui.

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Como rodar](#como-rodar)
- [Configuração do `.env`](#configuração-do-env)
- [Banco de dados](#banco-de-dados)
- [API](#api)
- [Front-end](#front-end)
- [Testes](#testes)
- [Scripts disponíveis](#scripts-disponíveis)

---

## Funcionalidades

### Catálogo
- 50 produtos cadastrados diretamente no MySQL, em 14 categorias:
  processadores, placas de vídeo, placas-mãe, memórias, armazenamento, fontes, gabinetes,
  coolers, monitores, periféricos, notebooks, smartphones, PCs prontos e serviços.
- PCs para **escritório, intermediário, gamer e lazer**, além de celulares, periféricos e
  serviços de instalação/manutenção do Windows.
- Busca por nome, filtro por categoria e faixa de preço, ordenação e paginação.
- **10 produtos por página** — `pagina=1` devolve os itens 1 a 10, `pagina=2` os itens 11 a 20,
  e assim por diante (5 páginas com 50 produtos).
- Ordenação por menor preço, maior preço, nome A–Z/Z–A, melhor avaliados, destaques e novidades.
- Página de detalhe com descrição, especificações, estoque, parcelamento e produtos relacionados.
- Imagens SVG locais para todos os produtos (sem dependência de imagens externas).

### Conta e compra
- Cadastro com validação de nome, CPF, celular, email e senha.
- Senhas armazenadas com **bcrypt** (nunca em texto puro).
- Login com **JWT** (validade de 7 dias) e rotas protegidas.
- `localStorage` guarda `nome_cliente` e `token` após o login.
- Usuário cadastrado entra com o **mesmo email e senha** informados no cadastro.
- Carrinho persistido no navegador, com quantidade, remoção, cupom e frete.
- Checkout exige login: sem sessão, o site abre um aviso para entrar ou criar conta.
- Página "Minha conta" com dados do cliente (via `GET /cliente/perfil`) e histórico de pedidos.
- Monte seu PC com presets, seleção de componentes, serviços opcionais e total em tempo real.

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Servidor | Node.js + Express 5 |
| Banco | MySQL 8.4 (`mysql2/promise`) |
| Autenticação | JSON Web Token (`jsonwebtoken`) + `bcrypt` |
| Front-end | HTML5, CSS3, JavaScript puro e Bootstrap 5.3 |
| Testes | `node:test` (test runner nativo do Node.js) |

---

## Estrutura do projeto

```
projeto_final/
├── app.js                  # configuração do Express
├── index.js                # inicialização do servidor
├── db.js                   # pool de conexões MySQL via .env
├── migration.js            # cria tabelas e carrega o catálogo
├── data/produtos.js        # fonte única dos 50 produtos
├── src/
│   ├── produtos.js         # rotas do catálogo
│   ├── clientes.js         # cadastro, login e perfil
│   ├── validacao.js        # validação dos filtros + SQL parametrizado
│   └── auth.js             # middleware do JWT
├── scripts/
│   ├── criar-banco.js      # cria o banco se não existir
│   ├── testar-banco.js     # diagnóstico do banco (npm run db:test)
│   ├── gerar-imagens.js    # gera os SVGs dos produtos
│   └── gerar-sql.js        # gera o produto.sql
├── tests/
│   ├── validacao.test.js   # testes unitários dos filtros
│   ├── api.test.js         # testes de integração da API
│   └── site.test.js        # testes estáticos do front-end
├── site/
│   ├── index.html          # home
│   ├── produtos.html       # catálogo
│   ├── produto.html        # detalhe
│   ├── carrinho.html       # carrinho
│   ├── monte-seu-pc.html   # montador
│   ├── login.html
│   ├── cadastro.html
│   ├── perfil.html
│   ├── css/style.css
│   ├── js/                 # api, ui, layout, presets e scripts de cada página
│   ├── vendor/             # Bootstrap 5.3 e Bootstrap Icons locais
│   └── assets/img/         # logo, favicon e imagens dos produtos
├── produto.sql             # catálogo em SQL (para Workbench)
├── cliente.sql             # estrutura da tabela de clientes
├── modelo_cliente.json     # exemplo de corpo para POST /cliente
├── dotenv-example.txt      # modelo do arquivo .env
└── package.json
```

---

## Como rodar

### Pré-requisitos
- Node.js 20 ou superior
- MySQL 8.x em execução

### Passo a passo

```bash
# 1. Instalar as dependências
npm install

# 2. Criar o arquivo de configuração
#    Copie dotenv-example.txt para .env e ajuste usuário/senha do MySQL
copy dotenv-example.txt .env      # Windows
# cp dotenv-example.txt .env      # Linux/macOS

# 3. Criar o banco (opcional: a migration também cria)
npm run db:create

# 4. Criar as tabelas e carregar os 50 produtos + cliente demo
npm run migrate

# 5. Subir a API e o site
npm start
```

Acesse **http://localhost:3000**.

Para recriar o banco do zero (apaga as tabelas e recarrega tudo):

```bash
npm run migrate:reset
```

### Login de demonstração

| Email | Senha |
|---|---|
| `demo@nextech.com` | `demo1234` |

---

## Configuração do `.env`

```env
API_PORT=3000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_do_mysql
DB_DATABASE=nextech

JWT_SECRET=uma_chave_longa_e_aleatoria
JWT_EXPIRES_IN=7d
```

Gere uma chave segura com:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> O arquivo `.env` está no `.gitignore` e não deve ser versionado.

---

## Banco de dados

### Tabelas

**`cliente`**

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | INT | chave primária |
| `nome` | VARCHAR(100) | obrigatório |
| `cpf` | CHAR(14) | único, formato `000.000.000-00` |
| `celular` | CHAR(14) | formato `(00)00000-0000` |
| `email` | VARCHAR(100) | único |
| `senha` | VARCHAR(512) | hash bcrypt |

**`produto`**

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | INT | chave primária |
| `nome` | VARCHAR(200) | |
| `descricao` | TEXT | |
| `categoria` | VARCHAR(50) | indexada |
| `marca` | VARCHAR(60) | |
| `preco` | DECIMAL(10,2) | indexado |
| `preco_antigo` | DECIMAL(10,2) | pode ser nulo |
| `estoque` | INT | |
| `destaque` | TINYINT(1) | indexado |
| `caminho_img` | VARCHAR(255) | caminho do SVG |
| `quantidade_img` | INT | |
| `avaliacao` | DECIMAL(2,1) | |
| `avaliacoes` | INT | |

### Scripts SQL

- `produto.sql` — recria a tabela `produto` e insere os 50 itens (gerado por `npm run sql`).
- `cliente.sql` — cria a tabela `cliente`.

Ambos podem ser executados no MySQL Workbench. O `migration.js` faz o mesmo de forma
automática e idempotente.

### MySQL portátil (usado neste ambiente)

Neste computador o MySQL 8.4.9 foi instalado em modo portátil, sem serviço do Windows:

```powershell
$base = "C:\Users\Public\mysql-nextech\mysql-8.4.9-winx64"

# iniciar o servidor
& "$base\bin\mysqld.exe" `
  --basedir="$base" `
  --datadir="C:\Users\Public\mysql-nextech\data" `
  --port=3306 `
  --bind-address=127.0.0.1 `
  --log-error="C:\Users\Public\mysql-nextech\mysql-error.log"

# conferir se está no ar
Test-NetConnection 127.0.0.1 -Port 3306
```

Credenciais locais usadas no `.env`: usuário `root`, banco `nextech`.
A senha do root está definida no arquivo `.env` (não versionado).

Se você usa o MySQL instalado como serviço, basta iniciá-lo pelo serviço do Windows e
apontar `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_DATABASE` no `.env`.

---

## API

Base: `http://localhost:3000`

### Autenticação

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/cliente` | Cadastra um cliente |
| `POST` | `/login` | Autentica e devolve o JWT |
| `GET` | `/cliente/perfil` | Dados do cliente autenticado |

**POST /cliente**

```json
{
  "nome": "Cliente Exemplo",
  "cpf": "123.456.789-09",
  "celular": "(42)99999-0000",
  "email": "cliente@exemplo.com",
  "senha": "senha123"
}
```

- `201` — `{ "msg": "Cliente cadastrado com sucesso", "id": 2 }`
- `400` — dados inválidos
- `409` — email ou CPF já cadastrado

**POST /login**

```json
{ "email": "demo@nextech.com", "senha": "demo1234" }
```

- `200` — `{ "nome": "Cliente Demo", "email": "...", "token": "..." }`
- `401` — email ou senha inválidos

**GET /cliente/perfil**

Envie o cabeçalho `Authorization: Bearer <token>`.

- `200` — `{ "id", "nome", "cpf", "celular", "email" }`
- `401` — token não enviado
- `403` — token inválido ou expirado

### Produtos

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/produtos` | Lista paginada com filtros |
| `GET` | `/produtos/:id` | Produto específico |
| `GET` | `/produtos/categorias` | Categorias com contagem |
| `GET` | `/produtos/filtros` | Faixa de preço + categorias |
| `GET` | `/produtos/destaques` | Produtos em destaque |
| `GET` | `/produtos/todos` | Catálogo completo em array |

O alias `/produto` responde exatamente como `/produtos`.

**Parâmetros de `GET /produtos`**

| Parâmetro | Exemplo | Descrição |
|---|---|---|
| `nome` | `Ryzen` | Busca por trecho do nome |
| `categoria` | `Processadores` | Aceita singular/plural (`processador`) |
| `preco_min` | `200` | Preço mínimo |
| `preco_max` | `700` | Preço máximo |
| `ordem` | `menor_preco` | Veja a lista abaixo |
| `pagina` | `2` | Página (10 itens por página) |

Ordenações aceitas: `relevancia`, `destaques`, `menor_preco`, `maior_preco`, `nome_az`,
`nome_za`, `avaliacao`, `novidades`.

**Exemplo**

```
GET /produtos?categoria=processador&preco_min=200&preco_max=700&ordem=menor_preco&pagina=1
```

```json
{
  "pagina": 1,
  "por_pagina": 10,
  "total": 1,
  "total_paginas": 1,
  "tem_anterior": false,
  "tem_proxima": false,
  "produtos": [
    {
      "id": 2,
      "nome": "Processador AMD Athlon 3000G 3.5GHz",
      "categoria": "Processadores",
      "marca": "AMD",
      "preco": 329.9,
      "estoque": 18,
      "caminho_img": "assets/img/produtos/02-athlon-3000g.svg",
      "avaliacao": 4.4,
      "avaliacoes": 160
    }
  ]
}
```

### Diagnóstico

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/health` | Status da API e do banco |

---

## Front-end

O Express serve a pasta `site/` na raiz (`http://localhost:3000`).

| Página | URL | Conteúdo |
|---|---|---|
| Home | `/index.html` | Hero, categorias, destaques, presets, serviços |
| Catálogo | `/produtos.html` | Busca, filtros, ordenação e paginação |
| Detalhe | `/produto.html?id=1` | Produto, especificações e relacionados |
| Carrinho | `/carrinho.html` | Itens, cupom, frete e checkout |
| Monte seu PC | `/monte-seu-pc.html` | Presets e montagem peça por peça |
| Login | `/login.html` | Autenticação |
| Cadastro | `/cadastro.html` | Criação de conta |
| Perfil | `/perfil.html` | Dados do cliente e pedidos |

Detalhes de implementação:

- `site/js/api.js` centraliza as chamadas HTTP e a sessão (`localStorage`).
- `site/js/ui.js` contém cards, preços, estrelas, toasts e funções do carrinho.
- `site/js/layout.js` injeta cabeçalho, rodapé e estado de login em todas as páginas.
- O carrinho usa a chave `nextech_carrinho`; os pedidos ficam em `nextech_pedidos`.
- Cupom de demonstração: **`NEXTECH10`** (10% de desconto).
- Frete grátis em compras acima de **R$ 299**.
- Nenhuma página depende de imagens externas: as ilustrações são SVGs locais.
- Bootstrap 5.3 e Bootstrap Icons são servidos localmente (`site/vendor/`), então o site
  funciona mesmo sem internet. Apenas a fonte Manrope vem do Google Fonts e, sem conexão,
  o navegador usa a fonte padrão do sistema.

---

## Testes

```bash
npm test        # 39 testes: validação, API e front-end
npm run db:test # diagnóstico completo do banco
```

- `tests/validacao.test.js` — regras de filtro, paginação, ordenação e SQL parametrizado.
- `tests/api.test.js` — sobe o Express em uma porta livre e testa catálogo, paginação,
  filtros, cadastro, login, JWT, perfil e arquivos estáticos. Os clientes criados são
  removidos ao final.
- `tests/site.test.js` — garante que todas as páginas, scripts, estilos e as 50 imagens
  existem e que os elementos essenciais estão presentes.

O `npm run db:test` valida conexão, contagens, categorias, faixa de preço, paginação
(1–10, 11–20, ...), filtros, ordenações e o hash bcrypt do cliente demo.

---

## Scripts disponíveis

| Comando | O que faz |
|---|---|
| `npm start` | Sobe a API + site em `http://localhost:3000` |
| `npm run dev` | Igual ao start, com recarga automática |
| `npm run migrate` | Cria tabelas e carrega os dados (idempotente) |
| `npm run migrate:reset` | Apaga as tabelas e recarrega tudo |
| `npm run db:create` | Cria o banco, se necessário |
| `npm run db:test` | Diagnóstico do banco |
| `npm test` | Executa a suíte de testes |
| `npm run imagens` | Regenera as imagens SVG dos produtos |
| `npm run sql` | Regenera o `produto.sql` |

---

## Segurança aplicada

- Senhas com hash bcrypt (custo 10).
- JWT assinado com segredo do `.env`, expiração de 7 dias.
- Todas as consultas SQL usam placeholders (`?`) — sem concatenação de valores.
- Ordenação validada por lista branca (nunca interpolada da query).
- Validação e limitação de tamanho de todos os campos de entrada.
- Escapamento de HTML em nomes de cliente/produtos exibidos dinamicamente.
- `.env` fora do controle de versão.

---

Projeto acadêmico de Desenvolvimento de Sistemas — API Node.js + MySQL.
