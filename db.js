// Conexão com o MySQL usando as variáveis do arquivo .env.
// npm i mysql2
const mysql = require("mysql2/promise")
require("dotenv").config({ quiet: true })

const pool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "nextech",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: "utf8mb4",
    decimalNumbers: true
})

module.exports = Object.freeze({
    pool: pool
})
