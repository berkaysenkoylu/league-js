// Load google charts
google.charts.load('current', {'packages':['corechart']});
// google.charts.setOnLoadCallback(drawChart);


// Draw the chart and set the chart values
function drawChart(probabilities) {
    let dataArr = Object.keys(probabilities).map(team => {
        return [ team, +(probabilities[team] / 10000 * 10).toFixed(1) ]
    });

    let data = google.visualization.arrayToDataTable([
        ['Teams', 'Win Probabilities'],
        ...dataArr
    ]);

    // console.log(probabilities);
    // Optional; add a title and set the width and height of the chart
    let options = {'title':'Winning Probabilities', 'width':400, 'height':200, 'is3D': true, 'chartArea': { left: 0, top: 20 }, 'legend': { position: 'labeled' }};

    // Display the chart inside the <div> element with id="piechart"
    let chart = new google.visualization.PieChart(document.getElementById('piechart'));
    chart.draw(data, options);
}