const express = require('express');
const bcrypt = require('bcryptjs');
const app = express();
const Usuario = require('../models/usuario');

const jwt = require('jsonwebtoken');

const mdAutenticacion = require('../middlewares/autenticacion');

// Obtener todos los usuarios
app.get('/', (request, response, next) => {

    Usuario.find({ }, 'nombre email role img').exec( ( error, usuarios ) => {

        if ( error ) {
            return response.status(500).json({
                ok: false,
                message: 'Error cargando usuarios',
                errors: error
            });
        }

        response.status(200).json({
            ok: true,
            usuarios: usuarios
        });

    });
});

// Actualizar usuario
app.put('/:id', mdAutenticacion.verificaToken, (request, response) => {

    let id = request.params.id;
    let body = request.body;

    Usuario.findById( id, (error, usuario) => {

        if ( error ) {
            return response.status(500).json({
                ok: false,
                message: 'Ocurrió error al buscar el usuario por id',
                errors: error
            });
        }

        if ( !usuario ) {
            if ( error ) {
                return response.status(400).json({
                    ok: false,
                    message: `El usuario con el id ${id} no existe`,
                    errors: { message: 'No existe un usuario con ese ID' }
                });
            }
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save( ( error, usuarioGuardado ) => {
            if ( error ) {
                return response.status(400).json({
                    ok: false,
                    message: 'Error al actualizar usuario',
                    errors: error
                });
            }

            usuarioGuardado.password = ':)';

            response.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });

    });

});

// Crear un nuevo usuario
app.post('/', mdAutenticacion.verificaToken, (request, response) => {

    let body = request.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save( ( error, usuarioGuardado ) => {

        if ( error ) {
            return response.status(400).json({
                ok: false,
                message: 'Ocurrió error al crear el usuario',
                errors: error
            });
        }

        response.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: request.usuario
        });
    });


});

// Eliminar usuario por el id
app.delete('/:id', mdAutenticacion.verificaToken, ( request, response) => {

    let id = request.params.id;

    Usuario.findByIdAndRemove( id, (error, usuarioBorrado) => {

        if ( error ) {
            return response.status(500).json({
                ok: false,
                message: `Error al borrar usuario con el id: ${id}`,
                errors: error
            });
        }

        if ( !usuarioBorrado ) {
            return response.status(400).json({
                ok: false,
                message: `No existe usuario con el id: ${id}`,
                errors: { message: `No existe usuario con el id: ${id}` }
            });
        }

        response.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });

});

module.exports = app;
