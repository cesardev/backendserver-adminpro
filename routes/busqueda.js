const express = require('express');

const app = express();

const Hospital = require('../models/hospital');
const Medico = require('../models/medico');
const Usuario = require('../models/usuario');

// Búsqueda específica
app.get('/coleccion/:tabla/:busqueda', (request, response) => {

    let busqueda = request.params.busqueda;
    let tabla = request.params.tabla;
    let regex = new RegExp( busqueda, 'i');
    let promesa;

    switch ( tabla ) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;
        default:
            return response.status(400).json({
                ok: false,
                mensaje: 'Los tipos de búsqueda solo son: usuarios, médicos y hospitales',
                error: { message: 'Tipo de tabla/coleccion no válido' }
            });
    }

    promesa.then( data => {

        response.status(200).json({
            ok: true,
            [tabla]: data
        });

    });

});

// Búsqueda general
app.get('/todo/:busqueda', (request, response, next) => {

    let busqueda = request.params.busqueda;
    let regex = new RegExp( busqueda, 'i');

    Promise.all([
        buscarHospitales( busqueda, regex ),
        buscarMedicos( busqueda, regex ),
        buscarUsuarios( busqueda, regex )
    ])
    .then( respuestas => {

        response.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });

    });

});

buscarHospitales = ( busqueda, regex ) => {

    return new Promise( ( resolve, reject) => {

        Hospital.find({ nombre: regex})
        .populate( 'usuario', 'nombre email role' )
        .exec( ( error, hospitales) => {

            if ( error ) { reject('Error al cargar hospitales', error); }
            else { resolve( hospitales ); }
    
        });

    });

};

buscarMedicos = ( busqueda, regex ) => {

    return new Promise( ( resolve, reject) => {

        Medico.find({ nombre: regex})
        .populate( 'usuario', 'nombre email role' )
        .populate( 'hospital' )
        .exec(( error, medicos) => {

            if ( error ) { reject('Error al cargar hospitales', error); }
            else { resolve( medicos ); }
    
        });

    });

};

buscarUsuarios = ( busqueda, regex ) => {

    return new Promise( ( resolve, reject) => {

        Usuario.find({ }, 'nombre email role')
        .or([{ 'nombre': regex }, { 'email': regex }])
        .exec(( error, usuarios ) => {

            if ( error ) { reject('Error al cargar usuarios'); }
            else { resolve( usuarios ); }

        });

    });

};

module.exports = app;
