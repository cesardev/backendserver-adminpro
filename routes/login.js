const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const Usuario = require('../models/usuario');
const SEED = require('../config/config').SEED;

app.post('/', ( request, response) => {

    let body = request.body;

    Usuario.findOne({ email: body.email }, ( error, usuarioBD ) => {


        if ( error ) {
            return response.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: error
            });
        }

        if ( !usuarioBD ) {
            return response.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas - email',
                errors: error
            });
        }

        if ( !bcrypt.compareSync( body.password, usuarioBD.password ) ) {
            return response.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas - password',
                errors: error
            });
        }

        // Crear un token
        usuarioBD.password = ':)';
        let token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); //4horas

        response.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token: token,
            id: usuarioBD.id
        });

    });

});


module.exports = app;
