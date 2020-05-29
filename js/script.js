loadData().then(data => {
    console.log(data);
    
    // no country selected by default
    this.activeState = null;
    // deafultActiveYear is 2000
    this.activeYear = '2000';
    let that = this;
    const countryMap = new Map(data, updateState);

    // ******* TODO: PART 3 *******
    /**
     * Calls the functions of the views that need to react to a newly selected/highlighted country
     *
     * @param countryID the ID object for the newly selected country
     */
    function updateState(state) {
            countryMap.updateHighlightClick(state);
        /*
            that.activeCountry = countryID;
            worldMap.updateHighlightClick(countryID);
            gapPlot.updateHighlightClick(countryID);
            infoBox.updateTextDescription(countryID, activeYear);
            */
        //TODO - Your code goes here - 
        

    }

    // ******* TODO: PART 3 *******
    /**
     *  Takes the specified activeYear from the range slider in the GapPlot view.
     *  It takes the value for the activeYear as the parameter. When the range slider is dragged, we have to update the
     *  gap plot and the info box.
     *  @param year the new year we need to set to the other views
     */
    function updateYear(year) {
        /*
        //TODO - Your code goes here - 
        activeYear = year;
        d3.select('.slider-wrap')
            .select('div')
            .select('svg')
            .select('text').text(year);
        
        d3.select("#year-title").text(year);
        infoBox.updateTextDescription(activeCountry, year);
        */

    }
    // Creates the view objects
    //const infoBox = new InfoBox(data);
    //const gapPlot = new GapPlot(data, updateCountry, updateYear, this.activeYear);
    // Initialize the plots; pick reasonable default values
    //gapPlot.updatePlot("2000", 'fertility-rate', 'gdp', 'population');

    // here we load the map data
    d3.json('data/states.json').then(mapData => {

        // ******* TODO: PART I *******
        // You need to pass the world topo data to the drawMap() function as a parameter
        countryMap.drawMap(mapData);

    });

    // This clears a selection by listening for a click
    document.addEventListener("click", function(e) {
        //TODO - Your code goes here - 
        // call clear highight methods
        countryMap.clearHighlight();
        //gapPlot.clearHighlight();
        //infoBox.clearHighlight();
    }, true);
    
});

// ******* DATA LOADING *******
// We took care of that for you

/**
 * A file loading function or CSVs
 * @param file
 * @returns {Promise<T>}
 */
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
    let data = await fetch("https://api.covid19api.com/live/country/united-states/status/confirmed");
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
