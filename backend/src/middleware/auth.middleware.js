import { verifyToken } from "../services/jwt.service.js";

export const authMiddleware = (req, res, next) => {
    try {
        
        //obtenemos el token del header de la peticion
        const authHeader = req.headers.authorization;

        //validamos si el token se envio en la peticion
        if(!authHeader){
            return res.status(401).json({
                msj: 'token no proporcionado'
            })
        }

        //separamos el token
        const token = authHeader.split(' ')[1]

        //verificamos si esta el token
        const decode = verifyToken(token)

        if(!decode){
            return res.status(401).json({
                msj: 'token invalido o expirado'
            })
        }

        req.user = decode;
        next()
    } catch (error) {
        res.status(500).json({
            msj: 'error del servidor',
            error: error.message
        })
    }
}