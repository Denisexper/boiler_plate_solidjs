import express from "express"
import { port } from "./services/Enviroments.service.js"
import { mongoConnect } from "./db/config.js"
import morgan from "morgan"
import userRoutes from "./routes/users.routes.js"
import rolesRoutes from "./routes/roles.routes.js"
import cors from "cors"
import { seedRoles } from "./db/seedRoles.js"

//configurar servidor
const server = express()

//configuracion server con json
server.use(express.json())

//configuracion de cors
server.use(cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

//configuramos morgan (ver las peticiones http en la terminal)
server.use(morgan('dev'))

//levantar servidor
server.listen(port, () => {

    console.log(`server in port ${port}`);
    
})

//configuracion base de datos
mongoConnect().then(async () => {
    await seedRoles()
})

//inicializamos las rutas
server.use('/api', userRoutes)

//roles routes
server.use("/api/roles", rolesRoutes)

