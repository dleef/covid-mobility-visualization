

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

class Map {

    constructor(data, updateState, activedate, mapindicator, updateDate, activeState) {
        this.projection = d3.geoAlbersUsa().scale(800).translate([380, 225]);
        this.by_date = {};
        this.min_date = "2020-03-07";
        this.max_date = null;
        this.covid_data = this.parsePerState(data.covid, activedate);
        this.state_data = null;
        this.updateState = updateState;
        this.active_date = activedate;
        this.map_indicator = mapindicator;
        this.updateDate = updateDate;
        this.activeState = activeState;
        this.drawn = false;
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
        this.active_date = date;
        this.map_indicator = input;
        if (date in this.by_date) {
        
        let cdata = this.by_date[date];
        let clength = cdata.length;
        this.state_data.features.forEach(state => {
                    let name = state.properties.NAME;
                    let new_name = name.replace(" ", "-");
                    let abbrev = this.state_abbrev[name];
                        d3.select("#" + new_name).
                        style("fill", function(d) {
                        var stat;
                            for (var i = 0; i < clength; i++) {
                                let cur = cdata[i];
                                if (cur.province == abbrev) {

                                    if (input == "Deaths") {
                                        stat = cur.deaths;
                                        if (stat == -1) {
                                            return "black";
                                        }
                                        return color_deaths(stat);
                                    }
                                    else if (input == "Positive Cases") {
                                        stat = cur.positive;
                                        if (stat == -1) {
                                            return "black";
                                        }
                                        return color_positive(stat);
                                    }
                                    else if (input == "Hospitalizations") {
                                        stat = cur.hospitalized;
                                        if (stat == -1) {
                                            return "black";
                                        }
                                        return color_hospitalized(stat);
                                    }
                                    else {
                                        stat = cur.deaths;
                                        if (stat == -1) {
                                            return "black";
                                        }
                                        return color_deaths(stat);
                                    }
                                }
                            }
                        })
        });

    }

    if (input == "Deaths") {
        this.drawLegend(this.min_deaths, this.max_deaths);
    }
    else if (input == "Hospitalizations") {
        this.drawLegend(this.min_hospitalized, this.max_hospitalized);
    }
    else {
        this.drawLegend(this.min_positive, this.max_positive);
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
            if (c['positive'] > max_positive && c['positive'] != null) {
                max_positive = c['positive'];
            }
            if (c['positive'] < min_positive && c['positive'] != null) {
                min_positive = c['positive'];
            }
            if (c['hospitalizedCurrently'] > max_hospitalized && c['hospitalizedCurrently'] != null) {
                max_hospitalized = c['hospitalizedCurrently'];
            }
            if (c['hospitalizedCurrently'] < min_hospitalized && c['hospitalizedCurrently'] != null) {
                min_hospitalized = c['hospitalizedCurrently'];
            }
            if (c['death'] > max_deaths && c['death'] != null) {
                max_deaths = c['death'];
            }
            if (c['death'] < min_deaths && c['death'] != null) {
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
        .domain([0, this.max_positive])
        .range(["lightblue", "red"]); 

        let graticule = d3.geoGraticule();
        d3.select("#map-chart").append('svg').selectAll("path").data(states.features).join("path").attr("d", path);
        d3.select("#map-chart").select('svg').append('path').datum(graticule.outline).attr('class', 'stroke').attr('d', path);
        // d3.select("#map-chart").select('svg').append('path').datum(graticule).attr('class', "graticule").attr('d', path).attr('fill', 'none');

        d3.select("#map-chart").select('svg').append("text").attr('id', 'year-title').attr("dx", 250).attr("dy", 75).attr('class', 'activeDate-background').text(this.active_date);

        var tooltip = d3.select("#map-chart")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip");

        let tooltipr = c => this.tooltipRender(c);

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

                            stat = cdata[j].positive;
                            break;

                        }

                    }
                    return color(stat);
                })
                .on("click", function() {
                    update(this.id);
                })
                .on("mouseover", function(d, i) {tooltip.style("opacity", 0.8).html(tooltipr(name)).style("left", (d3.mouse(this)[0]-40) + "px")
                .style("top", (d3.mouse(this)[1]+120) + "px");})
                .on("mouseout", function(d, i) {tooltip.style("opacity", 0);});
                

        });
        this.drawYearBar();
        this.updateHighlightClick(this.activeState);

        if (this.map_indicator == "Positive Cases") {
            this.drawLegend(this.min_positive, this.max_positive);
        }
        else if (this.map_indicator == "Deaths") {
            this.drawLegend(this.min_deaths, this.max_deaths);
        }
        else  {
            this.drawLegend(this.min_hospitalized, this.max_hospitalized);
        }

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
            this.changeMap(this.map_indicator, date);
            this.updateDate(date);
        }
        sliderText.attr('x', scale(new Date(this.active_date).getTime()/1000));
        sliderText.attr('y', 25);
       
        yearSlider.on('input', function() {
            const value = this.value;
            this.active_date = value;
            update(value);
        });

        
    }

    updateHighlightClick(activeState) {
        let new_name = activeState.replace(" ", "-");
        d3.selectAll("path").classed('selected', false);
        d3.select("#"+new_name).classed('selected', true);

    }


    clearHighlight() {

        d3.selectAll('path').classed('selected', false);

    }
    drawLegend(min, max) {
        if (max == 0) {
            min = "Data Unavailable";
            max = "";
        }
        if (min == max) {
            max = "-";
        }
        if (!this.drawn) {
            var defs = d3.select("#map-chart").select("svg").append("defs");
            var linearGradient = defs.append("linearGradient").attr("id", "linear-gradient");
            linearGradient
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");
            linearGradient.append("stop").attr("offset", "0%").attr("stop-color", "lightblue");
            linearGradient.append("stop").attr("offset", "100%").attr("stop-color", "red");
            d3.select("#map-chart").select("svg").append("rect").attr("x", 15).attr("width", 300).attr("height", 20).style("fill", "url(#linear-gradient)");
            d3.select("#map-chart").select("svg").append("text").attr("id", "min_key").attr("text-anchor", "start").attr("x", 19)
            .attr("y", 14).text(min);
            d3.select("#map-chart").select("svg").append("text").attr("id", "max_key").attr("text-anchor", "end").attr("x", 315)
            .attr("y", 14).text(max);
            d3.select("#map-chart").select("svg").append("rect").attr("x", 350).attr("width", 20).attr("height", 20).style("fill", "black");
            d3.select("#map-chart").select("svg").append("text").attr("text-anchor", "end").attr("x", 510)
            .attr("y", 14).text(" = Data Unavailable");
            this.drawn = true;
        }
        else {
        d3.select("#min_key").text(min);
        d3.select("#max_key").text(max);
    
        }
    }
    tooltipRender(data) {
        let text = "<h2>" + data + "</h2>";
        return text;
    }
}