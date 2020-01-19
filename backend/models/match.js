const mongoose = require('mongoose');

const matchSchema = mongoose.Schema({
    home: { 
        team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
        score: { type: Number, required: true, default: 0 }
     },
    away: { 
        team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
        score: { type: Number, required: true, default: 0 }
    },
    weekNumber: { type: Number, required: true },
    played: { type: Boolean, required: true, default: false }
});

module.exports = mongoose.model('Match', matchSchema);