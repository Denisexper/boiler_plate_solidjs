import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { checkPermission } from '../middleware/role.middleware.js';
import { logsReports, deleteLogs } from '../controllers/logs.controller.js';

const router = Router();

// rutas con metadata
const routes = [
    {
        method: 'GET',
        path: '/logs',
        permission: 'logs.read',
        description: 'Listar logs del sistema',
        handler: logsReports,
        middlewares: []
    },
    {
        method: 'DELETE',
        path: '/logs/:id',
        permission: 'logs.delete',
        description: 'Eliminar un log',
        handler: deleteLogs,
        middlewares: []
    }
];

//  registrar rutas automáticamente
routes.forEach(route => {
    const allMiddlewares = [
        authMiddleware,
        checkPermission(route.permission),
        ...route.middlewares
    ];

    router[route.method.toLowerCase()](
        route.path,
        ...allMiddlewares,
        route.handler
    );
});

//  exportar metadata para auto-discovery
export const logRoutes = routes;

//  exportar router para usar en server.js
export default router;