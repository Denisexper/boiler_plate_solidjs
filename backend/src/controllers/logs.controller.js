import mongoose, { mongo } from "mongoose";
import { Log } from "../models/logs.model.js";

export const logsReports = async (req, res) => {
    try {

        //obtemos la informacion por el body
        const { user, action, resource, startDate, endDate } = req.query; //query porque estamos obteniendo logs y no estamos creando ningun objeto

        //filtramos la data que enviaremos en el log
        const filter = {}

        if (user) filter.user = user;
        if (action) filter.action = action;
        if (resource) filter.resource = resource;
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate)
            if (endDate) filter.createdAt.$lte = new Date(endDate)
        }

        //buscamos la lista de los logs
        const logs = await Log.find(filter)
            .select('-__v') //eliminamos esta propiedad del objeto
            .populate('user', 'name email role')
            .populate('targetUser', 'name email role') //hacer el join con el usuario y nos muestre sus campos no solo el id
            .sort({ createdAt: -1 }) //ordenamos del mas reciente al mas viejo
            .limit(100); //limite de objetos de 100


        //respondemos con la data que nos manda mongo
        res.status(200).json({
            msj: logs.length === 0
                ? 'lista de logs vacia'
                : 'logs obtenidos correctamente',
            total: logs.length,
            data: logs


        })


    } catch (error) {

        res.status(500).json({
            msj: 'error obteniendo logs',
            error: error.message
        })
    }

}

//funcion para eliminar logs
export const deleteLogs = async (req, res) => {
    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                msj: 'el id del log no es valido'
            })
        }

        const logDeleted = await Log.findByIdAndDelete(id).select('-__v').populate('user', 'name email role') //populate nos trae el name, email y demas propiedades del usuario(es como un inner join)

        //validamos si encontro el usuario
        if (!logDeleted) {
            return res.status(404).json({
                msj: 'log no encontrado'
            })
        }

        res.status(200).json({
            msj: 'log eliminado correctamente',
            logDeleted: logDeleted
        })
    } catch (error) {
        console.log(error)

        res.status(500).json({
            msj: 'error de servidor'
        })
    }

}

// Obtener historial de cambios de un usuario específico
export const getUserHistory = async (req, res) => {
    try {
        const { userId } = req.params;

        // Obtener todos los logs donde este usuario fue afectado
        const logs = await Log.find({
            targetUser: userId,
            action: { $in: ['create', 'update', 'delete'] } // Solo cambios relevantes
        })
            .populate('user', 'name email')
            .populate('targetUser', 'name email')
            .sort({ createdAt: -1 }) // Más reciente primero
            .select('-__v');

        res.status(200).json({
            msj: 'Historial obtenido',
            total: logs.length,
            data: logs
        });
    } catch (error) {
        res.status(500).json({
            msj: 'Error obteniendo historial',
            error: error.message
        });
    }
};