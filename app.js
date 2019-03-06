// Requires (Librerias de terceros o personalizadas)

const express = require('express'); //Cargar la librería de express
const mongoose = require('mongoose');

// Inicializar variables
const app = express();

// Conección a la BD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', ( error, response ) => {
    
    if (error) throw error;
    console.log('Base de datos: \x1b[32m%s\x1b[0m','online');
    
});

// Rutas
app.get('/', (request, response, next) => {
    response.status(200).json({
        ok: true,
        message: 'Petición realizada correctamente'
    });
});

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m','online');
});
