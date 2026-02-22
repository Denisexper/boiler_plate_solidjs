import { Router } from 'express'
import { userController } from '../controllers/user.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { checkRole } from '../middleware/role.middleware.js'
import { logAction } from '../middleware/logger.middleware.js'
import { logsReports, deleteLogs } from '../controllers/logs.controller.js'

const router = Router()

const controller = new userController()

//ruta del login y register (rutas publicas)
router.post('/login', controller.login)
router.post('/register', controller.register)


//rutas solo para administradores
//obtener todos los usuarios
router.get('/users', authMiddleware, checkRole('admin'), controller.getAll)

//crear un usuario (administradores y moderator)
router.post('/users', authMiddleware, logAction('create', 'users'), controller.createUser)

//rutas portegidas obtener un usuario por id(authenticacion-no check-role para estas ruta)
router.get('/users/:id', authMiddleware, logAction('read', 'users'), controller.getUser)

//actualizar un usuario por el id
router.put('/users/:id', authMiddleware, checkRole('admin'), logAction('update', 'users'), controller.updateUser)
//eliminar un usuario por el id
router.delete('/users/:id', authMiddleware, checkRole('admin'), logAction('delete', 'users'),controller.deleteUser)

//ruta para obtener bitacoras de usuarios
router.get('/logs', authMiddleware, checkRole('admin', 'moderator'), logsReports)

//ruta para eliminar un log por el id
router.delete('/logs/:id', authMiddleware, checkRole('admin', 'moderator'), deleteLogs)

//exportamos el router
export default router;