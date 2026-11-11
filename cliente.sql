-- NexTech Informática - estrutura da tabela de clientes.
-- A criação também é feita automaticamente por migration.js.

CREATE TABLE IF NOT EXISTS cliente (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    cpf CHAR(14) NOT NULL,
    celular CHAR(14) NOT NULL,
    email VARCHAR(100) NOT NULL,
    senha VARCHAR(512) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_cliente_cpf (cpf),
    UNIQUE KEY uq_cliente_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cliente demo criado pela migration (senha criptografada com bcrypt):
-- email: demo@nextech.com
-- senha: demo1234
