// middleware/logger.middleware.js
import { Log } from "../models/logs.model.js";

export const logAction = (action, resource) => {
    return async (req, res, next) => {
        const originalSend = res.send;
        
        res.send = async function(data) {
            // Crear log después de la respuesta
            if (req.user) {
                try {
                    await Log.create({
                        user: req.user.id,
                        action,
                        resource,
                        resourceId: req.params.id || null,
                        details: `${req.method} ${req.originalUrl}`,
                        ipAddress: req.ip,
                        userAgent: req.get('user-agent'),
                        statusCode: res.statusCode
                    });
                } catch (error) {
                    console.error('Error creating log:', error);
                }
            }
            
            originalSend.call(this, data);
        };
        
        next();
    };
};