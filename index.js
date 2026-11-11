const dotenv = require("dotenv")
dotenv.config({ quiet: true })

const app = require("./app")
const port = Number(process.env.API_PORT || 3000)

const servidor = app.listen(port, () => {
    console.log("=================================================")
    console.log(" NexTech Informática - API + Loja")
    console.log(" http://localhost:" + port)
    console.log("=================================================")
})

servidor.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
        console.error("A porta " + port + " já está em uso.")
    } else {
        console.error(error)
    }
    process.exit(1)
})
