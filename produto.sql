-- NexTech Informática - estrutura e carga inicial do catálogo (50 produtos)
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
(1, 'Processador AMD Ryzen 5 5600 3.5GHz', 'Processador de 6 núcleos e 12 threads, ótimo custo-benefício para jogos e produtividade. Cooler Wraith Stealth incluso.', 'Processadores', 'AMD', 899.90, 1099.90, 14, 1, 'assets/img/produtos/01-ryzen-5-5600.svg', 1, 4.80, 132),
(2, 'Processador AMD Athlon 3000G 3.5GHz', '2 núcleos e 4 threads com vídeo Radeon Vega 3 integrado. Opção econômica para escritório, estudo e PCs de entrada.', 'Processadores', 'AMD', 329.90, 399.90, 18, 0, 'assets/img/produtos/02-athlon-3000g.svg', 1, 4.40, 160),
(3, 'Processador Intel Core i5-12400F 2.5GHz', '6 núcleos e 12 threads de 12ª geração, excelente para setups gamer de entrada e intermediário. Socket LGA1700.', 'Processadores', 'Intel', 949.90, 1149.90, 12, 1, 'assets/img/produtos/03-i5-12400f.svg', 1, 4.70, 210),
(4, 'Processador Intel Core i7-12700F 2.1GHz', '12 núcleos e 20 threads para criação de conteúdo, renderização e jogos em alta resolução. Socket LGA1700.', 'Processadores', 'Intel', 1899.90, 2199.90, 5, 0, 'assets/img/produtos/04-i7-12700f.svg', 1, 4.80, 76),
(5, 'Processador AMD Ryzen 5 7600 3.8GHz', '6 núcleos e 12 threads com arquitetura Zen 4, PCIe 5.0 e memória DDR5. Ideal para plataformas AM5.', 'Processadores', 'AMD', 1499.90, 1699.90, 6, 1, 'assets/img/produtos/05-ryzen-5-7600.svg', 1, 4.90, 54),
(6, 'Placa de Vídeo NVIDIA GeForce RTX 3050 8GB', 'Ray tracing e DLSS para jogos em Full HD. 8GB GDDR6, três saídas DisplayPort e HDMI.', 'Placas de Vídeo', 'NVIDIA', 1299.90, 1499.90, 7, 0, 'assets/img/produtos/06-rtx-3050.svg', 1, 4.60, 88),
(7, 'Placa de Vídeo NVIDIA GeForce RTX 4060 8GB', 'Arquitetura Ada Lovelace, DLSS 3 e alto desempenho em 1080p com ray tracing. 8GB GDDR6.', 'Placas de Vídeo', 'NVIDIA', 2199.90, 2499.90, 9, 1, 'assets/img/produtos/07-rtx-4060.svg', 1, 4.80, 143),
(8, 'Placa de Vídeo AMD Radeon RX 6600 8GB', 'Excelente custo-benefício para 1080p, com 8GB GDDR6, FSR e suporte a múltiplos monitores.', 'Placas de Vídeo', 'AMD', 1399.90, 1599.90, 6, 0, 'assets/img/produtos/08-rx-6600.svg', 1, 4.70, 97),
(9, 'Placa de Vídeo NVIDIA GeForce RTX 4070 12GB', 'Desempenho para 1440p com ray tracing, DLSS 3 e 12GB GDDR6X. Ideal para gamers exigentes.', 'Placas de Vídeo', 'NVIDIA', 3899.90, 4299.90, 3, 1, 'assets/img/produtos/09-rtx-4070.svg', 1, 4.90, 61),
(10, 'Placa de Vídeo AMD Radeon RX 7800 XT 16GB', '16GB GDDR6 e arquitetura RDNA 3 para jogos em 1440p e 4K. Suporte a FSR 3 e AV1.', 'Placas de Vídeo', 'AMD', 4199.90, 4599.90, 2, 0, 'assets/img/produtos/10-rx-7800-xt.svg', 1, 4.80, 34),
(11, 'Placa-mãe ASUS Prime B550M-A', 'Micro-ATX com socket AM4, DDR4, PCIe 4.0, M.2 NVMe e VRM reforçado para Ryzen 5000.', 'Placas-mãe', 'ASUS', 649.90, 749.90, 10, 0, 'assets/img/produtos/11-asus-b550m-a.svg', 1, 4.70, 120),
(12, 'Placa-mãe Gigabyte B760M DS3H', 'Micro-ATX LGA1700 com DDR4, PCIe 4.0, dois slots M.2 e conectividade HDMI/DisplayPort.', 'Placas-mãe', 'Gigabyte', 899.90, 999.90, 8, 0, 'assets/img/produtos/12-gigabyte-b760m.svg', 1, 4.60, 74),
(13, 'Placa-mãe ASRock A620M-HDV/M.2', 'Plataforma AM5 com DDR5, PCIe 4.0 e M.2, ideal para montagens modernas com Ryzen 7000.', 'Placas-mãe', 'ASRock', 699.90, 799.90, 7, 0, 'assets/img/produtos/13-asrock-a620m.svg', 1, 4.50, 45),
(14, 'Placa-mãe ASUS ROG Strix X670E-E', 'ATX premium para AM5, DDR5, PCIe 5.0, Wi-Fi 6E, VRM robusto e iluminação Aura Sync.', 'Placas-mãe', 'ASUS', 2199.90, 2499.90, 3, 1, 'assets/img/produtos/14-asus-x670e.svg', 1, 4.90, 28),
(15, 'Memória Kingston Fury Beast 8GB DDR4 3200MHz', 'Módulo de 8GB DDR4 com perfil XMP 2.0, dissipador de alumínio e alta compatibilidade.', 'Memórias', 'Kingston', 139.90, 179.90, 25, 0, 'assets/img/produtos/15-fury-8gb-ddr4.svg', 1, 4.80, 340),
(16, 'Memória Kingston Fury Beast 16GB DDR4 3200MHz', '16GB DDR4 para multitarefa e jogos, com XMP 2.0 e dissipador de alumínio de baixo perfil.', 'Memórias', 'Kingston', 239.90, 299.90, 20, 1, 'assets/img/produtos/16-fury-16gb-ddr4.svg', 1, 4.90, 410),
(17, 'Memória Corsair Vengeance 32GB (2x16) DDR4 3600MHz', 'Kit dual channel de 32GB com 3600MHz, ideal para edição, streaming e jogos pesados.', 'Memórias', 'Corsair', 549.90, 649.90, 9, 0, 'assets/img/produtos/17-vengeance-32gb.svg', 1, 4.80, 87),
(18, 'Memória Kingston Fury Beast 16GB DDR5 5600MHz', '16GB DDR5 de alta frequência para plataformas Intel 12ª/13ª e AMD AM5.', 'Memórias', 'Kingston', 399.90, 479.90, 12, 0, 'assets/img/produtos/18-fury-16gb-ddr5.svg', 1, 4.70, 66),
(19, 'SSD Kingston A400 240GB SATA', 'SSD SATA de 240GB para acelerar a inicialização do sistema e reduzir o tempo de carregamento.', 'Armazenamento', 'Kingston', 149.90, 189.90, 30, 0, 'assets/img/produtos/19-a400-240gb.svg', 1, 4.60, 520),
(20, 'SSD Kingston NV2 500GB NVMe', 'SSD NVMe PCIe 4.0 de 500GB com leituras de até 3500MB/s para resposta imediata.', 'Armazenamento', 'Kingston', 259.90, 319.90, 18, 0, 'assets/img/produtos/20-nv2-500gb.svg', 1, 4.80, 230),
(21, 'SSD Samsung 980 1TB NVMe', '1TB NVMe PCIe 3.0 com até 3500MB/s, ideal para jogos, projetos e armazenamento rápido.', 'Armazenamento', 'Samsung', 479.90, 549.90, 10, 1, 'assets/img/produtos/21-samsung-980-1tb.svg', 1, 4.90, 160),
(22, 'HD Seagate Barracuda 2TB 7200RPM', 'HD de 2TB e 7200RPM para armazenamento em massa de arquivos, fotos e bibliotecas de jogos.', 'Armazenamento', 'Seagate', 399.90, 459.90, 8, 0, 'assets/img/produtos/22-barracuda-2tb.svg', 1, 4.50, 75),
(23, 'Fonte Corsair CV550 550W 80 Plus Bronze', 'Fonte de 550W com certificação 80 Plus Bronze, proteções elétricas e ventoinha silenciosa.', 'Fontes', 'Corsair', 329.90, 389.90, 11, 0, 'assets/img/produtos/23-corsair-cv550.svg', 1, 4.70, 190),
(24, 'Fonte Cooler Master MWE 650W 80 Plus Bronze', '650W com PFC ativo, cabos sleeved e certificação 80 Plus Bronze para setups intermediários.', 'Fontes', 'Cooler Master', 399.90, 469.90, 7, 0, 'assets/img/produtos/24-mwe-650w.svg', 1, 4.60, 88),
(25, 'Fonte XPG Core Reactor 750W 80 Plus Gold', '750W totalmente modular, 80 Plus Gold e componentes japoneses para máxima eficiência.', 'Fontes', 'XPG', 649.90, 749.90, 5, 1, 'assets/img/produtos/25-xpg-750w.svg', 1, 4.90, 64),
(26, 'Gabinete Redragon Wideload Lite Mid Tower', 'Mid Tower com lateral de vidro temperado, suporte a water cooler de 240mm e três fans inclusos.', 'Gabinetes', 'Redragon', 249.90, 299.90, 9, 0, 'assets/img/produtos/26-wideload-lite.svg', 1, 4.50, 72),
(27, 'Gabinete Lian Li Lancool 216 RGB', 'Mid Tower premium com dois fans frontais de 160mm, vidro temperado e excelente fluxo de ar.', 'Gabinetes', 'Lian Li', 599.90, 699.90, 6, 1, 'assets/img/produtos/27-lancool-216.svg', 1, 4.80, 51),
(28, 'Gabinete Cooler Master NR200P Mini ITX', 'Gabinete compacto Mini ITX com suporte a water cooler, lateral de vidro e ótimo aproveitamento interno.', 'Gabinetes', 'Cooler Master', 549.90, 629.90, 4, 0, 'assets/img/produtos/28-nr200p.svg', 1, 4.70, 39),
(29, 'Air Cooler DeepCool AK400', 'Cooler torre com quatro heatpipes, ventoinha de 120mm e desempenho silencioso para CPUs de até 220W.', 'Coolers', 'DeepCool', 179.90, 219.90, 14, 0, 'assets/img/produtos/29-ak400.svg', 1, 4.80, 112),
(30, 'Water Cooler DeepCool LT520 240mm', 'Radiador de 240mm com bomba de alto desempenho e iluminação ARGB para CPUs exigentes.', 'Coolers', 'DeepCool', 499.90, 579.90, 6, 0, 'assets/img/produtos/30-lt520.svg', 1, 4.70, 48),
(31, 'Monitor LG 21.5" 75Hz Full HD', 'Monitor de 21,5 polegadas Full HD com painel IPS, 75Hz e conexões HDMI/VGA para escritório e estudo.', 'Monitores', 'LG', 699.90, 799.90, 8, 0, 'assets/img/produtos/31-lg-215.svg', 1, 4.50, 130),
(32, 'Monitor AOC 24" 144Hz Full HD', 'Monitor gamer de 24 polegadas, 144Hz, 1ms e FreeSync para jogos competitivos.', 'Monitores', 'AOC', 999.90, 1149.90, 7, 1, 'assets/img/produtos/32-aoc-24-144hz.svg', 1, 4.80, 205),
(33, 'Monitor Samsung Odyssey G4 27" 165Hz', '27 polegadas Full HD, 165Hz, IPS e G-Sync compatível para máxima fluidez.', 'Monitores', 'Samsung', 1899.90, 2199.90, 4, 0, 'assets/img/produtos/33-odyssey-g4.svg', 1, 4.90, 73),
(34, 'Teclado Mecânico Redragon Kumara RGB', 'Teclado mecânico ABNT2 com switches Outemu Red, iluminação RGB e estrutura resistente.', 'Periféricos', 'Redragon', 249.90, 299.90, 12, 0, 'assets/img/produtos/34-kumara-rgb.svg', 1, 4.70, 310),
(35, 'Mouse Gamer Logitech G203 RGB', 'Mouse com sensor de 8000 DPI, seis botões programáveis e iluminação RGB Lightsync.', 'Periféricos', 'Logitech', 149.90, 179.90, 20, 0, 'assets/img/produtos/35-g203.svg', 1, 4.80, 420),
(36, 'Headset Gamer HyperX Cloud Stinger 2', 'Headset com som surround, microfone com cancelamento de ruído e espuma memory foam.', 'Periféricos', 'HyperX', 299.90, 349.90, 10, 1, 'assets/img/produtos/36-cloud-stinger-2.svg', 1, 4.70, 260),
(37, 'Mousepad Gamer Redragon Piscis GG', 'Mousepad grande com superfície speed, base antiderrapante e bordas costuradas.', 'Periféricos', 'Redragon', 59.90, 79.90, 35, 0, 'assets/img/produtos/37-piscis-gg.svg', 1, 4.60, 180),
(38, 'Webcam Logitech C920s Full HD', 'Webcam Full HD 1080p com foco automático, microfone duplo e tampa de privacidade.', 'Periféricos', 'Logitech', 449.90, 499.90, 6, 0, 'assets/img/produtos/38-c920s.svg', 1, 4.80, 95),
(39, 'Notebook Lenovo IdeaPad 1 Athlon 8GB 256GB', 'Notebook para estudo e escritório com tela Full HD de 15,6", 8GB de RAM e SSD de 256GB.', 'Notebooks', 'Lenovo', 2799.90, 3199.90, 5, 0, 'assets/img/produtos/39-ideapad-1.svg', 1, 4.40, 88),
(40, 'Notebook Gamer Acer Nitro V15 i5 RTX 4050', 'Notebook gamer com Intel Core i5, RTX 4050 6GB, 16GB DDR5, SSD 512GB e tela 144Hz.', 'Notebooks', 'Acer', 6499.90, 7199.90, 3, 1, 'assets/img/produtos/40-nitro-v15.svg', 1, 4.80, 42),
(41, 'Smartphone Samsung Galaxy A15 128GB', 'Tela Super AMOLED de 6,5", 128GB de armazenamento, câmera de 50MP e bateria de 5000mAh.', 'Smartphones', 'Samsung', 1199.90, 1399.90, 10, 0, 'assets/img/produtos/41-galaxy-a15.svg', 1, 4.60, 210),
(42, 'Smartphone Motorola Edge 50 256GB', 'Tela pOLED de 6,7", 256GB, câmera de 50MP com OIS e carregamento TurboPower.', 'Smartphones', 'Motorola', 2499.90, 2899.90, 6, 1, 'assets/img/produtos/42-edge-50.svg', 1, 4.80, 97),
(43, 'Smartphone Samsung Galaxy S24 256GB', 'Topo de linha com tela Dynamic AMOLED 120Hz, 256GB, câmera tripla e recursos de IA.', 'Smartphones', 'Samsung', 5199.90, 5799.90, 4, 0, 'assets/img/produtos/43-galaxy-s24.svg', 1, 4.90, 60),
(44, 'PC Escritório NexTech Office i3 8GB 256GB', 'Computador pronto para escritório com Intel Core i3, 8GB de RAM, SSD 256GB e Windows 11 instalado.', 'PCs Prontos', 'NexTech', 2299.90, 2599.90, 7, 0, 'assets/img/produtos/44-pc-office.svg', 1, 4.50, 55),
(45, 'PC Intermediário NexTech Home Ryzen 5 16GB 512GB', 'PC versátil para home office, estudos e lazer com Ryzen 5, 16GB DDR4 e SSD NVMe de 512GB.', 'PCs Prontos', 'NexTech', 3499.90, 3899.90, 5, 1, 'assets/img/produtos/45-pc-home.svg', 1, 4.70, 48),
(46, 'PC Gamer NexTech Storm RTX 4060 16GB 1TB', 'PC gamer com Ryzen 5 5600, RTX 4060 8GB, 16GB DDR4, SSD NVMe 1TB e gabinete com RGB.', 'PCs Prontos', 'NexTech', 6499.90, 7199.90, 3, 1, 'assets/img/produtos/46-pc-storm.svg', 1, 4.90, 38),
(47, 'PC Lazer NexTech Play Ryzen 5 16GB 512GB', 'PC para jogos casuais, streaming e multimídia com Ryzen 5, 16GB e SSD de 512GB.', 'PCs Prontos', 'NexTech', 3999.90, 4399.90, 4, 0, 'assets/img/produtos/47-pc-play.svg', 1, 4.60, 29),
(48, 'Instalação do Windows 11 + Drivers', 'Instalação limpa do Windows 11, ativação, drivers atualizados e configuração inicial.', 'Serviços', 'NexTech', 149.90, 199.90, 999, 0, 'assets/img/produtos/48-instalacao-windows.svg', 1, 4.90, 180),
(49, 'Formatação e Otimização de PC', 'Backup dos arquivos, formatação, instalação de programas essenciais e otimização de desempenho.', 'Serviços', 'NexTech', 99.90, 129.90, 999, 0, 'assets/img/produtos/49-formatacao.svg', 1, 4.80, 240),
(50, 'Montagem de PC + Teste de Estresse', 'Montagem completa, cable management, instalação de sistema e teste de estabilidade por 24h.', 'Serviços', 'NexTech', 199.90, 249.90, 999, 1, 'assets/img/produtos/50-montagem.svg', 1, 4.90, 150);

-- Consultas de teste
SELECT COUNT(*) AS total FROM produto;
SELECT * FROM produto ORDER BY id LIMIT 10;
SELECT * FROM produto WHERE categoria = 'Processadores';
SELECT * FROM produto WHERE preco BETWEEN 200 AND 700 ORDER BY preco ASC;
