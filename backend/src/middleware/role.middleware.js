
export const checkRole = (...alloweRoles) => {

    return (req, res, next) => {

        if(!req.user){

            return res.status(401).json({
                msj: 'no autenticado'
            })
        }

        if(!alloweRoles.includes(req.user.role)) {

            return res.status(403).json({

                msj: 'no tienes permisos para acceder a este recurso'
            })
        }

        next()
    }
}