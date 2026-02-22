import express from "express"
import { port } from "./services/Enviroments.service.js"
import { mongoConnect } from "./db/config.js"
import morgan from "morgan"
import userRoutes from "./routes/users.routes.js"
import cors from "cors"

//configurar servidor
const server = express()

//configuracion server con json
server.use(express.json())

//configuracion de cors
server.use(cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

//configuramos morgan (ver las peticiones http en la terminal)
server.use(morgan('dev'))

//levantar servidor
server.listen(port, () => {

    console.log(`server in port ${port}`);
    
})

//configuracion base de datos
mongoConnect()

//inicializamos las rutas
server.use('/api', userRoutes)

