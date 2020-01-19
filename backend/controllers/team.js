const Team = require('../models/team');

exports.getAllTeams = (req, res, next) => {
    Team.find().then(teams => {
        if(!teams) {
            return res.status(404).json({
                message: 'Failed to fetch teams'
            });
        }

        return res.status(200).json({
            message: 'Successfully fetched all the teams',
            teams: teams
        });
    }).catch(error => {
        if(!error.statusCode) {
            error.statusCode = 500;
        }

        if(!error.message) {
            error.message = 'Something went wrong!';
        }

        next(error);
    });
}

exports.getOneTeam = (req, res, next) => {
    Team.findOne({ _id: req.params.id }).then(team => {
        if(!team) {
            return res.status(404).json({
                message: 'No such team was found'
            });
        }

        return res.status(200).json({
            message: 'Successfully fetched the team',
            team: team
        });
    }).catch(error => {
        if(!error.statusCode) {
            error.statusCode = 500;
        }

        if(!error.message) {
            error.message = 'Something went wrong!';
        }

        next(error);
    });
}

exports.addTeam = (req, res, next) => {
    // If there are 4 teams, don't allow the addition of new teams
    Team.find().countDocuments().then(count => {
        if(count >= 4) {
            return res.status(400).json({
                message: 'There are already 4 teams, which is the maximum capacity.'
            });
        }
        
        const newTeam = new Team({
            name: req.body.name,
            defense: req.body.defense,
            mid: req.body.mid,
            offense: req.body.offense,
            finishing: req.body.finishing
        });

        // Validate values
        if((newTeam.defense < 0 || newTeam.defense > 100) || 
        (newTeam.mid < 0 || newTeam.mid > 100) || 
        (newTeam.offense < 0 || newTeam.offense > 100) ||
        (newTeam.finishing < 0 || newTeam.finishing > 100)) {
            return res.status(400).json({
                message: 'Failed to create a new team, make sure to enter numerical inputs correctly: [0, 100]'
            });
        }

        newTeam.save().then(result => {
            return res.status(201).json({
                message: "A new team has been successfully created",
                team: result
            });
        }).catch(error => {
            if(!error.statusCode) {
                error.statusCode = 500;
            }
    
            if(!error.message) {
                error.message = 'Something went wrong!';
            }
    
            next(error);
        });
    }).catch(error => {
        if(!error.statusCode) {
            error.statusCode = 500;
        }

        if(!error.message) {
            error.message = 'Something went wrong!';
        }

        next(error);
    });
}

exports.editTeam = async (req, res, next) => {
    let team = await Team.findOne({ _id: req.params.id });

    if(!team) {
        return res.status(404).json({
            message: 'No such team was found'
        });
    }

    if((req.body.defense < 0 || req.body.defense > 100) || 
    (req.body.mid < 0 || req.body.mid > 100) || 
    (req.body.offense < 0 || req.body.offense > 100) ||
    (req.body.finishing < 0 || req.body.finishing > 100)) {
        return res.status(400).json({
            message: 'Failed to edit the team, make sure to enter numerical inputs correctly: [0, 100]'
        });
    }

    team.name = req.body.name;
    team.defense = req.body.defense;
    team.mid = req.body.mid;
    team.attack = req.body.attack;
    team.finishing = req.body.finishing;

    try{
        let result = await team.save();

        return res.status(200).json({
            message: 'Successfully updated the team',
            updatedTeam: result
        });
    } 
    catch(error) {
        if(!error.statusCode) {
            error.statusCode = 500;
        }

        if(!error.message) {
            error.message = 'Something went wrong!';
        }

        next(error);
    }
}

exports.deleteTeam = (req, res, next) => {
    Team.deleteOne({ _id: req.params.id }).then(result => {
        if(result.n > 0) {
            return res.status(200).json({
                message: 'Team has been successfully deleted'
            });
        }
        else {
            return res.status(400).json({
                message: 'Failed to delete the team'
            });
        }
    }).catch(error => {
        if(!error.statusCode) {
            error.statusCode = 500;
        }

        if(!error.message) {
            error.message = 'Something went wrong!';
        }

        next(error);
    });
}



// exports.editTeam = (req, res, next) => {
//     Team.findOne({ _id: req.params.id }).then(team => {
//         if(!team) {
//             const error = new Error('Team couldn\'t be found!');
//             error.statusCode = 404;
//             throw error;
//         }

//         if((req.body.defense < 0 || req.body.defense > 100) || 
//         (req.body.mid < 0 || req.body.mid > 100) || 
//         (req.body.offense < 0 || req.body.offense > 100) ||
//         (req.body.finishing < 0 || req.body.finishing > 100)) {
//             const error = new Error('Failed to edit the team, make sure to enter numerical inputs correctly: [0, 100]');
//             error.statusCode = 400;
//             throw error;
//         }

//         team.name = req.body.name;
//         team.defense = req.body.defense;
//         team.mid = req.body.mid;
//         team.attack = req.body.attack;
//         team.finishing = req.body.finishing;

//         return team.save();
//     }).then(result => {
//         return res.status(200).json({
//             message: 'Successfully updated the team',
//             updatedTeam: result
//         });
//     }).catch(error => {
//         if(!error.statusCode) {
//             error.statusCode = 500;
//         }

//         if(!error.message) {
//             error.message = 'Something went wrong!';
//         }

//         next(error);
//     });
// }