loadData().then(data => {
    
    this.activeDate = '2020-04-24';
    const stateMap = new Map(data, updateState, activeDate, 'Positive Cases', updateDate, 'Oregon');
    const mobilityPlot = new MobilityPlot(data, 'Oregon');
    mobilityPlot.updatePlot('Oregon');

    function updateState(state) {
            stateMap.updateHighlightClick(state);
            mobilityPlot.updatePlot(state);
    }
    function updateDate(date) {
        
        let translated = new Date(date*1000).toISOString().substring(0, 10);
        activeDate = translated;
        d3.select('.slider-wrap')
            .select('div')
            .select('svg')
            .select('text').text(translated);
        
        d3.select("#year-title").text(translated);
        

    }
    d3.json('data/states.json').then(mapData => {
        stateMap.drawMap(mapData);

    });

    document.addEventListener("click", function(e) {
        stateMap.clearHighlight();

    }, true);
    
});

async function loadFile(file) {
    let data = await d3.csv(file).then(d => {
        let mapped = d.map(g => {
            for (let key in g) {
                let numKey = +key;
                if (numKey) {
                    g[key] = +g[key];
                }
            }
            return g;
        });
        return mapped;
    });
    return data;
}

async function loadCovidData() {
    let data = await fetch("https://covidtracking.com/api/states/daily");
    let out = await data.json();
    return out;

}

async function loadData() {
    let data = await loadFile('data/mobility.csv');
    let pop = await loadFile('data/population.csv');
    let covid = await loadCovidData();
    //return [pop, gdp, tfr, cmu, life];
    return {
        'mobility': data,
        'covid': covid,
        'population': pop
    };
}
