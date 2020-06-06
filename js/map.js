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
     * @param positive //positive
     * @param deaths //death
     * @param hospitialized //hospitalizedCurrently
     * @param date 
     */
    constructor(province, positive, deaths, hospitalized, date) {
        this.province = province;
        this.positive = positive;
        this.deaths = deaths;
        this.hospitalized = hospitalized;
        this.date = date;
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
    constructor(data, updateState, activedate, mapindicator, updateDate) {
        // ******* TODO: PART I *******
        this.projection = d3.geoAlbersUsa().scale(800).translate([380, 225]);
        this.by_date = {};
        this.min_date = "2020-03-07";
        this.max_date = null;
        this.covid_data = this.parsePerState(data.covid);
        this.population_data = data.population;
        this.state_data = null;
        this.updateState = updateState;
        this.active_date = activedate;
        this.map_indicator = mapindicator;
        this.updateDate = updateDate;
        this.state_abbrev = {
            'Arizona' : 'AZ',
            'Alabama' : 'AL',
            'Alaska' : 'AK',
            'Arkansas' : 'AR',
            'California' : 'CA',
            'Colorado' : 'CO',
            'Connecticut' : 'CT',
            'Delaware' : 'DE',
            'Florida' : 'FL',
            'Georgia' : 'GA',
            'Hawaii' : 'HI',
            'Idaho' : 'ID',
            'Illinois' : 'IL',
            'Indiana' : 'IN',
            'Iowa' : 'IA',
            'Kansas' : 'KS',
            'Kentucky' : 'KY',
            'Louisiana': 'LA',
            'Maine': 'ME',
            'Maryland': 'MD',
            'Massachusetts': 'MA',
            'Michigan': 'MI',
            'Minnesota':'MN',
            'Mississippi':'MS',
            'Missouri': 'MO',
            'Montana':'MT',
            'Nebraska': 'NE',
            'Nevada': 'NV',
            'New Hampshire': 'NH',
            'New Jersey': 'NJ',
            'New Mexico': 'NM',
            'New York': 'NY',
            'North Carolina': 'NC',
            'North Dakota': 'ND',
            'Ohio':'OH',
            'Oklahoma': 'OK',
            'Oregon': 'OR',
            'Pennsylvania': 'PA',
            'Rhode Island': 'RI',
            'South Carolina': 'SC',
            'South Dakota': 'SD',
            'Tennessee': 'TN',
            'Texas': 'TX',
            'Utah': 'UT',
            'Vermont': 'VT',
            'Virginia': 'VA',
            'Washington': 'WA',
            'West Virginia': 'WV',
            'Wisconsin': 'WI',
            'Wyoming': 'WY'
        };
    }




    changeMap(input, time) {
        var color_deaths = d3.scaleLinear()
        .domain([this.min_deaths, this.max_deaths])
        .range(["lightblue", "red"]); 
        var color_positive = d3.scaleLinear()
        .domain([this.min_positive, this.max_positive])
        .range(["lightblue", "red"]); 
        var color_hospitalized = d3.scaleLinear()
        .domain([this.min_hospitalized, this.max_hospitalized])
        .range(["lightblue", "red"]); 
        let date = new Date(time*1000).toISOString().substring(0, 10);
        this.map_indicator = input;
        this.active_date = date;

        console.log(date);
        console.log(input);
        console.log(this.by_date[date]);
        
        if (date in this.by_date) {
        
        let cdata = this.by_date[date];
        let clength = cdata.length;
        this.state_data.features.forEach(state => {
                    let name = state.properties.NAME;
                    var pop;
                    var color_pop;
                    if (input == "Positive / Population") {
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
                    let new_name = name.replace(" ", "-");
                    let abbrev = this.state_abbrev[name];
                        d3.select("#" + new_name).
                        style("fill", function(d) {
                        var stat;
                            for (var i = 0; i < clength; i++) {
                                let cur = cdata[i];
                                if (cur.province == abbrev) {
                                    /* 
                                    if (input == "Positive / Population") {
                                        console.log("color_pop");
                                        stat = cur.positive;
                                        if (stat == -1) {
                                            return "green";
                                        }
                                        return color_pop(stat);
                                    }
                                    */
                                    if (input == "Deaths") {
                                        console.log("color_deaths");
                                        stat = cur.deaths;
                                        if (stat == -1) {
                                            return "black";
                                        }
                                        return color_deaths(stat);
                                    }
                                    else if (input == "Positive Cases") {
                                        console.log("color_pos");
                                        stat = cur.positive;
                                        if (stat == -1) {
                                            return "black";
                                        }
                                        return color_positive(stat);
                                    }
                                    else if (input == "Hospitalizations") {
                                        console.log("color_hosp");
                                        stat = cur.hospitalized;
                                        if (stat == -1) {
                                            return "black";
                                        }
                                        return color_hospitalized(stat);
                                    }
                                    // Defaults to deaths
                                    else {
                                        console.log("color_deaths");
                                        stat = cur.deaths;
                                        if (stat == -1) {
                                            return "black";
                                        }
                                        return color_deaths(stat);
                                    }
                                }
                            }
                            //return color(stat);
                        })
        });

    }

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
        dropData.push({indicator: "Positive Cases"});
        dropData.push({indicator: "Hospitalizations"});
        // dropData.push({indicator: "Positive / Population"});


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

        let change = val => this.changeMap(val, new Date(this.active_date).getTime()/1000);
        dropC.on('change', function(d, i) {
            let value = this.options[this.selectedIndex].value;
            change(value);
        });

    }
    
    // filter this.by_date to only include entries with 50 or more states entered
    parsePerState(cdata) {  
        var output = []
        var max_deaths = 0;
        var max_positive = 0;
        var max_hospitalized = 0;
        var min_deaths = 1000000000;
        var min_positive = 1000000000;
        var min_hospitalized = 1000000000;
        var inc = 0;

        cdata.forEach(c => {
            let string_date = "" + c['date']
            let new_string_date = string_date.slice(0, 4) + "-" + string_date.slice(4,6) + "-" + string_date.slice(6, 8);
            let date = new_string_date;
            //if (c['positive'] != null && c['death'] != null && c['hospitalizedCurrently'] != null) {

            if (date >= "2020-03-07") {

            let dat = new CovidData(c['state'], c['positive'] == null ? -1 : c['positive'], c['death'] == null ? -1 : c['death'], c['hospitalizedCurrently'] == null ? (c['hospitalizedCumulative'] == null ? -1 : c['hospitalizedCumulative']) : c['hospitalizedCurrently'], date);
            output.push(dat);

            if (inc == 0) {
                this.max_date = date;
            }
            if (date in this.by_date) {
                this.by_date[date].push(dat);
            }
            if (!(date in this.by_date)) {
                this.by_date[date] = [];
                this.by_date[date].push(dat);
            }
            if (c['positive'] > max_positive) {
                max_positive = c['positive'];
            }
            if (c['positive'] < min_positive) {
                min_positive = c['positive'];
            }
            if (c['hospitalizedCurrently'] > max_hospitalized) {
                max_hospitalized = c['hospitalizedCurrently'];
            }
            if (c['hospitalizedCurrently'] < min_hospitalized) {
                min_hospitalized = c['hospitalizedCurrently'];
            }
            if (c['death'] > max_deaths) {
                max_deaths = c['death'];
            }
            if (c['death'] < min_deaths) {
                min_deaths = c['death'];
            }

            inc += 1;

        }
        })

        this.max_deaths = max_deaths;
        this.max_positive = max_positive;
        this.max_hospitalized = max_hospitalized;
        this.min_deaths = min_deaths;
        this.min_positive = min_positive;
        this.min_hospitalized = min_hospitalized;
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
        this.createDropdown(this.map_indicator);

        // default to max deaths
        var color = d3.scaleLinear()
        .domain([0, this.max_deaths])
        .range(["lightblue", "red"]); 

        let graticule = d3.geoGraticule();
        d3.select("#map-chart").append('svg').selectAll("path").data(states.features).join("path").attr("d", path);
        d3.select("#map-chart").select('svg').append('path').datum(graticule.outline).attr('class', 'stroke').attr('d', path);
        // d3.select("#map-chart").select('svg').append('path').datum(graticule).attr('class', "graticule").attr('d', path).attr('fill', 'none');

        d3.select("#map-chart").select('svg').append("text").attr('id', 'year-title').attr("dx", 250).attr("dy", 75).attr('class', 'activeDate-background').text(this.active_date);


        let cdata = this.by_date[this.active_date];
        this.state_data = states;
        let update = c => {this.updateState(c)};
        states.features.forEach(state => {
            let name = state.properties.NAME;
            let abbrev = this.state_abbrev[name];
            let new_name = name.replace(" ", "-");
                d3.select("#map-chart").select('svg').append('path').attr('d', path(state.geometry)).style('stroke', 'white').style('stroke-width', '0.5').attr('id', new_name).
                style("fill", function(d) {
                    // defaulting to deaths for now
                    var stat;
                    for (var j = 0; j < cdata.length; j++) {

                        if (cdata[j].province == abbrev) {

                            stat = cdata[j].deaths;
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
        this.drawYearBar();

    }

        /**
     * Draws the year bar and hooks up the events of a year change
     */
    drawYearBar() {
        d3.select('#outside')
            .append('div').attr('id', 'activeYear-bar');

        //Slider to change the activeYear of the data
        let scale = d3.scaleLinear().domain([new Date(this.min_date).getTime() / 1000, new Date(this.max_date).getTime() / 1000]).range([30, 730]);

        let yearSlider = d3.select('#activeYear-bar')
            .append('div').classed('slider-wrap', true)
            .append('input').classed('slider', true)
            .attr('type', 'range')
            .attr('min', new Date(this.min_date).getTime() / 1000)
            .attr('max', new Date(this.max_date).getTime() / 1000)
            .attr('value', new Date(this.active_date).getTime() / 1000);

        let sliderLabel = d3.select('.slider-wrap')
            .append('div').classed('slider-label', true)
            .append('svg');

        let sliderText = sliderLabel.append('text').text(this.active_date);

        let update = date => {
          //  this.updatePlot(year, this.xIndicator, this.yIndicator, this.circleSizeIndicator);
            // this.updateYear(year);
            this.changeMap(this.map_indicator, date);
            this.updateDate(date);
        }
        console.log(yearSlider);
        sliderText.attr('x', scale(new Date(this.active_date).getTime()/1000));
        sliderText.attr('y', 25);
       
        console.log(sliderText);
        yearSlider.on('input', function() {
            const value = this.value;
            this.active_date = value;
            update(value);
        });
        
    }


    /**
     * Highlights the selected conutry and region on mouse click
     * @param activeCountry the country ID of the country to be rendered as selected/highlighted
     */
    updateHighlightClick(activeState) {
        console.log(activeState);
        let new_name = activeState.replace(" ", "-");
        // ******* TODO: PART 3*******
        // Assign selected class to the target country and corresponding region
        // Hint: If you followed our suggestion of using classes to style
        // the colors and markers for countries/regions, you can use
        // d3 selection and .classed to set these classes on here.
        //
        console.log(d3.select("#" + new_name));
        d3.selectAll("path").classed('selected', false);
        d3.select("#"+new_name).classed('selected', true);

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
    drawLegend(min, max) {
        // ******* TODO: PART 2*******
        //This has been done for you but you need to call it in updatePlot()!
        //Draws the circle legend to show size based on health data
        let scale = d3.scaleSqrt().range([3, 20]).domain([min, max]);

        let circleData = [min, max];

        let svg = d3.select('.circle-legend').select('svg').select('g');

        let circleGroup = svg.selectAll('g').data(circleData);
        circleGroup.exit().remove();

        let circleEnter = circleGroup.enter().append('g');
        circleEnter.append('circle').classed('neutral', true);
        circleEnter.append('text').classed('circle-size-text', true);

        circleGroup = circleEnter.merge(circleGroup);

        circleGroup.attr('transform', (d, i) => 'translate(' + ((i * (5 * scale(d))) + 20) + ', 25)');

        circleGroup.select('circle').attr('r', (d) => scale(d));
        circleGroup.select('circle').attr('cx', '0');
        circleGroup.select('circle').attr('cy', '0');
        let numText = circleGroup.select('text').text(d => new Intl.NumberFormat().format(d));

        numText.attr('transform', (d) => 'translate(' + ((scale(d)) + 10) + ', 0)');
    }
}