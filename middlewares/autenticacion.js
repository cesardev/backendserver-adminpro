const jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;

// Verificar token
exports.verificaToken = function(request, response, next) {

    let token = request.query.token;

    jwt.verify( token, SEED, ( error, decoded ) => {

        if ( error ) {
            return response.status(401).json({
                ok: false,
                message: 'Token incorrecto',
                errors: error
            });
        }

        request.usuario = decoded.usuario;

        next();

        // response.status(200).json({
        //     ok: true,
        //     decoded: decoded
        // });

    });

};
