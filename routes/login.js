const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const Usuario = require('../models/usuario');
const SEED = require('../config/config').SEED;

// Google
const CLIENT_ID = require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// AUTENTICACIÓN CON GOOGLE
verify = async token => {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
};
  

app.post('/google', async ( request, response ) => {

    let token = request.body.token;
    let googleUser = await verify(token)
        .catch( e => {
            return response.status(403).json({
                ok: false,
                mensaje: 'Token no válido'
            });
        });

    Usuario.findOne({ email: googleUser.email }, ( error, usuarioDB ) => {

        if ( error ) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: error
            });
        }

        if ( usuarioDB ) {
            
            if ( !usuarioDB.google ) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticación normal'
                });
            } else {
                let token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //4horas

                response.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB.id
                });
            }

        } else {

            // EL usuario no existe hay que crearlo
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)'; 

            usuario.save( (error, usuarioDB) => {

                let token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //4horas

                response.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB.id
                });

            });
        }

    });

});

// AUTENTICACIÓN NORMAL
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
