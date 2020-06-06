/** Data structure for the data associated with an individual country. */
class PlotData {
    /**
     *
     * @param country country name from the x data object
     * @param xVal value from the data object chosen for x at the active year
     * @param yVal value from the data object chosen for y at the active year
     * @param id country id
     * @param region country region
     * @param circleSize value for r from data object chosen for circleSizeIndicator
     */
    constructor(state, xVal, yVal, id, type) {
        this.state = state;
        this.xVal = xVal;
        this.yVal = yVal;
        this.id = id;
        this.type = type;
    }
}

class DateData {

    constructor(work_change, retail_change, park_change, grocery_change, res_change, work_count, retail_count, park_count, grocery_count, res_count) {
        this.work_change = work_change;
        this.retail_change = retail_change;
        this.park_change = park_change;
        this.grocery_change = grocery_change;
        this.res_change = res_change;
        this.work_count = work_count;
        this.retail_count = retail_count;
        this.park_count = park_count;
        this.grocery_count = grocery_count;
        this.res_count = res_count;
    }
}

class MobilityPlot {

    /**
     *
     * @param updateCountry a callback function used to notify other parts of the program when the selected
     * country was updated (clicked)
     * @param updateYear a callback function used to notify other parts of the program when a year was updated
     * @param activeYear the year for which the data should be drawn initially
     */
    // all that's needed is data since it's showing the mobility trends for that state
    constructor(data, activeState) {

        // ******* TODO: PART 2 *******

        this.margin = { top: 20, right: 20, bottom: 60, left: 80 };
        this.width = 810 - this.margin.left - this.margin.right;
        this.height = 600 - this.margin.top - this.margin.bottom;
        this.min_date = null;
        this.max_date = null;
        this.by_state = {};
        this.state_by_date = {};
        this.state_max = {};
        this.state_min = {};
        this.activeState = activeState;
        this.mobility_data = this.USAData(data);
        this.averageData();
        //YOUR CODE HERE    
        this.drawPlot();
        this.drawLegend();
       // this.drawYearBar();

        // ******* TODO: PART 3 *******
        /**
         For part 4 of the homework, you will be using the other 3 parameters.
         * assign the highlightUpdate function as a variable that will be accessible to you in updatePlot()
         * assign the dragUpdate function as a variable that will be accessible to you in updatePlot()
         */

        //YOUR CODE HERE  


    }

    USAData(data) {
        var output = [];
        let dat = data.mobility;    
        dat.forEach(d => {
            if (d.country_region_code == "US") {
                output.push(d);
                if (d.sub_region_1 in this.by_state) {
                    this.by_state[d.sub_region_1].push(d);
                }
                else {
                    this.by_state[d.sub_region_1] = [];
                    this.by_state[d.sub_region_1].push(d);

                }
            }
        })
        return output;
    }

    averageData() {
        var min = false;
        var max = false;
        for (var key in this.by_state) {
            let cur = this.by_state[key];
            var date_dict = {};
            for (var i = 0; i < cur.length; i++) {

                let entry = cur[i];
                let date = entry.date;
                if (i == 0 && !min) {
                    this.min_date = date;
                    min = true;
                }
                if (i == cur.length - 1 && !max) {
                    this.max_date =date;
                    max = true;
                }
                    if (date in date_dict) {

                        let orig = date_dict[date];
                        let new_input = orig;
                        if (entry.grocery_and_pharmacy_percent_change_from_baseline != "") {
                            let groc = parseFloat(new_input.grocery_change);
                            let new_groc = (groc + parseFloat(entry.grocery_and_pharmacy_percent_change_from_baseline));
                            new_input.grocery_change = "" + new_groc;
                            new_input.grocery_count += 1;
                        }
                        if (entry.parks_percent_change_from_baseline != "") {
                            let park = parseFloat(new_input.park_change);
                            let new_park = (park + parseFloat(entry.parks_percent_change_from_baseline));
                            new_input.park_change = "" + new_park;
                            new_input.park_count += 1;
                        }
                        if (entry.residential_percent_change_from_baseline != "") {
                            let res = parseFloat(new_input.res_change);
                            let new_res = (res + parseFloat(entry.residential_percent_change_from_baseline));
                            new_input.res_change = "" + new_res;
                            new_input.res_count += 1;
                        }

                        if (entry.retail_and_recreation_percent_change_from_baseline != "") {
                            let retail = parseFloat(new_input.retail_change);
                            let new_retail = (retail + parseFloat(entry.retail_and_recreation_percent_change_from_baseline));
                            new_input.retail_change = "" + new_retail;
                            new_input.retail_count += 1;
                        }
                        if (entry.workplaces_percent_change_from_baseline != "") {
                            let work = parseFloat(new_input.work_change);
                            let new_work = (work + parseFloat(entry.workplaces_percent_change_from_baseline));
                            new_input.work_change = "" + new_work;
                            new_input.work_count += 1;
                        }
                        date_dict[date] = new_input;

                    }
                    else {
                        let work = entry.workplaces_percent_change_from_baseline;
                        let retail = entry.retail_and_recreation_percent_change_from_baseline;
                        let parks = entry.parks_percent_change_from_baseline;
                        let grocery = entry.grocery_and_pharmacy_percent_change_from_baseline;
                        let res = entry.residential_percent_change_from_baseline;
                        date_dict[date] = new DateData(work == "" ? "0" : work, retail == "" ? "0" : retail, parks == "" ? "0" : parks, grocery == "" ? "0" : grocery, res == "" ? "0" : res, 1, 1, 1, 1, 1);
                    }

                }

                this.state_by_date[key] = date_dict;

        }
        // delete heavily affects performance, might have to get rid of
        console.log(this.state_by_date);
        for (var key in this.state_by_date) {
            var cur_date_dict = this.state_by_date[key];
            var max = 0;
            var min = 0;
            for (var d in cur_date_dict) {
                let entry = cur_date_dict[d];
                entry.retail_change /= entry.retail_count;
                entry.work_change /= entry.work_count;
                entry.res_change /= entry.res_count;
                entry.grocery_change /= entry.grocery_count;
                entry.park_change /= entry.park_count;
               
                delete cur_date_dict[d];
                cur_date_dict[d] = entry;
                min = Math.min(min, Math.min(entry.retail_change, Math.min(entry.work_change, Math.min(entry.res_change, Math.min(entry.grocery_change, entry.park_change)))));
                max = Math.max(max, Math.max(entry.retail_change, Math.max(entry.work_change, Math.max(entry.res_change, Math.max(entry.grocery_change, entry.park_change)))));
            }
            delete this.state_by_date[key];
            this.state_by_date[key] = cur_date_dict;
            this.state_max[key] = max;
            this.state_min[key] = min;
        }
        console.log(this.state_by_date);
    }

    drawPlot() {

        
        
        d3.select('#scatter-plot')
            .append('div').attr('id', 'chart-view');

        d3.select('#chart-view')
            .append('div')
            .attr("class", "tooltip")
            .style("opacity", 0);

        d3.select('#chart-view')
            .append('svg').classed('plot-svg', true)
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);



        // let svgGroup = d3.select('#chart-view').select('.plot-svg').append('g').classed('wrapper-group', true);

        //YOUR CODE HERE  
        
        // SET AXES
        d3.select("#chart-view").select('svg').append('g').attr('id', 'x-axis').attr('transform', 'translate(0, 400)');
        d3.select("#chart-view").select('svg').append('g').attr('id', 'y-axis').attr('transform', 'translate(100, 0)');


        this.setAxes();
        /* This is the setup for the dropdown menu- no need to change this */

        /* 
        let dropdownWrap = d3.select('#chart-view').append('div').classed('dropdown-wrapper', true);

        let cWrap = dropdownWrap.append('div').classed('dropdown-panel', true);

        cWrap.append('div').classed('c-label', true)
            .append('text')
            .text('Circle Size');

        cWrap.append('div').attr('id', 'dropdown_c').classed('dropdown', true).append('div').classed('dropdown-content', true)
            .append('select');

        let xWrap = dropdownWrap.append('div').classed('dropdown-panel', true);

        xWrap.append('div').classed('x-label', true)
            .append('text')
            .text('X Axis Data');

        xWrap.append('div').attr('id', 'dropdown_x').classed('dropdown', true).append('div').classed('dropdown-content', true)
            .append('select');

        let yWrap = dropdownWrap.append('div').classed('dropdown-panel', true);

        yWrap.append('div').classed('y-label', true)
            .append('text')
            .text('Y Axis Data');

        yWrap.append('div').attr('id', 'dropdown_y').classed('dropdown', true).append('div').classed('dropdown-content', true)
            .append('select');
        */

        d3.select('#chart-view')
            .append('div')
            .classed('circle-legend', true)
            .append('svg')
            .append('g')
            .attr('transform', 'translate(10, 0)');
        
    }

    setAxes() {
        let xscale = d3
        .scaleTime()
        .domain([new Date(this.min_date), new Date(this.max_date)])
        .range([100, 600]);
      
        let yscale = d3
        .scaleLinear()
        .domain([this.state_max[this.activeState], this.state_min[this.activeState]])
        .range([0, 400]);     
        
        var x_axis = d3.axisBottom().scale(xscale);
        var y_axis = d3.axisLeft().scale(yscale);

        d3.select("#x-axis").attr("transform", "translate(0," + yscale(0) + ")").call(x_axis);
        d3.select("#y-axis").call(y_axis).select("text").attr("x", -175).attr("y", -50).attr("transform", "rotate(-90)").attr("fill", "black").text("Percent Change in Activity").style("font-size", "25px").style("text-anchor", "middle");
        //.select("text").attr("x", 280).attr("y", 40).attr("fill", "black").text("Time").style("font-size", "25px");
    }

    updatePlot(activeState) {

        let edit = activeState.replace("-", " ");
        // Process data and add to usable list
        let to_be_processed = this.state_by_date[edit];
        var parks = [];
        var work = [];
        var retail = [];
        var residential = [];
        var grocery = [];
        var all = [];
        for (var key in to_be_processed) {
            var to_add_parks = {
                date: new Date(key),
                data: parseInt(to_be_processed[key].park_change)
            }
            var to_add_work = {
                date: new Date(key),
                data: to_be_processed[key].work_change
            }
            var to_add_residential = {
                date: new Date(key),
                data: to_be_processed[key].res_change
            }
            var to_add_retail = {
                date: new Date(key),
                data: to_be_processed[key].retail_change
            }
            var to_add_grocery = {
                date: new Date(key),
                data: to_be_processed[key].grocery_change
            }
            var to_add_all = {
                date: new Date(key),
                parks: to_be_processed[key].park_change,
                work: to_be_processed[key].work_change,
                residential: to_be_processed[key].res_change,
                retail: to_be_processed[key].retail_change,
                grocery: to_be_processed[key].grocery_change
            }
            parks.push(to_add_parks);
            work.push(to_add_work);
            retail.push(to_add_retail);
            residential.push(to_add_residential);
            grocery.push(to_add_grocery)
            all.push(to_add_all);
        }


        this.activeState = activeState;
        let xscale = d3
        .scaleTime()
        .domain([new Date(this.min_date), new Date(this.max_date)])
        .range([100, 600]);
      
        let yscale = d3
        .scaleLinear()
        .domain([this.state_max[edit], this.state_min[edit]])
        .range([0, 400]);     
        



        let lineGen = d3
        .line()
        .x((d, i) => xscale(d.date))
        .y(d => yscale(d.data));

        let tooltipr = (c, type) => this.tooltipRender(c, type);
        var tooltip = d3.select("#chart-view")
        .select("div")
        .style("opacity", 0)
        .attr("class", "tooltip");

        /*
        console.log(lineGen(parks));
        d3.select("#chart-view").select("svg").append("path").attr("id", "parks").attr('class', 'parks')
        .transition().duration(1000).attr("d", lineGen(parks)).on("click", function(d, i) {
            tooltip.style("opacity", 0.8).html(tooltipr(d, this.id)).style("left", (d3.mouse(this)[0]+750) + "px");
        });

        d3.select("#chart-view").select("svg").select("#parks").selectAll("dot").data(parks).enter().append("circle")
        .attr("r", 1).attr("cx", function(d) { return xscale(d.date) }).attr("cy", function(d) {return yscale(d.data)}). on("mouseover", function(d, i) {
            console.log(this);
            tooltip.style("opacity", 0.8).html(tooltipr(d, this.id)).style("left", (d3.mouse(this)[0]+750) + "px");

        }).on("mouseout", function(d, i) {tooltip.style("opacity", 0);}) 
        */
        if (d3.select("#parks").empty()) {
            console.log(parks);
            console.log(lineGen(parks));
            d3.select("#chart-view").select("svg").append("path").attr("id", "parks").attr('class', 'parks')
            .transition().duration(1000).attr("d", lineGen(parks));
    
            console.log(lineGen(work));
            d3.select("#chart-view").select("svg").append("path").attr("id", "work").attr('class', 'work')
            .transition().duration(1000).attr("d", lineGen(work));
            
            console.log(lineGen(grocery));
            d3.select("#chart-view").select("svg").append("path").attr("id", "grocery").attr('class', 'grocery')
            .transition().duration(1000).attr("d", lineGen(grocery));
            
            console.log(lineGen(retail));

            d3.select("#chart-view").select("svg").append("path").attr("id", "retail").attr('class', 'retail')
            .transition().duration(1000).attr("d", lineGen(retail));
            
            console.log(lineGen(residential));

            d3.select("#chart-view").select("svg").append("path").attr("id", "residential").attr('class', 'residential')
            .transition().duration(1000).attr("d", lineGen(residential));

        }
        else {  
            console.log(parks);

            d3.select("#parks").transition().duration(1000).attr("d", lineGen(parks));
    
            d3.select("#work").transition().duration(1000).attr("d", lineGen(work));
            
            d3.select("#grocery").transition().duration(1000).attr("d", lineGen(grocery));
            
            d3.select("#retail").transition().duration(1000).attr("d", lineGen(retail));
            
            d3.select("#residential").transition().duration(1000).attr("d", lineGen(residential));


        }
        d3.select("#chart-view").select("svg").selectAll("path").data(all).enter().append("circle").attr("r", 0.5).attr("cx", function(d, i) {
            return xscale(d.date);
        }).attr("cy", function(d, i) {

        })

    }

    /**
     * Setting up the drop-downs
     * @param xIndicator identifies the values to use for the x axis
     * @param yIndicator identifies the values to use for the y axis
     * @param circleSizeIndicator identifies the values to use for the circle size
     */
    drawDropDown(xIndicator, yIndicator, circleSizeIndicator) {

        let that = this;
        let dropDownWrapper = d3.select('.dropdown-wrapper');
        let dropData = [];

        for (let key in this.data) {
            dropData.push({
                indicator: key,
                indicator_name: this.data[key][0].indicator_name
            });
        }

        /* CIRCLE DROPDOWN */
        let dropC = dropDownWrapper.select('#dropdown_c').select('.dropdown-content').select('select');

        let optionsC = dropC.selectAll('option')
            .data(dropData);


        optionsC.exit().remove();

        let optionsCEnter = optionsC.enter()
            .append('option')
            .attr('value', (d, i) => d.indicator);

        optionsCEnter.append('text')
            .text((d, i) => d.indicator_name);

        optionsC = optionsCEnter.merge(optionsC);

        let selectedC = optionsC.filter(d => d.indicator === circleSizeIndicator)
            .attr('selected', true);

        dropC.on('change', function(d, i) {
            let cValue = this.options[this.selectedIndex].value;
            let xValue = dropX.node().value;
            let yValue = dropY.node().value;
            that.updatePlot(that.activeYear, xValue, yValue, cValue);
        });

        /* X DROPDOWN */
        let dropX = dropDownWrapper.select('#dropdown_x').select('.dropdown-content').select('select');

        let optionsX = dropX.selectAll('option')
            .data(dropData);

        optionsX.exit().remove();

        let optionsXEnter = optionsX.enter()
            .append('option')
            .attr('value', (d, i) => d.indicator);

        optionsXEnter.append('text')
            .text((d, i) => d.indicator_name);

        optionsX = optionsXEnter.merge(optionsX);

        let selectedX = optionsX.filter(d => d.indicator === xIndicator)
            .attr('selected', true);

        dropX.on('change', function(d, i) {
            let xValue = this.options[this.selectedIndex].value;
            let yValue = dropY.node().value;
            let cValue = dropC.node().value;
            that.updatePlot(that.activeYear, xValue, yValue, cValue);
        });

        /* Y DROPDOWN */
        let dropY = dropDownWrapper.select('#dropdown_y').select('.dropdown-content').select('select');

        let optionsY = dropY.selectAll('option')
            .data(dropData);

        optionsY.exit().remove();

        let optionsYEnter = optionsY.enter()
            .append('option')
            .attr('value', (d, i) => d.indicator);

        optionsY = optionsYEnter.merge(optionsY);

        optionsYEnter.append('text')
            .text((d, i) => d.indicator_name);

        let selectedY = optionsY.filter(d => d.indicator === yIndicator)
            .attr('selected', true);

        dropY.on('change', function(d, i) {
            let yValue = this.options[this.selectedIndex].value;
            let xValue = dropX.node().value;
            let cValue = dropC.node().value;
            that.updatePlot(that.activeYear, xValue, yValue, cValue);
        });

    }

    /**
     * Draws the year bar and hooks up the events of a year change
     */
    drawYearBar() {

        // ******* TODO: PART 2 *******
        //The drop-down boxes are set up for you, but you have to set the slider to updatePlot() on activeYear change

        // Create the x scale for the activeYear;
        // hint: the domain should be max and min of the years (1800 - 2020); it's OK to set it as numbers
        // the plot needs to update on move of the slider

        /* ******* TODO: PART 3 *******
        You will need to call the updateYear() function passed from script.js in your activeYear slider
        */
        let that = this;

        //Slider to change the activeYear of the data
        let yearScale = d3.scaleLinear().domain([1800, 2020]).range([30, 730]);

        let yearSlider = d3.select('#activeYear-bar')
            .append('div').classed('slider-wrap', true)
            .append('input').classed('slider', true)
            .attr('type', 'range')
            .attr('min', 1800)
            .attr('max', 2020)
            .attr('value', this.activeYear);

        let sliderLabel = d3.select('.slider-wrap')
            .append('div').classed('slider-label', true)
            .append('svg');

        let sliderText = sliderLabel.append('text').text(this.activeYear);

        let update = year => {
            this.updatePlot(year, this.xIndicator, this.yIndicator, this.circleSizeIndicator);
            this.updateYear(year);
        }
        sliderText.attr('x', yearScale(this.activeYear));
        sliderText.attr('y', 25);
       
        yearSlider.on('input', function() {
            const value = this.value;
            update(value);
        });
        
    }

    drawLegend() {

        let keys = ["Retail Stores", "Grocery Stores", "Parks", "Residential Areas", "Workplaces"];
        var color = d3.scaleOrdinal().domain(keys).range(d3.schemeSet1);

        let legend = d3.select("#chart-view").select("svg").append("g");
        legend.attr("class", "legend").attr("x", 500).attr("y" , 50).selectAll("rect")
        .data(keys).enter().append("rect").attr("x", 75).attr("y", function(d, i) {return 450 + (i*22)})
        .attr("width", 20).attr("height", 20).style("fill", function(d) {return color(d)})

        legend.attr("class", "legend").attr("x", 500).attr("y" , 50).selectAll("text")
        .data(keys).enter().append("text").attr("x", 100).attr("y", function(d, i) {return 465 + (i*22)})
        .attr("width", 20).attr("height", 20).style("fill", function(d) {return color(d)}).text(function(d) {return d})

    }

    /**
     * Reacts to a highlight/click event for a country; draws that country darker
     * and fades countries on other continents out
     * @param activeCountry
     */
    updateHighlightClick(activeCountry) {
        /* ******* TODO: PART 3*******
        //You need to assign selected class to the target country and corresponding region
        // Hint: If you followed our suggestion of using classes to style
        // the colors and markers for countries/regions, you can use
        // d3 selection and .classed to set these classes on here.
        // You will not be calling this directly in the gapPlot class,
        // you will need to call it from the updateHighlight function in script.js
        */
        // this.activeCountry = activeCountry;
        let region = d3.select('#chart-view').select('#' + activeCountry)._groups[0][0].className.baseVal;
        d3.select('#chart-view').selectAll('circle').style("opacity", 0.2);
        d3.select('#chart-view').selectAll('.' + region).style("opacity", 1);
        d3.select('#chart-view').select('#' + activeCountry).classed('selected-country', true);

    }

    /**
     * Clears any highlights
     */
    clearHighlight() {
        // ******* TODO: PART 3*******
        // Clear the map of any colors/markers; You can do this with inline styling or by
        // defining a class style in styles.css

        // Hint: If you followed our suggestion of using classes to style
        // the colors and markers for hosts/teams/winners, you can use
        // d3 selection and .classed to set these classes off here.
        d3.select('#chart-view').selectAll('circle').style("opacity", 1).classed('selected-country', false);
    }

    /**
     * Returns html that can be used to render the tooltip.
     * @param data 
     * @returns {string}
     */
    tooltipRender(d, type) {
        var text;
        if (type == "parks") {
            text = "<h2> Park Change: " + d.parks + " on " + d.date + "</h2>";

        }
        else if (type == "retail") {
            text = "<h2> Retail Change: " + d.retail + " on " + d.date + "</h2>";

        }
        else if (type == "work") {
            text = "<h2> Workplace Change: " + d.work + " on " + d.date + "</h2>";

        }
        else if (type == "grocery") {
            text = "<h2> Grocery Change: " + d.grocery + " on " + d.date + "</h2>";

        }
        else {
            text = "<h2> Residential Change: " + d.residential + " on " + d.date + "</h2>";
        }
        return text;
    }

}