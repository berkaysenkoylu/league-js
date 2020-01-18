const BACKEND_URL = 'http://localhost:8000/api/';

let leagueTableElement = document.getElementById('league-table');
let fixtureElement = document.getElementById('fixture-body');

// CTA
let nextWeekButton = document.getElementById('next-week-button');
let resetButton = document.getElementById('reset-button');
let finishLeagueButton = document.getElementById('finish-league');

let leagueTableData = [];
let fixtureData = [];
let week;
let probabilities = {};

window.addEventListener('load', async () => {
    await fetchData();
});

function preProcessTeamData(teams) {
    let processedTeams = teams.map(team => {
        return {
            team: team.team.name,
            p: team.played,
            w: team.win,
            d: team.draw,
            l: team.lose,
            gs: team.gs,
            gc: team.gc,
            pts: team.points
        }
    });

    return processedTeams;
}

function addHeaders(table, keys) {
  let row = table.insertRow();
  for(let i = 0; i < keys.length; i++ ) {
    let cell = row.insertCell();
    cell.appendChild(document.createTextNode(keys[i]));
  }
}

function createTable(data, element) {
    let table = document.createElement('table');
    for(let i = 0; i < data.length; i++ ) {
        let child = data[i];
        if(i === 0) {
            addHeaders(table, Object.keys(child));
        }
        let row = table.insertRow();
        Object.keys(child).forEach(function(k) {
            let cell = row.insertCell();
            cell.appendChild(document.createTextNode(child[k]));
        });
    }

    element.appendChild(table);
}

function formFixture(fixtureData) {
    for(let i = 0; i < fixtureData.length; i += 2) {
        let row = document.createElement('div');
        row.className = 'fixture-row';

        let weekSpan = document.createElement('span');
        weekSpan.className = 'fixture-week';
        weekSpan.appendChild(document.createTextNode(`Week ${fixtureData[i].weekNumber}`));

        let matchRow = document.createElement('div');
        matchRow.className = 'fixture-match';

        let matchSpan1 = document.createElement('span');
        let matchSpan2 = document.createElement('span');
        if(fixtureData[i].played) {
            matchSpan1.appendChild(document.createTextNode(`${fixtureData[i].home.team.name}: ${fixtureData[i].home.score} - ${fixtureData[i].away.score} :${fixtureData[i].away.team.name}`));
            matchSpan2.appendChild(document.createTextNode(`${fixtureData[i+1].home.team.name}: ${fixtureData[i+1].home.score} - ${fixtureData[i+1].away.score} :${fixtureData[i+1].away.team.name}`));
            matchSpan1.className = 'played-match';
            matchSpan2.className = 'played-match';
            weekSpan.className = 'fixture-week played-match';
        }
        else {
            matchSpan1.appendChild(document.createTextNode(`${fixtureData[i].home.team.name} - ${fixtureData[i].away.team.name}`));
            matchSpan2.appendChild(document.createTextNode(`${fixtureData[i+1].home.team.name} - ${fixtureData[i+1].away.team.name}`));
        }

        matchRow.appendChild(matchSpan1);
        matchRow.appendChild(matchSpan2);
        
        row.appendChild(weekSpan);
        row.appendChild(matchRow);
        fixtureElement.appendChild(row);
    }
}

// NEXT WEEK
nextWeekButton.addEventListener('click', async () => {
    if(!(week <= 6)) {
        alert("League has been completed");
        return;
    }

    // Reset the fields
    resetFields();

    // Next week
    let response = await fetch(BACKEND_URL + 'league/playmatch', { method: 'GET' });
    let data = await response.json();
    
    leagueTableData = data.league.teams;
    fixtureData = data.league.fixture;
    week = data.league.week;

    let sortedTeamData = leagueTableData.sort((a, b) => {
        if(a.points === b.points) {
            return (a.gs - a.gc > b.gs - b.gc) ? -1 : 1;
        }
        else {
            return a.points > b.points ? -1 : 1;
        }
    });



    let teamData = preProcessTeamData(sortedTeamData);
    createTable(teamData, leagueTableElement);

    let sortedFixture = fixtureData.sort((a, b) => a.weekNumber >= b.weekNumber ? 1 : -1);
    formFixture(sortedFixture);
});

// RESET LEAGUE
resetButton.addEventListener('click', async () => {
    // Reset the league
    let reset = await fetch(BACKEND_URL + 'league/newleague', { method: 'GET' });

    fetchData();
});

// FINISH LEAGUE
finishLeagueButton.addEventListener('click', async () => {
    if((week > 6)) {
        alert("League has already been completed");
        return;
    }

    // Reset the fields
    resetFields();

    // Next week
    let response = await fetch(BACKEND_URL + 'league/playallmatches', { method: 'GET' });
    let data = await response.json();
    
    leagueTableData = data.league.teams;
    fixtureData = data.league.fixture;
    week = data.league.week;

    let sortedTeamData = leagueTableData.sort((a, b) => {
        if(a.points === b.points) {
            return ((a.gs - a.gc) > (b.gs - b.gc)) ? 1 : -1;
        }
        else {
            return a.points > b.points ? -1 : 1;
        }
    });

    let teamData = preProcessTeamData(sortedTeamData);
    createTable(teamData, leagueTableElement);

    let sortedFixture = fixtureData.sort((a, b) => a.weekNumber >= b.weekNumber ? 1 : -1);
    formFixture(sortedFixture);
})

function fetchData() {
    // Reset the fields
    resetFields();

    fetch(BACKEND_URL + 'league', { method: 'GET' }).then(res => {
        return res.json();
    }).then(response => {
        leagueTableData = response.league.teams;
        fixtureData = response.league.fixture;
        week = response.league.week;
    
        let sortedTeamData = leagueTableData.sort((a, b) => {
            if(a.points === b.points) {
                return ((a.gs - a.gc) > (b.gs - b.gc)) ? -1 : 1;
            }
            else {
                return a.points > b.points ? -1 : 1;
            }
        });
    


        let teamData = preProcessTeamData(sortedTeamData);
        createTable(teamData, leagueTableElement);
        
        let sortedFixture = fixtureData.sort((a, b) => a.weekNumber >= b.weekNumber ? 1 : -1);
        formFixture(sortedFixture);
    });
}

function resetFields() {
    // let fixtureBody = document.getElementById('fixture-body');
    while (fixtureElement.firstChild) fixtureElement.removeChild(fixtureElement.firstChild);

    // let tableData = document.getElementById('league-table');
    while (leagueTableElement.firstChild) leagueTableElement.removeChild(leagueTableElement.firstChild);


}

