/**
 * Data structure for the data associated with an individual country.
 * the CountryData class will be used to keep the data for drawing your map.
 * You will use the region to assign a class to color the map!
 */
class CountryData {
    /**
     *
     * @param type refers to the geoJSON type- countries are considered features
     * @param properties contains the value mappings for the data
     * @param geometry contains array of coordinates to draw the country paths
     * @param region the country region
     */
    constructor(type, id, properties, geometry, region) {

        this.type = type;
        this.id = id;
        this.properties = properties;
        this.geometry = geometry;
        this.region = region;
    }
}

class CovidData {
    /**
     * @param province
     * @param active
     * @param confirmed 
     * @param deaths 
     * @param date 
     */
    constructor(province, active, confirmed, deaths, date) {
        this.province = province;
        this.active = active;
        this.confirmed = confirmed;
        this.deaths = deaths;
        this.date = new Date(date);
    }


}

/** Class representing the map view. */
class Map {

    /**
     * Creates a Map Object
     *
     * @param data the full dataset
     * @param updateCountry a callback function used to notify other parts of the program when the selected
     * country was updated (clicked)
     */
    constructor(data, updateState) {
        // ******* TODO: PART I *******
        this.projection = d3.geoAlbersUsa().scale(800).translate([380, 225]);
        this.covid_data = this.parsePerState(data.covid);
        this.population_data = data.population;
        this.state_data = null;
        this.updateState = updateState;
        // this.nameArray = data.map(d => d.country_code_region.toUpperCase());
        // this.populationData = data.population;
        // this.updateCountry = updateCountry;
    }
    changeMap(input) {
        var color_deaths = d3.scaleLinear()
        .domain([this.min_deaths, this.max_deaths])
        .range(["lightblue", "red"]); 
        var color_active = d3.scaleLinear()
        .domain([this.min_active, this.max_active])
        .range(["lightblue", "red"]); 
        var color_confirmed = d3.scaleLinear()
        .domain([this.min_confirmed, this.max_confirmed])
        .range(["lightblue", "red"]); 
        let cdata = this.covid_data;
        let clength = cdata.length;
        this.state_data.features.forEach(state => {
                    let name = state.properties.NAME;
                    var pop;
                    var color_pop;
                    if (input == "Active / Population") {
                    for (var j = 0; j < this.population_data.length; j++) {
                        let p = this.population_data[j];
                        if (p['State'] == name) {
                            pop = p['2018 Population'];
                            break;
                        }

                    }
                    }

                    color_pop = d3.scaleLinear()
                    .domain([0, pop])
                    .range(["lightblue", "red"]); 

                        d3.select("#" + name).
                        style("fill", function(d) {
                        var stat;
                            for (var i = clength-1; i >= 0; i--) {
                                let cur = cdata[i];
                                if (cur.province == name) {
                                    if (input == "Active / Population") {
                                        stat = cur.active;
                                        return color_pop(stat);
                                    }
                                    else if (input == "Deaths") {
                                        stat = cur.deaths;
                                        return color_deaths(stat);
                                    }
                                    else if (input == "Active Cases") {
                                        stat = cur.active;
                                        return color_active(stat);
                                    }
                                    else if (input == "Confirmed Cases") {
                                        stat = cur.confirmed;
                                        return color_confirmed(stat);
                                    }
                                    // Defaults to deaths
                                    else {
                                        stat = cur.deaths;
                                        return color_deaths(stat);
                                    }
                                    break;
                                }
                            }
                            //return color(stat);
                        })
        });

    }
    createDropdown(inputIndicator) {
        let dropdownWrap = d3.select('#map-chart').append('div').classed('dropdown-wrapper', true);

        let cWrap = dropdownWrap.append('div').classed('dropdown-panel', true);

        cWrap.append('div').classed('c-label', true)
            .append('text')
            .text('US COVID-19 Data');

        cWrap.append('div').attr('id', 'dropdown_c').classed('dropdown', true).append('div').classed('dropdown-content', true)
            .append('select');
            
        let dropDownWrapper = d3.select('.dropdown-wrapper');
        let dropData = [];

        dropData.push({indicator: "Deaths"});
        dropData.push({indicator: "Active Cases"});
        dropData.push({indicator: "Confirmed Cases"});
        dropData.push({indicator: "Active / Population"});


        let dropC = dropDownWrapper.select('#dropdown_c').select('.dropdown-content').select('select');

        let optionsC = dropC.selectAll('option')
            .data(dropData);


        optionsC.exit().remove();

        let optionsCEnter = optionsC.enter()
            .append('option')
            .attr('value', (d, i) => d.indicator);

        optionsCEnter.append('text')
            .text((d, i) => d.indicator);

        optionsC = optionsCEnter.merge(optionsC);

        let selectedC = optionsC.filter(d => d.indicator === inputIndicator)
            .attr('selected', true);

        let change = val => this.changeMap(val);
        dropC.on('change', function(d, i) {
            let value = this.options[this.selectedIndex].value;
            change(value);
        });

    }
    

    parsePerState(cdata) {  
        var output = []
        var max_deaths = 0;
        var max_active = 0;
        var max_confirmed = 0;
        var min_deaths = 1000000000;
        var min_active = 1000000000;
        var min_confirmed = 1000000000;

        cdata.forEach(c => {
            output.push(new CovidData(c['Province'], c['Active'], c['Confirmed'], c['Deaths'], c['Date']));
            if (c['Active'] > max_active) {
                max_active = c['Active'];
            }
            if (c['Active'] < min_active) {
                min_active = c['Active'];
            }
            if (c['Confirmed'] > max_confirmed) {
                max_confirmed = c['Confirmed'];
            }
            if (c['Confirmed'] < min_confirmed) {
                min_confirmed = c['Confirmed'];
            }
            if (c['Deaths'] > max_deaths) {
                max_deaths = c['Deaths'];
            }
            if (c['Deaths'] < min_deaths) {
                min_deaths = c['Deaths'];
            }
        })

        this.max_deaths = max_deaths;
        this.max_active = max_active;
        this.max_confirmed = max_confirmed;
        this.min_deaths = min_deaths;
        this.min_active = min_active;
        this.min_confirmed = min_confirmed;
        var sorted = output.sort(function(a, b) {
            a.date - b.date;
        });
        return sorted;


    }


    /**
     * Renders the map
     * @param world the topojson data with the shape of all countries and a string for the activeYear
     */
    drawMap(states) {

        let path = d3.geoPath().projection(this.projection);    
        this.createDropdown('Deaths');

        // default to max deaths
        var color = d3.scaleLinear()
        .domain([0, this.max_deaths])
        .range(["lightblue", "red"]); 

        let graticule = d3.geoGraticule();
        d3.select("#map-chart").append('svg').selectAll("path").data(states.features).join("path").attr("d", path);
        d3.select("#map-chart").select('svg').append('path').datum(graticule.outline).attr('class', 'stroke').attr('d', path);
        // d3.select("#map-chart").select('svg').append('path').datum(graticule).attr('class', "graticule").attr('d', path).attr('fill', 'none');

        let clength = this.covid_data.length;
        let cdata = this.covid_data;

        this.state_data = states;
        let update = c => {this.updateState(c)};
        states.features.forEach(state => {
            console.log(state);
            let name = state.properties.NAME;
            console.log(name);
                d3.select("#map-chart").select('svg').append('path').attr('d', path(state.geometry)).style('stroke', 'white').style('stroke-width', '0.5').attr('id', name).
                style("fill", function(d) {
                    // defaulting to deaths for now
                    var stat;
                    for (var i = clength-1; i >= 0; i--) {
                        let cur = cdata[i];
                        if (cur.province == name) {
                            stat = cur.deaths;
                            break;

                        }

                    }
                    return color(stat);
                })
                .on("click", function() {
                    update(this.id);
                });
                /* 
                .on("mouseover", function() {
                    d3.select(this).style("opacity", 0.9);
                })
                .on("mouseout", function() {
                    d3.select(this).style("opacity", 1);
                });
                */

        });


    }

    /**
     * Highlights the selected conutry and region on mouse click
     * @param activeCountry the country ID of the country to be rendered as selected/highlighted
     */
    updateHighlightClick(activeState) {
        console.log(activeState);
        // ******* TODO: PART 3*******
        // Assign selected class to the target country and corresponding region
        // Hint: If you followed our suggestion of using classes to style
        // the colors and markers for countries/regions, you can use
        // d3 selection and .classed to set these classes on here.
        //
        console.log(d3.select("#" + activeState));
        d3.selectAll("path").classed('selected', false);
        d3.select("#"+activeState).classed('selected', true);

    }

    /**
     * Clears all highlights
     */
    clearHighlight() {
        // ******* TODO: PART 3*******
        // Clear the map of any colors/markers; You can do this with inline styling or by
        // defining a class style in styles.css

        // Hint: If you followed our suggestion of using classes to style
        // the colors and markers for hosts/teams/winners, you can use
        // d3 selection and .classed to set these classes off here.

        //TODO - Your code goes here - 
        d3.selectAll('path').classed('selected', false);

    }
}