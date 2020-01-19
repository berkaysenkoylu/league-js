const mongoose = require('mongoose');

const leagueSchema = mongoose.Schema({
    week: { type: Number, required: true, default: 1 },
    teams: [
        {
            team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
            points: { type: Number, required: true },
            played: { type: Number, required: true },
            win: { type: Number, required: true },
            draw: { type: Number, required: true },
            lose: { type: Number, required: true },
            gs: { type: Number, required: true }, // Goals scored
            gc: { type: Number, required: true }, // Goals conceded
        }
    ],
    fixture: [
        { 
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
        }
    ]
});


module.exports = mongoose.model('League', leagueSchema);