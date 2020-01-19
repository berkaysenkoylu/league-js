/*

This is for finding the probabilities of teams winning the league.
I also use this same procedure in backend to find the results of the matches.

*/

function playWeek(fixture) {
    let pFixture; // Played fixture

    pFixture = fixture.map(match => {
        return simulateMatch(match);
    });

    return pFixture;
}

function simulateMatch(match) {
    // Get a duplicate of the match data
    const copiedMatch = {...match};

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