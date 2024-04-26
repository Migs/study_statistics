import { fetch_data } from './read_data.js';

let studyData;

export function violinStatistics(containerId){
        fetch_data('../data/study_performance.csv').then(Data => {

            studyData = Data;

            const tabContent = `
            <select id="dropdown1">
                <option value="gender">Gender</option>
                <option value="race_ethnicity">Ethnicity</option>
                <option value="parental_level_of_education">Parent Level</option>
                <option value="lunch">Lunch Type</option>
                <option value="test_preparation_course">Test Preperation Course</option>
            </select>

            <div id="visualization"></div>
            `;

            document.getElementById(containerId).innerHTML = tabContent;

            document.getElementById("dropdown1").addEventListener("change", updateVisualization);

            updateVisualization();
        })
        .catch(error => {
            console.error(error)
        })
}

function updateVisualization(){
    var dropdown1Value = document.getElementById("dropdown1").value;

    d3.select("#visualization").selectAll("*").remove();
    
    loadViolinVisualizations(dropdown1Value);
}


function printName(columnName){
    
    var name = columnName
    switch(columnName){
        case 'math_score':
            name = "Math Score";
            break;
        case 'reading_score':
            name =  "Reading Score";
            break;
        case 'writing_score':
            name = "Writing Score";
            break;
        case "race_ethnicity":
            name = "Ethnicity";
            break;
        case "parental_level_of_education":
            name = "Parent's Education Level ";
            break;
        case "lunch":
            name = "Lunch Type";
            break;
        case "test_preparation_course":
            name = "Prep Course Completion";
            break;
        case "gender":
            name = "Gender";
            break;
    }
    return name;
}

function loadViolinVisualizations(columnName){
    const margin = {top: 15, right: 40, bottom: 40, left: 50}
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const test_scores = ["math_score", "reading_score", "writing_score"]

    for(var i in test_scores){
        const div = d3.select("#visualization")
                        .append("div")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom);

        const svg = div.append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const xScale = d3.scaleBand()
                        .domain(studyData.map(data => data[columnName]))
                        .range([0, width])
                        .padding(0.05);

        const yScale = d3.scaleLinear()
                        .domain([0, d3.max(studyData, d => d[test_scores[i]])])
                        .nice()
                        .range([height, 0]);

        //**************************************************************************
        // Note: This portion of code was taken from this website and repurposed to
        // fir my use case:
        // https://d3-graph-gallery.com/graph/violin_basicHist.html
        var histogram = d3.bin()
                            .domain(yScale.domain())
                            .thresholds(yScale.ticks(20));

        var sumstat = d3.group(studyData, data => data[columnName]);

        var sumstatArray = Array.from(sumstat, ([key, value]) => {
                var input = value.map(data => +data[test_scores[i]]);
                var bins = histogram(input);
                return { key: key, value: bins};
            });

        var maxNum = d3.max(sumstatArray, d => d3.max(d.value, v=>v.length));

        var xNum = d3.scaleLinear()
                    .range([0, xScale.bandwidth()])
                    .domain([-maxNum, maxNum]);


        svg.selectAll("path")
        .data(sumstatArray)
        .enter()
        .append("g")
            .attr("transform", function(data){return("translate(" + xScale(data.key) + " ,0)")})
        .append("path")
        .datum(data => data.value)
        .style("stroke", "none")
        .style("fill", "purple")
        .attr("d", d3.area()
                        .x0(data => xNum(-data.length))
                        .x1(data => xNum(data.length))
                        .y(data => yScale(data.x0))
                        .curve(d3.curveCatmullRom)
            );
        //**************************************************************************
        
        svg.append("g").call(d3.axisLeft(yScale));
        svg.append("g")
            .attr("transform", "translate(0," + height + ")" )
            .call(d3.axisBottom(xScale));

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .text(printName(test_scores[i]) + " vs. " + printName(columnName));

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .text(printName(columnName));

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height/2)
            .attr("y", -margin.left / 2)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .text(printName(test_scores[i]));
    }
}