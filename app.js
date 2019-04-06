// Requires (Librerias de terceros o personalizadas)

const express = require('express'); //Cargar la librería de express
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Inicializar variables
const app = express();

// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Importar rutas
const appRoutes = require('./routes/app');
const usuarioRoutes = require('./routes/usuario');
const loginRoutes = require('./routes/login');
const hospitalRoutes = require('./routes/hospital');
const medicoRoutes = require('./routes/medico');
const busquedaRoutes = require('./routes/busqueda');
const uploadRoutes = require('./routes/upload');
const imagenesRoutes = require('./routes/imagenes');

// Conección a la BD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', ( error, response ) => {
    
    if (error) throw error;
    console.log('Base de datos: \x1b[32m%s\x1b[0m','online');
    
});

// Server index config
// const serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'));
// app.use('/uploads', serveIndex(__dirname + '/uploads'));

// Rutas (Middelware)
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/imagen', imagenesRoutes);

// Esta siempre tiene que ser la última ruta
app.use('/', appRoutes);

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m','online');
});
