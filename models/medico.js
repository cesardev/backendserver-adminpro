const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const medicoSchema = new Schema({

    nombre: { type: String, required: [true, 'El nombre es requerido'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' }

}, { collection: 'medicos' });

module.exports = mongoose.model('Medico', medicoSchema);
