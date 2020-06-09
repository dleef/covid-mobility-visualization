class StateInfoData {

    constructor(state, positive, deaths, hospitalized, date) {
        this.state = state;
        this.positive = positive;
        this.deaths = deaths;
        this.hospitalized = hospitalized;
        this.date = date;
    }
}

class StateInfo {

    constructor(data) {
        this.data = data;
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


    updateTextDescription(activeState, activeDate) {
        
        let covid = d3.values(this.data.covid);
        var info = null;

        let new_state = activeState.replace("-", " ");
        covid.forEach(p => {
            let string_date = "" + p.date;
            let new_string_date = string_date.slice(0, 4) + "-" + string_date.slice(4,6) + "-" + string_date.slice(6, 8);
            let date = new_string_date;
            if (date == activeDate && p.state == this.state_abbrev[new_state]) {
                info = new StateInfoData(activeState, p.positive == null ? -1 : p.positive, p.death == null ? -1 : p.death, p.hospitalizedCurrently == null ? (p.hospitalizedCumulative == null ? -1 : p.hospitalizedCumulative) : p.hospitalizedCurrently, activeDate);
            }
        });
        d3.select("#country-detail").selectAll("*").remove();
        d3.select("#country-detail").append("div")
        .attr('class', 'label').text(new_state);

        let cur = d3.select("#country-detail").append("div")
        .attr('class', 'stat').append('text').text("Positive Cases: ");
        if (info.positive == -1) {
            cur.append('text').text(" - ").style("font-weight", 1000);
        }
        else {
            cur.append('text').text(info.positive).style("font-weight", 1000);
        }

        let cur2 = d3.select("#country-detail").append("div")
        .attr('class', 'stat').append('text').text("Deaths: ");
        if (info.deaths == -1) {
            cur2.append('text').text(" - ").style("font-weight", 1000);
        }
        else {
            cur2.append('text').text(info.deaths).style("font-weight", 1000);
        }

        let cur3 = d3.select("#country-detail").append("div")
        .attr('class', 'stat').append('text').text("Hospitalized: ");
        if (info.hospitalized == -1) {
            cur3.append('text').text(" - ").style("font-weight", 1000);
        }
        else {
            cur3.append('text').text(info.hospitalized).style("font-weight", 1000);
        }

        let cur4 = d3.select("#country-detail").append("div")
        .attr('class', 'stat').append('text').text("Date: ");
        if (info.date == -1) {
            cur4.append('text').text(" - ").style("font-weight", 1000);
        }
        else {
            cur4.append('text').text(info.date).style("font-weight", 1000);
        }

    }

    clearHighlight() {

        d3.select("#country-detail").selectAll("*").remove();

    }

}