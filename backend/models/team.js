const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const teamSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true },
    defense: { type: Number, required: true },
    mid: { type: Number, required: true },
    offense: { type: Number, required: true },
    finishing: { type: Number, required: true }
});

teamSchema.plugin(uniqueValidator, { message: 'Team with that name already exists!' });

module.exports = mongoose.model('Team', teamSchema);