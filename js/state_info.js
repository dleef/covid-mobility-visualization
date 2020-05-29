/** Data structure for the data associated with an individual country. */
class InfoBoxData {
    /**
     *
     * @param country name of the active country
     * @param region region of the active country
     * @param indicator_name the label name from the data category
     * @param value the number value from the active year
     */
    constructor(country, region, indicator_name, value) {
        this.country = country;
        this.region = region;
        this.indicator_name = indicator_name;
        this.value = value;
    }
}

/** Class representing the highlighting and selection interactivity. */
class InfoBox {
    /**
     * Creates a InfoBox Object
     * @param data the full data array
     */
    constructor(data) {
        this.data = data;
    }

    /**
     * Renders the country description
     * @param activeCountry the IDs for the active country
     * @param activeYear the year to render the data for
     */
    updateTextDescription(activeCountry, activeYear) {
        // ******* TODO: PART 4 *******
        // Update the text elements in the infoBox to reflect:
        // Selected country, region, population and stats associated with the country.
        console.log("ACTIVE COUNTRY: ", activeCountry);
        console.log("ACTIVE YEAR: ", activeYear);

        let pop = d3.values(this.data['population']);
        let gdp = d3.values(this.data['gdp']);
        let ferility = d3.values(this.data['fertility-rate']);
        let life = d3.values(this.data['life-expectancy']);
        let mortality = d3.values(this.data['child-mortality']);
        var region;
        var country;
        var infoData = [];

        pop.forEach(p => {

            if (p.geo.toUpperCase() == activeCountry) {
                region = p.region;
                country = p.country;
                infoData.push(new InfoBoxData(p.country, p.region, 'Population', p[activeYear]));
            }
        })
        gdp.forEach(p => {

            if (p.geo.toUpperCase() == activeCountry) {
                infoData.push(new InfoBoxData(p.country, region, p.indicator_name, p[activeYear]));
            }
        })
        ferility.forEach(p => {

            if (p.geo.toUpperCase() == activeCountry) {
                infoData.push(new InfoBoxData(p.country, region, p.indicator_name, p[activeYear]));
            }
        })
        life.forEach(p => {

            if (p.geo.toUpperCase() == activeCountry) {
                infoData.push(new InfoBoxData(p.country, region, p.indicator_name, p[activeYear]));
            }
        })
        mortality.forEach(p => {

            if (p.geo.toUpperCase() == activeCountry) {
                infoData.push(new InfoBoxData(p.country, region, p.indicator_name, p[activeYear]));
            }
        })

        d3.select("#country-detail").selectAll("*").remove();
        d3.select("#country-detail").append("div")
        .attr('class', 'label').text(country);

        infoData.forEach(entry => {
        let cur = d3.select("#country-detail").append("div")
        .attr('class', 'stat').append('text').text(entry.indicator_name + ": ");
        
        cur.append('text').text(entry.value).style("font-weight", 1000);
        })

        /*
         * You will need to get an array of the values for each category in your data object
         * hint: you can do this by using Object.values(this.data)
         * you will then need to filter just the activeCountry data from each array
         * you will then pass the data as paramters to make an InfoBoxData object for each category
         *
         */



        //TODO - Your code goes here - 


    }

    /**
     * Removes or makes invisible the info box
     */
    clearHighlight() {

        d3.select("#country-detail").selectAll("*").remove();

        //TODO - Your code goes here - 
    }

}