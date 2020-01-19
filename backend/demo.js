let teams = ['a', 'b', 'c', 'd'];
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

function createMatch(home, away, week) {
    return {
        home, away, played: false, week
    }
}

console.log(matches.sort((a, b) => a.week >= b.week ? 1 : -1));