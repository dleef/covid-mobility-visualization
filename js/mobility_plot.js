class PlotData {
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

    constructor(data, activeState) {

        this.margin = { top: 20, right: 20, bottom: 60, left: 80 };
        this.width = 1010 - this.margin.left - this.margin.right;
        this.height = 800 - this.margin.top - this.margin.bottom;
        this.min_date = null;
        this.max_date = null;
        this.by_state = {};
        this.state_by_date = {};
        this.state_max = {};
        this.state_min = {};
        this.activeState = activeState;
        this.nothover = true;
        this.mobility_data = this.USAData(data);
        this.averageData();
        this.drawPlot();
        this.drawLegend();
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

    }

    drawPlot() {
        d3.select('#scatter-plot')
            .append('div').attr('id', 'chart-view');

        d3.select('#chart-view')
            .append('svg').classed('plot-svg', true)
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        d3.select("#chart-view").select('svg').append('g').attr('id', 'x-axis').attr('transform', 'translate(0, 400)');
        d3.select("#chart-view").select('svg').append('g').attr('id', 'y-axis').attr('transform', 'translate(100, 0)');


       this.setAxes();
       d3.select("#chart-view").select('svg').append("text").attr('id', 'state-title').attr("dx", 300).attr("dy", 100).attr('class', 'activeState-background')

        
    }

    setAxes() {
        let xscale = d3
        .scaleTime()
        .domain([new Date(this.min_date), new Date(this.max_date)])
        .range([100, 800]);
      
        let yscale = d3
        .scaleLinear()
        .domain([this.state_max[this.activeState], this.state_min[this.activeState]])
        .range([80, 600]);     
        
        var x_axis = d3.axisBottom().scale(xscale);
        var y_axis = d3.axisLeft().scale(yscale);

        d3.select("#x-axis").attr("transform", "translate(0," + yscale(0) + ")").call(x_axis);
        d3.select("#y-axis").call(y_axis);
        d3.select("#chart-view").select("svg").append("text").attr("transform", "rotate(-90)").attr("y", 30)
        .attr("x", -300).attr("dy", "1em").style("text-anchor", "middle").attr("font-size", "20px").text("Percent Change in Activity");
    }
å
    updatePlot(activeState) {

        let edit = activeState.replace("-", " ");
        let to_be_processed = this.state_by_date[edit];
        var parks = [];
        var work = [];
        var retail = [];
        var residential = [];
        var grocery = [];
        var all = [];
        var all_hover = [];
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
        var p = {
            name: "Parks",
            values: parks
        }
        var w = {
            name: "Work",
            values: work
        }
        var r = {
            name: "Retail",
            values: retail
        }
        var res = {
            name: "Residential",
            values: residential
        }
        var g = {
            name: "Grocery",
            values: grocery
        }

        all_hover.push(p);
        all_hover.push(w);
        all_hover.push(r);
        all_hover.push(res);
        all_hover.push(g);

        var colors = {};
        colors["Parks"] = "green";
        colors["Grocery"] = "purple";
        colors["Retail"] = "blue";
        colors["Residential"] = "red";
        colors["Work"] = "orange";

        this.activeState = edit;
        let xscale = d3
        .scaleTime()
        .domain([new Date(this.min_date), new Date(this.max_date)])
        .range([100, 800]);
      
        let yscale = d3
        .scaleLinear()
        .domain([this.state_max[edit], this.state_min[edit]])
        .range([80, 600]);     
        

        let lineGen = d3
        .line()
        .x((d, i) => xscale(d.date))
        .y(d => yscale(d.data));

        d3.select("#state-title").text(this.activeState);


        if (d3.select("#parks").empty()) {
            d3.select("#chart-view").select("svg").append("path").attr("id", "parks").attr('class', 'mobility_line')
            .style("stroke", "green").style("stroke-width", "2px").style("fill", "none").transition().duration(1000).attr("d", lineGen(parks));
    
            d3.select("#chart-view").select("svg").append("path").attr("id", "work").attr('class', 'mobility_line')
            .style("stroke", "orange").style("stroke-width", "2px").style("fill", "none").transition().duration(1000).attr("d", lineGen(work));
            
            d3.select("#chart-view").select("svg").append("path").attr("id", "grocery").attr('class', 'mobility_line')
            .style("stroke", "blue").style("stroke-width", "2px").style("fill", "none").transition().duration(1000).attr("d", lineGen(grocery));
            
            d3.select("#chart-view").select("svg").append("path").attr("id", "retail").attr('class', 'mobility_line')
            .style("stroke", "red").style("stroke-width", "2px").style("fill", "none").transition().duration(1000).attr("d", lineGen(retail));
            
            d3.select("#chart-view").select("svg").append("path").attr("id", "residential").attr('class', 'mobility_line')
            .style("stroke", "purple").style("stroke-width", "2px").style("fill", "none").transition().duration(1000).attr("d", lineGen(residential));

        }
        else {  
            d3.select("#parks").attr("class", "mobility_line").transition().duration(1000).attr("d", lineGen(parks));
    
            d3.select("#work").attr("class", "mobility_line").transition().duration(1000).attr("d", lineGen(work));
            
            d3.select("#grocery").attr("class", "mobility_line").transition().duration(1000).attr("d", lineGen(grocery));
            
            d3.select("#retail").attr("class", "mobility_line").transition().duration(1000).attr("d", lineGen(retail));
            
            d3.select("#residential").attr("class", "mobility_line").transition().duration(1000).attr("d", lineGen(residential));


        }
        this.setAxes();
        if (this.nothover) {
            this.setHoverLine(all_hover, colors, xscale, yscale, this.activeState);
            this.nothover = false;
        }
        else {
            this.updateHoverLine(xscale, yscale, this.activeState)
        }

    }


    updateHoverLine(xscale, yscale, astate) {
        let width = 800 - this.margin.left - this.margin.right;
        let height = 675 - this.margin.top - this.margin.bottom;
        var lines = document.getElementsByClassName('mobility_line');

        this.mg.append('svg:rect')
        .attr('width', width)
        .attr('height', height)
        .attr("x", 100)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mouseout', function() {
          d3.select(".mouse-line")
            .style("opacity", "0");
          d3.selectAll(".mouse-per-line circle")
            .style("opacity", "0");
          d3.selectAll(".mouse-per-line text")
            .style("opacity", "0");
          d3.selectAll(".mouse-per-line rect")
            .style("opacity", "0");
          d3.select("#state-title").text(astate);
  
        })
        .on('mouseover', function() {
          d3.select(".mouse-line")
            .style("opacity", "1");
          d3.selectAll(".mouse-per-line circle")
            .style("opacity", "1");
          d3.selectAll(".mouse-per-line text")
            .style("opacity", "1");
        })
        .on('mousemove', function() {
          var mouse = d3.mouse(this);
          d3.select(".mouse-line")
            .attr("d", function() {
              var d = "M" + mouse[0] + "," + height;
              d += " " + mouse[0] + "," + 0;
              return d;
            });
  
          d3.selectAll(".mouse-per-line")
            .attr("transform", function(d, i) {
              var xDate = xscale.invert(mouse[0]),
                  bisect = d3.bisector(function(d) { return d.date; }).right;
                  bisect(d.values, xDate);
              let new_xdate = new Date(xDate);
              d3.select("#state-title").text(astate + ", " + new_xdate.toISOString().substring(0,10));
              var beginning = 0,
                  end = lines[i].getTotalLength(),
                  target = null;
              var pos = null;
              while (true){
                target = Math.floor((beginning + end) / 2);
                pos = lines[i].getPointAtLength(target);
                if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                    break;
                }
                if (pos.x > mouse[0])      end = target;
                else if (pos.x < mouse[0]) beginning = target;
                else break;
              }            
              
              d3.select(this).select('text')
                .text(yscale.invert(pos.y).toFixed(2) + "%").style("font-weight", "bolder").style("font-size", "14px");
  
                
              d3.select(this).insert("rect", "text")
              .attr("y", -10).attr("x", 10)
              .attr("width", 45).attr("height", 20)
              .style("fill", "white").style("opacity", 0.5);
              
              return "translate(" + mouse[0] + "," + pos.y +")";
            });
        });


    }

    // reference: https://bl.ocks.org/larsenmtl/e3b8b7c2ca4787f77d78f58d41c3da91
    setHoverLine(data, colors, xscale, yscale, astate) {

    let svg = d3.select("#chart-view").select("svg").append("g");
    let width = 800 - this.margin.left - this.margin.right;
    let height = 685 - this.margin.top - this.margin.bottom;
    var mouseG = svg.append("g")
      .attr("class", "mouse-over-effects");
    mouseG.append("path") 
      .attr("class", "mouse-line")
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .style("opacity", "0");
      
    var lines = document.getElementsByClassName('mobility_line');

    var mousePerLine = mouseG.selectAll('.mouse-per-line')
      .data(data)
      .enter()
      .append("g")
      .attr("class", "mouse-per-line");

    mousePerLine.append("circle")
      .attr("r", 7)
      .style("stroke", function(d) {
        return colors[d.name];
      })
      .style("fill", "none")
      .style("stroke-width", "1px")
      .style("opacity", "0");

    mousePerLine.append("text")
      .attr("transform", "translate(10,3)");
    
    mouseG.append('svg:rect')
      .attr('width', width)
      .attr('height', height)
      .attr("x", 100)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseout', function() {
        d3.select(".mouse-line")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line rect")
          .style("opacity", "0");
        d3.select("#state-title").text(astate);

      })
      .on('mouseover', function() {
        d3.select(".mouse-line")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "1");
      })
      .on('mousemove', function() {
        var mouse = d3.mouse(this);
        d3.select(".mouse-line")
          .attr("d", function() {
            var d = "M" + mouse[0] + "," + height;
            d += " " + mouse[0] + "," + 0;
            return d;
          });

        d3.selectAll(".mouse-per-line")
          .attr("transform", function(d, i) {
            var xDate = xscale.invert(mouse[0]),
                bisect = d3.bisector(function(d) { return d.date; }).right;
                bisect(d.values, xDate);
            let new_xdate = new Date(xDate);
            d3.select("#state-title").text(astate + ", " + new_xdate.toISOString().substring(0,10));
            var beginning = 0,
                end = lines[i].getTotalLength(),
                target = null;
            var pos = null;
            while (true){
              target = Math.floor((beginning + end) / 2);
              pos = lines[i].getPointAtLength(target);
              if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                  break;
              }
              if (pos.x > mouse[0])      end = target;
              else if (pos.x < mouse[0]) beginning = target;
              else break; //position found
            }            
            
            d3.select(this).select('text')
              .text(yscale.invert(pos.y).toFixed(2) + "%").style("font-weight", "bolder").style("font-size", "14px");

              
            d3.select(this).insert("rect", "text")
            .attr("y", -10).attr("x", 10)
            .attr("width", 45).attr("height", 20)
            .style("fill", "white").style("opacity", 0.5);
            
            return "translate(" + mouse[0] + "," + pos.y +")";
          });
      });
      this.mg = mouseG;
    }


    drawLegend() {

        let keys = ["Retail Stores", "Grocery Stores", "Parks", "Residential Areas", "Workplaces"];
        var color = d3.scaleOrdinal().domain(keys).range(d3.schemeSet1);

        let legend = d3.select("#chart-view").select("svg").append("g");
        legend.attr("class", "legend").attr("x", 500).attr("y" , 50).selectAll("rect")
        .data(keys).enter().append("rect").attr("x", function(d, i) { return 100 + 150*i - (d.length*3)}).attr("y", 20)
        .attr("width", 20).attr("height", 20).style("fill", function(d) {return color(d)})

        legend.attr("class", "legend").attr("x", 500).attr("y" , 50).selectAll("text")
        .data(keys).enter().append("text").attr("x", function(d, i) { return 125 + 150*i - (d.length*3)}).attr("y", 33)
        .attr("width", 20).attr("height", 20).style("fill", function(d) {return color(d)}).text(function(d) {return d})
        .style("font-size", "15px");
    }

}