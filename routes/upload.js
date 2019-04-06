const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const app = express();

const Usuario = require('../models/usuario');
const Medico = require('../models/medico');
const Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (request, response, next) => {

    let tipo = request.params.tipo;
    let id = request.params.id;

    // Tipos de coleccion
    let tiposValidos = ['hospitales','medicos','usuarios'];

    if ( tiposValidos.indexOf( tipo ) <0 ) {
        return response.status(400).json({
            ok: false,
            message: 'Tipo de colección no válida',
            errors: { message: 'La colección ingresada no es válida' }
        });
    }

    if ( !request.files ) {
        return response.status(400).json({
            ok: false,
            message: 'No seleccionó nada',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    let archivo = request.files.imagen;
    let nombreCortado = archivo.name.split('.');
    let extensionArchivo = nombreCortado[nombreCortado.length-1];

    // Extensiones aceptadas
    let extensionesValidas = ['png','jpg','gif','jpeg'];

    if ( extensionesValidas.indexOf( extensionArchivo ) < 0 ) {
        return response.status(400).json({
            ok: false,
            message: 'Extensión no válida',
            errors: { message: `Las extensiones válidas son ${extensionesValidas.join(', ')} ` }
        });
    }

    // Nombre de archivo personalizado
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    // Mover el archivo del temporal a un path
    let path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv( path, error => {
        if ( error ) {
            return response.status(500).json({
                ok: false,
                message: 'Error al mover el archivo',
                errors: error
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, response);

    });
});

const subirPorTipo = (tipo, id, nombreArchivo, response) => {

    if ( tipo === 'usuarios' ) {
        Usuario.findById( id, (error, usuario) => {

            if ( !usuario ) {
                return response.status(400).json({
                    ok: false,
                    message: 'El usuario no existe',
                    errors: { message: 'El usuario no existe' }
                });
            }

            let pathViejo = `./uploads/usuarios/${usuario.img}`;
            // Si existe elimina la imagen anterior
            if ( fs.existsSync(pathViejo) ) {
                fs.unlink( pathViejo );
            }

            usuario.img = nombreArchivo;
            usuario.save( (error, usuarioActualizado) => {

                if ( error ) {
                    return response.status(500).json({
                        ok: false,
                        message: 'Error al actualizar el usuario',
                        errors: error
                    });
                }

                usuarioActualizado.password = ':)';

                return response.status(200).json({
                    ok: true,
                    message: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });
        });
    }

    if ( tipo === 'medicos' ) {
        Medico.findById( id, (error, medico) => {

            if ( !medico ) {
                return response.status(400).json({
                    ok: false,
                    message: 'El médico no existe',
                    errors: { message: 'El médico no existe' }
                });
            }

            let pathViejo = `./uploads/medicos/${medico.img}`;
            // Si existe elimina la imagen anterior
            if ( fs.existsSync(pathViejo) ) {
                fs.unlink( pathViejo );
            }

            medico.img = nombreArchivo;
            medico.save( (error, medicoActualizado) => {

                if ( error ) {
                    return response.status(500).json({
                        ok: false,
                        message: 'Error al actualizar el médico',
                        errors: error
                    });
                }

                return response.status(200).json({
                    ok: true,
                    message: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });
            });
        });
    }

    if ( tipo === 'hospitales' ) {
        Hospital.findById( id, (error, hospital) => {

            if ( !hospital ) {
                return response.status(400).json({
                    ok: false,
                    message: 'El hospital no existe',
                    errors: { message: 'El hospital no existe' }
                });
            }

            let pathViejo = `./uploads/hospitales/${hospital.img}`;
            // Si existe elimina la imagen anterior
            if ( fs.existsSync(pathViejo) ) {
                fs.unlink( pathViejo );
            }

            hospital.img = nombreArchivo;
            hospital.save( (error, hospitalActualizado) => {

                if ( error ) {
                    return response.status(500).json({
                        ok: false,
                        message: 'Error al actualizar el hospital',
                        errors: error
                    });
                }

                return response.status(200).json({
                    ok: true,
                    message: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
            });
        });
    }

};

module.exports = app;
