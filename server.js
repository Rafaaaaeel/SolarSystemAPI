// require("dotenv").config()

const express = require("express")
const app = express()
const solarSystemRouter = require("./Routes/solarSystemRouter")

app.use(express.json()) 
app.use("/solarSystem", solarSystemRouter)

app.listen(3000, () => console.log("Server started on port 3000"))