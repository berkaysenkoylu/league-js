const Team = require('../models/team');
const Match = require('../models/match');
const League = require('../models/league');

exports.initializeLeague = async (req, res, next) => {
    // Delete all the existing leagues (we have only 1 anyways)
    await League.deleteMany();

    // Get the teams
    let teams = await Team.find();

    // If less than 4 teams, return an error
    if(teams.length < 4) {
        return res.status(400).json({
            message: 'Not enough teams available in the pool, please add more teams (at least 4)'
        });
    }

    // shuffle teams array
    shuffleArray(teams);

    const newLeague = new League({
        teams: teams.map(team => {
            return {
                team: team._id,
                points: 0,
                played: 0,
                win: 0,
                draw: 0,
                lose: 0,
                gs: 0,
                gc: 0
            }
        }),
        fixture: generateFixture(teams.map(team => team._id))
    });

    
    try {
        const result = await newLeague.save();

        return res.status(200).json({
            message: 'Successfully initialized a new league',
            result: result
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

exports.getLeague = async (req, res, next) => {
    let league;

    try {
        league = await League.find().populate('fixture.home.team fixture.away.team teams.team');

        if(!league) {
            let error = new Error();
            error.statusCode = 404;
            error.message = 'No such league was found';
    
            next(error);
        }

        return res.status(200).json({
            message: 'Successfully fetched the league',
            league: league[0]
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

exports.playMatch = async (req, res, next) => {
    const league = await League.find().populate('fixture.home.team fixture.away.team teams.team');

    if(league[0].week > 6) {
        return res.status(400).json({
            message: 'The league has been completed'
        });
    }

    const fixtureOfThisWeek = league[0].fixture.filter(week => week.weekNumber === league[0].week);
    const fixtureOfOther = league[0].fixture.filter(week => week.weekNumber !== league[0].week);

    // Simulate the match
    let playedFixture = playWeek(fixtureOfThisWeek);

    let updatedFixtureData = fixtureOfOther.concat(playedFixture);

    // Get points
    let newLeagueData = updateLeagueData(league[0].teams, playedFixture);
    
    league[0].teams = newLeagueData;
    league[0].fixture = updatedFixtureData;
    league[0].week += 1;

    // Update the league document in db
    let result = await league[0].save();

    return res.status(200).json({
        league: result
    });
}

exports.playAllMatches = async (req, res, next) => {
    const league = await League.find().populate('fixture.home.team fixture.away.team teams.team');

    if(league[0].week > 6) {
        return res.status(400).json({
            message: 'The league has been completed'
        });
    }

    while(league[0].week <= 6) {
        const fixtureOfThisWeek = league[0].fixture.filter(week => week.weekNumber === league[0].week);
        const fixtureOfOther = league[0].fixture.filter(week => week.weekNumber !== league[0].week);

        // Simulate the match
        let playedFixture = playWeek(fixtureOfThisWeek);

        let updatedFixtureData = fixtureOfOther.concat(playedFixture);

        // Get points
        let newLeagueData = updateLeagueData(league[0].teams, playedFixture);
        
        league[0].teams = newLeagueData;
        league[0].fixture = updatedFixtureData;
        league[0].week += 1;
    }
    // league[0].week = league[0].week > 6 ? 6 : league[0].week;

    // Update the league document in db
    let result = await league[0].save();

    return res.status(200).json({
        league: result
    });
}



/*
    UTILITY FUNCTIONS
*/

// FUNCTION TO SHUFFLE ARRAY
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// FUNCTION TO GENERATE A FIXTURE
function generateFixture(teams) {
    let weeks = [1, 2, 3];
    let matches = [];
    
    let match = 1;
    while(match <= 3) {
        let m1 = createMatch(teams[0], teams[match], match);
        let m2 = createMatch(teams[match], teams[0], 7-match);
    
        let weeksPrime = weeks.filter(week => week !== match);
        let n1 = createMatch(teams[weeksPrime[0]], teams[weeksPrime[1]], match);
        let n2 = createMatch(teams[weeksPrime[1]], teams[weeksPrime[0]], 7-match);
    
        matches = matches.concat([m1, m2, n1, n2]);
        match++;
    }

    return matches.sort((a, b) => a.week >= b.week ? 1 : -1);
}

function createMatch(home, away, week) {
    let match = new Match({
        home: {
            team: home,
            score: 0
        },
        away: {
            team: away,
            score: 0
        },
        weekNumber: week,
        played: false
    });

    return match;
}

function playWeek(fixture) {
    let pFixture; // Played fixture

    pFixture = fixture.map(match => {
        return simulateMatch(match);
    });

    return pFixture;
}

function simulateMatch(match) {
    // console.log(`${match.home.team.name} vs ${match.away.team.name} is gonna be played.`);

    // Get a duplicate of the match data
    const copiedMatch = {...match._doc};

    // Start of the match
    const matchResult = { h: 0, a: 0 };

    const weights = { defense: 0.1, mid: 0.2, offense: 0.3, finishing: 0.4 };

    let homeTeam = copiedMatch.home.team.defense * weights.defense + copiedMatch.home.team.mid * weights.mid + copiedMatch.home.team.offense * weights.offense + copiedMatch.home.team.finishing * weights.finishing;
    let awayTeam = copiedMatch.away.team.defense * weights.defense + copiedMatch.away.team.mid * weights.mid + copiedMatch.away.team.offense * weights.offense + copiedMatch.away.team.finishing * weights.finishing;
    let total = homeTeam + awayTeam;

    // Form a data structure holding the info of probabilities of teams winning
    const probabilitesOfScoring = {
        h: homeTeam / total + 0.02,
        a: awayTeam / total - 0.02
    }
    // const probabilitesOfScoring = {
    //     h: (copiedMatch.home.team.mid + copiedMatch.home.team.offense + copiedMatch.home.team.finishing - copiedMatch.away.team.defense) / 400 + 0.20,
    //     a: (copiedMatch.away.team.mid + copiedMatch.away.team.offense + copiedMatch.away.team.finishing - copiedMatch.home.team.defense) / 400 + 0.12
    // }

    // Play match
    let count = 6;
    while (count > 0) {
        // Count even => HOME, count odd => AWAY
        let dice;
        if(count % 2 === 0) {
            dice = Math.random(0, 1);

            if(dice <= probabilitesOfScoring.h) {
                matchResult.h += 1;
            }
            else if(dice <= 0.03 || dice >= 0.97) {
                matchResult.h += 2;
            }
        }
        else {
            dice = Math.random(0, 1);

            if(dice <= probabilitesOfScoring.a) {
                matchResult.a += 1;
            }
            else if(dice <= 0.02 || dice >= 0.98) {
                matchResult.a += 2;
            }
        }
        count--;
    }

    // Update the scores
    copiedMatch.home.score = matchResult.h;
    copiedMatch.away.score = matchResult.a;
    copiedMatch.played = true;

    // console.log(probabilitesOfScoring)
    // console.log(`${copiedMatch.home.team.name}: ${copiedMatch.home.score} - ${copiedMatch.away.score} :${copiedMatch.away.team.name}`)

    // Return the resultant upgraded match info
    return copiedMatch;
}

function updateLeagueData(league, playedWeek) {
    const copiedLeague = [...league];

    let teamData = [];

    playedWeek.forEach(match => {
        let result = getResult(match);

        teamData = formTeamData(copiedLeague, match, result)
    });

    return teamData;
}

function getResult(match) {
    if(match.home.score > match.away.score) {
        return 1;
    }

    if(match.home.score < match.away.score) {
        return -1;
    }

    if(match.home.score === match.away.score) {
        return 0;
    }
}

function formTeamData(teams, match, result) {
    const copiedTeams = [...teams];

    let homeTeamIndex = copiedTeams.findIndex(team => team.team._id.toString() === match.home.team._id.toString());
    let awayTeamIndex = copiedTeams.findIndex(team => team.team._id.toString() === match.away.team._id.toString());

    switch(result) {
        case -1:
            copiedTeams[homeTeamIndex].played += 1;
            copiedTeams[homeTeamIndex].lose += 1;
            copiedTeams[homeTeamIndex].gs += match.home.score;
            copiedTeams[homeTeamIndex].gc += match.away.score;

            copiedTeams[awayTeamIndex].points += 3;
            copiedTeams[awayTeamIndex].played += 1;
            copiedTeams[awayTeamIndex].win += 1;
            copiedTeams[awayTeamIndex].gs += match.away.score;
            copiedTeams[awayTeamIndex].gc += match.home.score;
            break;
        case 0:
            copiedTeams[homeTeamIndex].played += 1;
            copiedTeams[homeTeamIndex].points += 1;
            copiedTeams[homeTeamIndex].draw += 1;
            copiedTeams[homeTeamIndex].gs += match.home.score;
            copiedTeams[homeTeamIndex].gc += match.away.score;

            copiedTeams[awayTeamIndex].points += 1;
            copiedTeams[awayTeamIndex].played += 1;
            copiedTeams[awayTeamIndex].draw += 1;
            copiedTeams[awayTeamIndex].gs += match.away.score;
            copiedTeams[awayTeamIndex].gc += match.home.score;
            break;
        case 1:
            copiedTeams[awayTeamIndex].played += 1;
            copiedTeams[awayTeamIndex].lose += 1;
            copiedTeams[awayTeamIndex].gs += match.away.score;
            copiedTeams[awayTeamIndex].gc += match.home.score;

            copiedTeams[homeTeamIndex].points += 3;
            copiedTeams[homeTeamIndex].played += 1;
            copiedTeams[homeTeamIndex].win += 1;
            copiedTeams[homeTeamIndex].gs += match.home.score;
            copiedTeams[homeTeamIndex].gc += match.away.score;
            break;
        default:
            break;
    }

    return copiedTeams;
}