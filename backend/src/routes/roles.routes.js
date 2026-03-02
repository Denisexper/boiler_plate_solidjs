import { Router } from 'express';
import { RoleController } from '../controllers/role.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { checkPermission } from '../middleware/role.middleware.js';
import { PERMISSIONS } from '../db/seedRoles.js';

const router = Router();
const controller = new RoleController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener todos los roles
router.get('/', checkPermission(PERMISSIONS.ROLES_READ), controller.getAll);

// Obtener permisos disponibles
router.get('/permissions', checkPermission(PERMISSIONS.ROLES_READ), controller.getPermissions);

// Obtener un rol
router.get('/:id', checkPermission(PERMISSIONS.ROLES_READ), controller.getOne);

// Crear rol
router.post('/', checkPermission(PERMISSIONS.ROLES_CREATE), controller.create);

// Actualizar rol
router.put('/:id', checkPermission(PERMISSIONS.ROLES_UPDATE), controller.update);

// Eliminar rol
router.delete('/:id', checkPermission(PERMISSIONS.ROLES_DELETE), controller.delete);

export default router;