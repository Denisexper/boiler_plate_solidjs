import { Router } from 'express'
import { userController } from '../controllers/user.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { checkPermission } from '../middleware/role.middleware.js'
import { logAction } from '../middleware/logger.middleware.js'
import { logsReports, deleteLogs } from '../controllers/logs.controller.js' 
import { PERMISSIONS } from '../db/seedRoles.js'

const router = Router()
const controller = new userController()

//ruta del login y register (rutas publicas)
router.post('/login', controller.login)
router.post('/register', controller.register)

//ruta protegida logout
router.post('/logout', authMiddleware, controller.logout)

router.get('/me', authMiddleware, controller.getMe)

// ✅ RUTAS CON PERMISOS
router.get('/users', authMiddleware, checkPermission(PERMISSIONS.USERS_READ), controller.getAll)

router.post('/users', authMiddleware, checkPermission(PERMISSIONS.USERS_CREATE), logAction('create', 'users'), controller.createUser)

router.get('/users/:id', authMiddleware, checkPermission(PERMISSIONS.USERS_READ), logAction('read', 'users'), controller.getUser)

router.put('/users/:id', authMiddleware, checkPermission(PERMISSIONS.USERS_UPDATE), logAction('update', 'users'), controller.updateUser)

router.delete('/users/:id', authMiddleware, checkPermission(PERMISSIONS.USERS_DELETE), logAction('delete', 'users'), controller.deleteUser)

router.get('/logs', authMiddleware, checkPermission(PERMISSIONS.LOGS_READ), logsReports)

router.delete('/logs/:id', authMiddleware, checkPermission(PERMISSIONS.LOGS_DELETE), deleteLogs)

export default router;