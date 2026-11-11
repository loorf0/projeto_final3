// Gera as ilustrações SVG dos 50 produtos.
// Uso: npm run imagens
const fs = require("fs")
const path = require("path")
const produtos = require("../data/produtos")

const destino = path.join(__dirname, "..", "site", "assets", "img", "produtos")
fs.mkdirSync(destino, { recursive: true })

const paletas = [
    ["#061a2e", "#0b3b6f", "#22d3ee"],
    ["#0b1026", "#2b1b6b", "#a78bfa"],
    ["#031c24", "#0b4f5c", "#2dd4bf"],
    ["#1a1024", "#4c1d95", "#f472b6"],
    ["#1a1206", "#7c2d12", "#fb923c"],
    ["#0a1a12", "#14532d", "#4ade80"],
    ["#0b1b25", "#164e63", "#38bdf8"],
    ["#1b1220", "#831843", "#fb7185"]
]

function icone(nome, cor) {
    const stroke = `stroke="${cor}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"`
    const fill = `fill="rgba(255,255,255,0.05)"`
    // `soft` desenha apenas o contorno (sem preenchimento).
    // `softStroke` é usado em elementos que já definem o próprio `fill`,
    // evitando atributos `fill` duplicados (SVG inválido).
    const soft = `fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="6" stroke-linecap="round"`
    const softStroke = `stroke="rgba(255,255,255,0.55)" stroke-width="6" stroke-linecap="round"`

    switch (nome) {
        case "cpu":
            return `
                <g transform="translate(400 300)">
                    <rect x="-120" y="-120" width="240" height="240" rx="24" ${fill} ${stroke}/>
                    <rect x="-62" y="-62" width="124" height="124" rx="12" fill="rgba(255,255,255,0.08)" ${stroke}/>
                    <path d="M-26 -26h52v52h-52z" fill="${cor}" opacity=".7"/>
                    ${[-80, -40, 0, 40, 80].map(x => `<path d="M${x} -142v22M${x} 120v22" ${soft}/>`).join("")}
                    ${[-80, -40, 0, 40, 80].map(y => `<path d="M-142 ${y}h22M120 ${y}h22" ${soft}/>`).join("")}
                    <circle cx="-92" cy="-92" r="5" fill="${cor}"/>
                </g>`
        case "gpu":
            return `
                <g transform="translate(400 300)">
                    <rect x="-170" y="-92" width="320" height="184" rx="20" ${fill} ${stroke}/>
                    <rect x="-190" y="-70" width="30" height="140" rx="8" fill="rgba(255,255,255,0.12)" ${softStroke}/>
                    <circle cx="-68" cy="0" r="58" fill="none" stroke="${cor}" stroke-width="8"/>
                    <circle cx="68" cy="0" r="58" fill="none" stroke="${cor}" stroke-width="8"/>
                    <circle cx="-68" cy="0" r="10" fill="${cor}"/>
                    <circle cx="68" cy="0" r="10" fill="${cor}"/>
                    <path d="M-126 0h30M-38 0h30M-190 -92h70M150 60h20" ${soft}/>
                    <path d="M-110 -74h40M-110 74h40" ${soft}/>
                </g>`
        case "motherboard":
            return `
                <g transform="translate(400 300)">
                    <rect x="-165" y="-115" width="330" height="230" rx="14" ${fill} ${stroke}/>
                    <rect x="-125" y="-75" width="95" height="95" rx="8" fill="rgba(255,255,255,0.08)" ${stroke}/>
                    <path d="M-35 -55h120M-35 -20h120M-35 15h120M-35 50h120" ${soft}/>
                    <circle cx="105" cy="-65" r="18" ${soft}/>
                    <circle cx="105" cy="-10" r="10" fill="${cor}"/>
                    <circle cx="105" cy="30" r="10" fill="${cor}" opacity=".6"/>
                    <path d="M-130 80h80M-130 100h120" ${soft}/>
                </g>`
        case "ram":
            return `
                <g transform="translate(400 300)">
                    <g transform="rotate(-8)">
                        <rect x="-185" y="-75" width="370" height="70" rx="12" ${fill} ${stroke}/>
                        ${[-135, -70, -5, 60, 125].map(x => `<rect x="${x}" y="-55" width="42" height="30" rx="5" fill="${cor}" opacity=".65"/>`).join("")}
                        <path d="M-185 8h370" ${soft}/>
                    </g>
                    <g transform="rotate(8) translate(0 62)">
                        <rect x="-185" y="-40" width="370" height="70" rx="12" ${fill} ${stroke}/>
                        ${[-135, -70, -5, 60, 125].map(x => `<rect x="${x}" y="-20" width="42" height="30" rx="5" fill="${cor}" opacity=".45"/>`).join("")}
                    </g>
                </g>`
        case "ssd":
            return `
                <g transform="translate(400 300)">
                    <rect x="-165" y="-105" width="330" height="210" rx="18" ${fill} ${stroke}/>
                    <rect x="-125" y="-65" width="250" height="130" rx="10" fill="rgba(255,255,255,0.06)" ${softStroke}/>
                    <circle cx="-80" cy="0" r="26" fill="none" stroke="${cor}" stroke-width="7"/>
                    <circle cx="0" cy="0" r="26" fill="none" stroke="${cor}" stroke-width="7"/>
                    <circle cx="80" cy="0" r="26" fill="none" stroke="${cor}" stroke-width="7"/>
                    <path d="M-145 80h30v20h-30zM-105 80h30v20h-30z" fill="${cor}" opacity=".8"/>
                    <path d="M125 -105v-24h40" ${soft}/>
                </g>`
        case "psu":
            return `
                <g transform="translate(400 300)">
                    <rect x="-155" y="-115" width="310" height="230" rx="18" ${fill} ${stroke}/>
                    <circle cx="-30" cy="0" r="78" fill="none" stroke="${cor}" stroke-width="8"/>
                    <circle cx="-30" cy="0" r="14" fill="${cor}"/>
                    ${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<path d="M-30 0L${-30 + Math.cos(a * Math.PI / 180) * 62} ${Math.sin(a * Math.PI / 180) * 62}" ${soft}/>`).join("")}
                    <path d="M95 -60h35v120h-35z" ${soft}/>
                    <path d="M130 -40h28M130 0h28M130 40h28" ${soft}/>
                </g>`
        case "case":
            return `
                <g transform="translate(400 300)">
                    <rect x="-120" y="-160" width="240" height="320" rx="16" ${fill} ${stroke}/>
                    <rect x="-88" y="-128" width="176" height="150" rx="10" fill="rgba(255,255,255,0.04)" ${softStroke}/>
                    <circle cx="0" cy="80" r="34" fill="none" stroke="${cor}" stroke-width="7"/>
                    <circle cx="0" cy="80" r="8" fill="${cor}"/>
                    <path d="M-70 145h140" ${soft}/>
                    <path d="M-95 -100h20M-95 -80h20M-95 -60h20" stroke="${cor}" stroke-width="7" stroke-linecap="round"/>
                </g>`
        case "cooler":
            return `
                <g transform="translate(400 300)">
                    <circle cx="0" cy="0" r="125" fill="rgba(255,255,255,0.04)" ${stroke}/>
                    <circle cx="0" cy="0" r="26" fill="${cor}" opacity=".8"/>
                    ${[0, 60, 120, 180, 240, 300].map(a => `<path d="M${Math.cos(a * Math.PI / 180) * 28} ${Math.sin(a * Math.PI / 180) * 28} Q${Math.cos((a + 25) * Math.PI / 180) * 90} ${Math.sin((a + 25) * Math.PI / 180) * 90} ${Math.cos((a + 45) * Math.PI / 180) * 105} ${Math.sin((a + 45) * Math.PI / 180) * 105}" fill="none" stroke="${cor}" stroke-width="8" stroke-linecap="round" opacity=".85"/>`).join("")}
                    <circle cx="0" cy="0" r="8" fill="#fff"/>
                </g>`
        case "monitor":
            return `
                <g transform="translate(400 300)">
                    <rect x="-185" y="-125" width="370" height="220" rx="16" ${fill} ${stroke}/>
                    <rect x="-158" y="-98" width="316" height="166" rx="8" fill="rgba(255,255,255,0.05)" ${softStroke}/>
                    <path d="M-25 95v35h50v-35M-75 130h150" fill="none" ${stroke}/>
                    <path d="M-130 -40h90M-130 -10h160M-130 20h120" stroke="${cor}" stroke-width="6" opacity=".55" stroke-linecap="round"/>
                </g>`
        case "keyboard":
            return `
                <g transform="translate(400 300)">
                    <rect x="-190" y="-95" width="380" height="190" rx="18" ${fill} ${stroke}/>
                    ${[-145, -105, -65, -25, 15, 55, 95, 135].map(x => `<rect x="${x}" y="-65" width="28" height="28" rx="5" fill="${cor}" opacity=".55"/>`).join("")}
                    ${[-145, -105, -65, -25, 15, 55, 95, 135].map(x => `<rect x="${x}" y="-20" width="28" height="28" rx="5" fill="${cor}" opacity=".35"/>`).join("")}
                    <rect x="-145" y="25" width="90" height="28" rx="5" fill="${cor}" opacity=".55"/>
                    <rect x="-35" y="25" width="200" height="28" rx="5" fill="${cor}" opacity=".3"/>
                    <rect x="185" y="25" width="30" height="28" rx="5" fill="${cor}" opacity=".55"/>
                </g>`
        case "mouse":
            return `
                <g transform="translate(400 300)">
                    <path d="M0 -140c62 0 100 42 100 102v46c0 60-38 102-100 102S-100 68-100 8v-46c0-60 38-102 100-102z" ${fill} ${stroke}/>
                    <path d="M0 -140v92M-100 -20h200" ${soft}/>
                    <rect x="-13" y="-100" width="26" height="55" rx="13" fill="${cor}" opacity=".8"/>
                    <path d="M0 -170c0-18 15-30 32-30" ${soft}/>
                </g>`
        case "headset":
            return `
                <g transform="translate(400 300)">
                    <path d="M-105 25v-45c0-65 47-112 105-112S105 -85 105 -20v45" fill="none" stroke="${cor}" stroke-width="10" stroke-linecap="round"/>
                    <rect x="-145" y="10" width="70" height="110" rx="22" ${fill} ${stroke}/>
                    <rect x="75" y="10" width="70" height="110" rx="22" ${fill} ${stroke}/>
                    <path d="M105 75c25 0 45 20 45 45s-20 45-45 45H65" ${soft}/>
                    <circle cx="65" cy="165" r="12" fill="${cor}" opacity=".8"/>
                </g>`
        case "mousepad":
            return `
                <g transform="translate(400 300)">
                    <path d="M-210 60L-120 -95H180l90 155z" ${fill} ${stroke}/>
                    <path d="M-178 45L-110 -70H168l68 115z" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="4" stroke-dasharray="9 8"/>
                    <path d="M-40 10h120" stroke="${cor}" stroke-width="8" stroke-linecap="round" opacity=".7"/>
                </g>`
        case "webcam":
            return `
                <g transform="translate(400 300)">
                    <rect x="-130" y="-95" width="260" height="190" rx="40" ${fill} ${stroke}/>
                    <circle cx="0" cy="0" r="72" fill="none" stroke="${cor}" stroke-width="9"/>
                    <circle cx="0" cy="0" r="38" fill="rgba(255,255,255,0.12)" ${stroke}/>
                    <circle cx="-45" cy="-45" r="10" fill="#fff" opacity=".8"/>
                    <path d="M-60 95v35h120v-35M-25 130h50" ${soft}/>
                </g>`
        case "laptop":
            return `
                <g transform="translate(400 300)">
                    <rect x="-200" y="-130" width="400" height="240" rx="16" ${fill} ${stroke}/>
                    <rect x="-175" y="-105" width="350" height="190" rx="8" fill="rgba(255,255,255,0.05)" ${softStroke}/>
                    <path d="M-235 110h470l-35 45H-200z" fill="rgba(255,255,255,0.07)" ${stroke}/>
                    <path d="M-105 137h210" ${soft}/>
                    <path d="M-135 -35h100M-135 0h180M-135 35h140" stroke="${cor}" stroke-width="6" opacity=".5" stroke-linecap="round"/>
                </g>`
        case "phone":
            return `
                <g transform="translate(400 300)">
                    <rect x="-95" y="-170" width="190" height="340" rx="30" ${fill} ${stroke}/>
                    <rect x="-72" y="-138" width="144" height="250" rx="12" fill="rgba(255,255,255,0.05)" ${softStroke}/>
                    <path d="M-35 -155h70" ${soft}/>
                    <circle cx="0" cy="140" r="12" ${soft}/>
                    <rect x="-25" y="-85" width="50" height="50" rx="10" fill="${cor}" opacity=".6"/>
                    <path d="M-55 -10h110M-55 20h90" stroke="${cor}" stroke-width="6" opacity=".5" stroke-linecap="round"/>
                </g>`
        case "desktop":
            return `
                <g transform="translate(400 300)">
                    <rect x="-200" y="-130" width="250" height="190" rx="14" ${fill} ${stroke}/>
                    <rect x="-175" y="-105" width="200" height="140" rx="8" fill="rgba(255,255,255,0.05)" ${softStroke}/>
                    <path d="M-105 60v30h60V60M-145 90h140" fill="none" ${stroke}/>
                    <rect x="85" y="-140" width="115" height="280" rx="14" ${fill} ${stroke}/>
                    <circle cx="142" cy="0" r="28" fill="none" stroke="${cor}" stroke-width="7"/>
                    <circle cx="142" cy="0" r="7" fill="${cor}"/>
                    <path d="M110 -110h64M110 110h64" ${soft}/>
                    <path d="M110 -85h10M110 -65h10M110 -45h10" stroke="${cor}" stroke-width="6" stroke-linecap="round"/>
                </g>`
        case "windows":
            return `
                <g transform="translate(400 300)">
                    <path d="M-150 -120l130 -22v128h-130z" fill="${cor}" opacity=".85"/>
                    <path d="M0 -145l150 24v117H0z" fill="${cor}" opacity=".55"/>
                    <path d="M-150 18h130v128l-130 -22z" fill="${cor}" opacity=".55"/>
                    <path d="M0 18h150v117L0 159z" fill="${cor}" opacity=".3"/>
                    <path d="M-163 -132l326 52M-163 132l326 -52" stroke="rgba(255,255,255,0.35)" stroke-width="4"/>
                </g>`
        case "gear":
            return `
                <g transform="translate(400 300)">
                    <circle cx="0" cy="0" r="92" fill="none" stroke="${cor}" stroke-width="10"/>
                    ${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<rect x="-16" y="-132" width="32" height="40" rx="6" fill="${cor}" transform="rotate(${a})"/>`).join("")}
                    <circle cx="0" cy="0" r="38" fill="rgba(255,255,255,0.1)" ${stroke}/>
                    <path d="M-170 150l70-70M170 150l-70-70" stroke="rgba(255,255,255,0.35)" stroke-width="6" stroke-linecap="round"/>
                </g>`
        case "tools":
            return `
                <g transform="translate(400 300)">
                    <g transform="rotate(-35)">
                        <rect x="-15" y="-150" width="30" height="230" rx="10" fill="rgba(255,255,255,0.08)" ${stroke}/>
                        <path d="M-45 -165h90l-15 45h-60z" fill="${cor}" opacity=".8"/>
                    </g>
                    <g transform="rotate(35)">
                        <rect x="-12" y="-95" width="24" height="210" rx="8" fill="rgba(255,255,255,0.08)" ${stroke}/>
                        <path d="M-55 -135a45 45 0 1 1 110 0c0 20-10 35-28 42v20h-54v-20c-18-7-28-22-28-42z" fill="none" stroke="${cor}" stroke-width="9"/>
                    </g>
                </g>`
        default:
            return `<g transform="translate(400 300)"><rect x="-120" y="-120" width="240" height="240" rx="28" ${fill} ${stroke}/><path d="M-60 0h120M0 -60v120" ${soft}/></g>`
    }
}

function gerarSvg(produto, indice) {
    const [fundo1, fundo2, cor] = paletas[indice % paletas.length]
    const rotacao = (indice % 7) - 3
    return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" role="img" aria-label="${produto.nome.replace(/"/g, "&quot;")}">
    <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="${fundo1}"/>
            <stop offset="1" stop-color="${fundo2}"/>
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="55%">
            <stop offset="0" stop-color="${cor}" stop-opacity=".28"/>
            <stop offset="1" stop-color="${cor}" stop-opacity="0"/>
        </radialGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="rgba(255,255,255,0.045)" stroke-width="1"/>
        </pattern>
    </defs>
    <rect width="800" height="600" fill="url(#bg)"/>
    <rect width="800" height="600" fill="url(#grid)"/>
    <circle cx="400" cy="300" r="270" fill="url(#glow)"/>
    <circle cx="680" cy="90" r="120" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="2"/>
    <circle cx="120" cy="520" r="160" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="2"/>
    <g transform="rotate(${rotacao} 400 300)">
        ${icone(produto.icone, cor)}
    </g>
    <text x="40" y="560" fill="rgba(255,255,255,0.45)" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700" letter-spacing="4">NEXTECH</text>
    <text x="760" y="560" fill="${cor}" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="700" text-anchor="end" opacity=".8">${produto.categoria.toUpperCase()}</text>
</svg>
`
}

let gerados = 0
produtos.forEach((produto, indice) => {
    const arquivo = path.basename(produto.caminho_img)
    fs.writeFileSync(path.join(destino, arquivo), gerarSvg(produto, indice), "utf8")
    gerados++
})

console.log("Imagens SVG geradas:", gerados)
console.log("Pasta:", destino)
