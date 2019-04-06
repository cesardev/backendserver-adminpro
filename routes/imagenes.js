const express = require('express');
const app = express();

const path = require('path');
const fs = require('fs');

app.get('/:tipo/:img', (request, response, next) => {

    let tipo = request.params.tipo;
    let img = request.params.img;

    let pathImagen = path.resolve( __dirname, `../uploads/${tipo}/${img}` );

    if ( fs.existsSync( pathImagen ) ) {
        response.sendFile( pathImagen );
    } else {
        let pathNoImagen = path.resolve( __dirname, '../assets/no-img.jpg' );
        response.sendFile( pathNoImagen );
    }

});

module.exports = app;
