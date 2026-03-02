import { Log } from "../models/logs.model.js";
import { userModel } from "../models/user.model.js";

export const logAction = (action, resource) => {
    return async (req, res, next) => {
        // Capturar info del usuario ANTES de la acción (para delete/update)
        let targetUser = null;
        let targetUserName = null;

        if (req.params.id && (action === 'update' || action === 'delete')) {
            try {
                const user = await userModel.findById(req.params.id);
                if (user) {
                    targetUser = user._id;
                    targetUserName = user.name;
                }
            } catch (error) {
                console.error('Error fetching target user:', error);
            }
        }

        const originalJson = res.json;
        
        res.json = async function(data) {
            // Crear log después de la respuesta
            if (req.user) {
                try {
                    const logData = {
                        user: req.user.id,
                        action,
                        resource,
                        details: `${req.method} ${req.originalUrl}`,
                        ipAddress: req.ip,
                        userAgent: req.get('user-agent'),
                        statusCode: res.statusCode
                    };

                    // Para create: usar el nombre del usuario creado desde la respuesta
                    if (action === 'create' && data.newUser) {
                        logData.targetUser = data.newUser.id;
                        logData.targetUserName = data.newUser.name;
                    }
                    // Para update/delete: usar el capturado antes
                    else if (targetUser) {
                        logData.targetUser = targetUser;
                        logData.targetUserName = targetUserName;
                    }

                    await Log.create(logData);
                } catch (error) {
                    console.error('Error creating log:', error);
                }
            }
            
            return originalJson.call(this, data);
        };
        
        next();
    };
};