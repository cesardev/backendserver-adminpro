const express = require('express');
const app = express();
const Medico = require('../models/medico');
const mdAutenticacion = require('../middlewares/autenticacion');

// Obtener todos los medicos
app.get('/', ( request, response ) => {

    let desde = request.query.desde || 0;
    desde = Number(desde);

    Medico.find({ })
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .populate('hospital')
    .exec( ( error, medicos ) => {

        if ( error ) {
            return response.status(500).json({
                ok: false,
                message: 'Ocurrió un error al querer obtener los médicos',
                errors: { error: 'Ocurrió un error al querer obtener los médicos' }
            });
        }

        Medico.count({}, ( error, conteo ) => {
            response.status(200).json({
                ok: true,
                total: conteo,
                medicos
            });
        });

    });

});

// Actualizar medico
app.put('/:id', mdAutenticacion.verificaToken, ( request, response ) => {
    
    let id = request.params.id;
    let body = request.body;

    Medico.findById( id, ( error, medico ) => {

        if ( error ) {
            return response.status(500).json({
                ok: false,
                message: 'Ocurrió error al buscar el medico por id',
                errors: error
            });
        }

        if ( !medico ) {
            if ( error ) {
                return response.status(400).json({
                    ok: false,
                    message: `El medico con el id ${id} no existe`,
                    errors: { message: `No existe un medico con el id: ${id}` }
                });
            }
        }

        medico.nombre = body.nombre;
        medico.hospital = body.hospital;
        medico.usuario = request.usuario._id;

        medico.save( ( error, medicoGuardado) => {
            if ( error ) {
                return response.status(400).json({
                    ok: false,
                    message: 'Error al actualizar el registro del médico',
                    errors: error
                });
            }

            response.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });

    });

});

// Crear medico
app.post('/', mdAutenticacion.verificaToken, ( request, response ) => {

    let body = request.body;

    let medico = new Medico({

        nombre: body.nombre,
        hospital: body.hospital,
        usuario: request.usuario._id

    });

    medico.save( ( error, medicoGuardado ) => {
    
        if ( error ) {
            return response.status(400).json({
                ok: false,
                message: 'Ocurrió un error al crear el registro del médico',
                errors: error
            });
        }

        response.status(201).json({
            ok: true,
            medico: medicoGuardado
        });

    });

});

// Eliminar medico por el id
app.delete('/:id', mdAutenticacion.verificaToken, ( request, response) => {

    let id = request.params.id;

    Medico.findByIdAndRemove( id, (error, medicoBorrado) => {

        if ( error ) {
            return response.status(500).json({
                ok: false,
                message: `Error al borrar el registro del médico con el id: ${id}`,
                errors: error
            });
        }

        if ( !medicoBorrado ) {
            return response.status(400).json({
                ok: false,
                message: `No existe registro de médico con el id: ${id}`,
                errors: { message: `No existe registro de médico con el id: ${id}` }
            });
        }

        response.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });

});


module.exports = app;
