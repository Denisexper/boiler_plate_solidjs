import { userModel } from "../models/user.model.js";
import bcrypt from 'bcrypt'
import { generateToken } from "../services/jwt.service.js";
import mongoose from "mongoose";

export class userController {


    //register
    async register (req, res) {

        try {
            
            const { name, email, password, role } = req.body;

            //verificamos si el usuario ya esta en uso
            const userExist = await userModel.findOne({ email });

            if(userExist){
                return res.status(400).json({
                    msj: 'El email ya esta en uso'
                })
            }

            //hasheamos la contraseña
            const hasPassword = await bcrypt.hash(password, 10)

            //creamos el nuevo usuario
            const newUser = await userModel.create({
                name,
                email,
                password: hasPassword,
                role: role || 'user'
            })

            //generamos el token
            const token = generateToken({
                id: newUser._id,
                email: newUser.email,
                role: newUser.role
            })

            res.status(201).json({
                msj: 'usuario registrado exitosamente',
                token,
                newUser: { //solo enviamos la informacion necesaria
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role
                }
            })
        } catch (error) {
            
            res.status(500).json({
                msj: 'error al registrar el usuario',
                error: error.message
            })
        }
    }

    //login
    async login (req, res) {
        try {
            
            const { email, password } = req.body;

            //buscar el usuario que intenta logear
            const user = await userModel.findOne({ email })
            if(!user){
                return res.status(401).json({
                    msj: 'credenciales invalidas'
                })
            }

            //verificar la contraseña incriptada
            const isvalidPass = await bcrypt.compare(password, user.password)
            if(!isvalidPass){
                return res.status(401).json({
                    msj: 'credenciales invalidas'
                })
            }

            //actualizar ultimo login
            user.lastLogin = new Date();
            await user.save();

            //generamos el token
            const token = generateToken({
                id: user._id,
                email: user.email,
                role: user.role
            })

            res.status(200).json({
                msj: 'Login exitoso',
                token,
                user: { //solo enviamos la informacion necesaria y no todo el objeto de mongo
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            })


        } catch (error) {
            
            res.status(500).json({
                msj: 'error en el login',
                error: error.message
            })
        }
    }

    //crear un usuario, ruta protegida para admins
    async createUser (req, res) {
        try {
            
            const { name, email, password, role } = req.body;

            //buscamos si el email ya esta en uso
            const emailExis = await userModel.findOne({ email })

            //validamos
            if(emailExis){
                return res.status(400).json({
                    msj: 'email ya esta en uso'
                })
            }

            //hashear password
            const hasPassword = await bcrypt.hash(password, 10)

            //crear el nuevo usuario
            const newUser = await userModel.create({
                name,
                email,
                password: hasPassword,
                role: role || 'user'
            })

            //generamos el token
            const token = generateToken({
                id: newUser._id,
                email: newUser.email,
                role: newUser.role
            })

            //respondemos la peticion
            res.status(201).json({
                msj: 'user creado exitosamente',
                token,
                newUser: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role
                }
            })
        } catch (error) {
            console.error(error)
            res.status(500).json({
                msj: 'error de servidor',
                error: error.message
            })
        }
    }

    //obtener un usuario por id
    async getUser (req, res) {

        const { id } = req.params;

        try {
            
            const response = await userModel.findById(id)

            if(!response){
                return res.status(404).json({
                    msj: 'usuario no encontrado'
                })
            }

            res.status(200).json({
                msj: 'user encontrado',
                data: response
            })
        } catch (error) {
            
            res.status(500).json({
                msj: 'error del servidor',
                error: error.message
            })
        }
    }

    //obtener todos los usuarios
    async getAll (req, res) {

        try {
            
            //buscamos todos los registros en la db
            const response = await userModel.find()
                .select('-passowrd') //para no mostrar la password
                .sort({ createdAt: -1}) //los ordenamos del mas reciente al mas viejo

            //respondemos la peticion
            res.status(200).json({
                msj: response.length === 0
                    ? 'lista de usuarios vacia'
                    : 'usuarios obtenidos correctamente',
                total: response.length, //paginacion
                data: response
            })
        } catch (error) {
            
            res.status(500).json({
                msj: 'error del servidor',
                error: error.message
            })
        }
    }

    //actualizar un usuario por id

    async updateUser (req, res) {
        try {
            
            //obtenemos el id de los parametros
            const { id } = req.params;

            //obtenemos los nuevos campos del body
            const { name, email, password, role } = req.body;

            //validamos si es un id valido de mongodb
            if(!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    msj: 'Id no valido'
                })
            }

            //buscamos si el usuario existe
            const user = await userModel.findById(id)

            if(!user) {
                return res.status(404).json({
                    msj: 'usuario no encontrado'
                })
            }

            //verificamos si el email ya existe (solo si va en la petion)
            if(email && email !== user.email) {
                const emailExist = await userModel.findOne({ email })
                if(emailExist) {
                    return res.status(400).json({
                        msj: 'el email ya esta en uso'
                    })
                }
            }

            //creamos un objeto con los campos ya validados y listos para actulializar

            const rightData = {}

            if(name) rightData.name = name
            if(email) rightData.email = email

            // validar y hashear la contraseña nueva
            if(password) {
                if(password.length < 6) {
                    return res.status(400).json({
                        msj: 'la contraseña debe tener al menos 6 caracteres'
                    })
                }

                rightData.password = await bcrypt.hash(password, 10)
            }

            //solo permitir actualizar si el usuario actual es admin
            if(role) {
                if(req.user.role !== 'admin') {
                    return res.status(403).json({
                        msj: 'no tienes permiso para cambiar roles'
                    })
                }

                rightData.role = role;
            }

            //actualizar usuario

            const updateUser = await userModel.findByIdAndUpdate(
                id,
                rightData,
                {
                    new: true, runValidators: true //para ejecutar las validaciones que configuramos en el Schema que creamos
                }
            )

            //si se crea correctamente responsemos
            res.status(200).json({
                msj: 'usuario actualizado correctamente',
                user: {
                    id: updateUser._id,
                    name: updateUser.name,
                    email: updateUser.email,
                    role: updateUser.role
                }
                
            })
        } catch (error) {
            
            res.status(500).json({
                msj: 'error actualizando usuario',
                error: error.message
            })
        }
    }

    //eliminar usuarios
    async deleteUser (req, res) {
        try {
            
            //obtenemos id de los parametros de la url
            const { id } = req.params;

            //verificamos si el id de mongo es valido
            if(!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    msj: 'el id no es valido'
                })
            }
            //verificamos que tenga rol permitido para eliminar usuarios
            if(req.user.role !== 'admin') {

                return res.status(403).json({

                    msj: 'no tienes permisos para eliminar usuarios'
                })
            }

            //evitamos que el admin se suicide
            if(id === req.user.id){

                return res.status(400).json({

                    msj: 'no puedes eliminar tu propia cuenta'
                })
            }
            //eliminar el usuario por el id
            const deleteUser = await userModel.findByIdAndDelete(id)

            //validamos si se encontro el usuario
            if(!deleteUser){
                return res.status(404).json({
                    msj: 'usuario no encontrado'
                })
            }
            //respondemos la peticion
            res.status(200).json({
                msj: 'usuario eliminado correctamente',
                deleteUser: {
                    id: deleteUser._id,
                    name: deleteUser.name,
                    email: deleteUser.email,
                    role: deleteUser.role

                }
            })
        } catch (error) {
            
            res.status(500).json({
                msj: 'error eliminando usuario',
                error: error.message
            })
        }
    }

    
}