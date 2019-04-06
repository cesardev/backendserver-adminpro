const express = require('express');
const app = express();
const Hospital = require('../models/hospital');
const mdAutenticacion = require('../middlewares/autenticacion');

// Obtener todos los hospitales
app.get('/', ( request, response ) => {

    let desde = request.query.desde || 0;
    desde = Number(desde);

    Hospital.find({ })
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .exec( (error, hospitales) => {

        if ( error ) {
            return response.status(500).json({
                ok: false,
                message: 'Error cargando los hospitales',
                errors: { error:'Error cargando los hospitales' }
            });
        }

        Hospital.count({}, ( error, conteo ) => {
            response.status(200).json({
                ok: true,
                total: conteo,
                hospitales
            });
        });

    });

});

// Actualizar hospital
app.put('/:id', mdAutenticacion.verificaToken, ( request, response) => {

    let id = request.params.id;
    let body = request.body;

    Hospital.findById( id, ( error, hospital ) => {

        if ( error ) {
            return response.status(500).json({
                ok: false,
                message: 'Ocurrió error al buscar el usuario por id',
                errors: error
            });
        }

        if ( !hospital ) {
            if ( error ) {
                return response.status(400).json({
                    ok: false,
                    message: `El hospital con el id ${id} no existe`,
                    errors: { message: `No existe un hospital con el id: ${id}` }
                });
            }
        }

        hospital.nombre = body.nombre;
        hospital.usuario = request.usuario._id;

        hospital.save( ( error, hospitalGuardado) => {
            if ( error ) {
                return response.status(400).json({
                    ok: false,
                    message: 'Error al actualizar hospital',
                    errors: error
                });
            }

            response.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });
    });

});

// Crear hospital
app.post('/', mdAutenticacion.verificaToken, ( request, response ) => {

    let body = request.body;

    let hospital = new Hospital({

        nombre: body.nombre,
        usuario: request.usuario._id

    });

    hospital.save( ( error, hospitalGuardado ) => {
    
        if ( error ) {
            return response.status(400).json({
                ok: false,
                message: 'Ocurrió un error al crear el hospital',
                errors: error
            });
        }

        response.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });

    });

});

// Eliminar hospital por el id
app.delete('/:id', mdAutenticacion.verificaToken, ( request, response) => {

    let id = request.params.id;

    Hospital.findByIdAndRemove( id, (error, hospitalBorrado) => {

        if ( error ) {
            return response.status(500).json({
                ok: false,
                message: `Error al borrar hospital con el id: ${id}`,
                errors: error
            });
        }

        if ( !hospitalBorrado ) {
            return response.status(400).json({
                ok: false,
                message: `No existe hospital con el id: ${id}`,
                errors: { message: `No existe hospital con el id: ${id}` }
            });
        }

        response.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });

});

module.exports = app;
