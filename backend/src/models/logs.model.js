import { Schema, model } from 'mongoose'

//eschema para la bitacora (logs que se requiere)
const logSchema = new Schema ({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'userModel'
    },
    action: {
        type: String,
        enum: ['login', 'logout', 'create', 'update', 'delete', 'read']
    },
    resource: {
        type: String
    },
    //Usuario afectado por la acción qeu se le hizo
    targetUser: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        default: null
    },
    targetUserName: {
        type: String,
        default: null
    },
    details: {
        type: String
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    statusCode: {
        type: Number
    }
}, { timestamps: true });

export const Log = model('Log', logSchema)