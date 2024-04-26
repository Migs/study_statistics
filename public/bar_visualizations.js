import { fetch_data } from './read_data.js';

let studyData;

export function barStatistics(containerId){
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

                <select id="dropdown2">
                    <option value="race_ethnicity">Ethnicity</option>
                    <option value="gender">Gender</option>
                    <option value="parental_level_of_education">Parent Level</option>
                    <option value="lunch">Lunch Type</option>
                    <option value="test_preparation_course">Test Preperation Course</option>
                </select>
                <div id="visualization"></div>
            `;

            document.getElementById(containerId).innerHTML = tabContent;

            document.getElementById("dropdown1").addEventListener("change", updateVisualization);
            document.getElementById("dropdown2").addEventListener("change", updateVisualization);

            updateVisualization();
        })
        .catch(error => {
            console.error(error)
        })
}

function updateVisualization(){
    var dropdown1Value = document.getElementById("dropdown1").value;
    var dropdown2Value = document.getElementById("dropdown2").value;

    d3.select("#visualization").selectAll("*").remove();
    
    loadBarCountVisualizations(dropdown1Value, dropdown2Value);
}

function printTitle(columnName){
    var name = columnName
    switch(columnName){
        case "gender":
            name = "Gender";
            break;
        case "parental_level_of_education":
            name =  "Parent's Education Level ";
            break;
        case "lunch":
            name = "Lunch Type";
            break;
        case "test_preparation_course":
            name = "Prep Course Completion";
            break;
        case "race_ethnicity":
            name = "Ethnicity";
            break;
    }
    return name;
}

function generateColors(length) {

    var colors = d3.scaleOrdinal(d3.schemeCategory10);
    return Array.from({ length: length }, (_, i) => colors(i));
}

function loadBarCountVisualizations(column1, column2){
    var subGroup = [...new Set(studyData.map(d => d[column2]))];
    subGroup.sort();

    const margin = { top: 50, right: 40, bottom: 40, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    var groups = d3.rollup(
      studyData,
      (v) => v.length,
      (d) => d[column1],
      (d) => d[column2]
    );
    
    var maxCount = d3.max(
      Array.from(groups.values()).map((d) => d3.max(d.values()))
    );
    
    const svg = d3
      .select("#visualization")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    const x0 = d3.scaleBand()
      .domain([...groups.keys()])
      .rangeRound([0, width])
      .paddingInner(0.1);
    
    const x1 = d3.scaleBand()
      .domain(subGroup)
      .rangeRound([0, x0.bandwidth()])
      .padding(0.05);
    
    const yScale = d3.scaleLinear()
      .domain([0, maxCount])
      .nice()
      .range([height, 0]);
    
    const color = d3.scaleOrdinal()
      .domain(subGroup)
      .range(generateColors(subGroup.length));


    //**************************************************************************
    //Note: This portion of code was created with the help of ChatGPT
    svg.append("g")
        .selectAll("g")
        .data(groups.entries())
        .enter()
        .append("g")
        .attr("transform", function(d) {
            return "translate(" + x0(d[0]) + ",0)";
        })
        .selectAll("rect")
        .data(function(d) {
            return subGroup.map(function(key) {
            return { key: key, value: d[1].get(key) || 0 };
            });
        })
        .enter()
        .append("rect")
        .attr("x", function(d) {
            return x1(d.key);
        })
        .attr("y", function(d) {
            return yScale(d.value);
        })
        .attr("width", x1.bandwidth())
        .attr("height", function(d) {
            return height - yScale(d.value);
        })
        .attr("fill", function(d) {
            return color(d.key);
        })
        .on("mouseover", function(event, d) {
            d3.select(this).attr("opacity", 0.7);
            svg.append("text")
                .attr("class", "hover-text")
                .attr("x", width / 2)
                .attr("y", -margin.top /2)
                .attr("text-anchor", "middle")
                .text(`${d.key}: ${d.value}`)
            })
        .on("mouseout", function(d) {
            d3.select(this).attr("opacity", 1);
            svg.select(".hover-text").remove();
        });
    //**************************************************************************
    
    svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x0));
    
    svg.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(yScale));

    svg.append("text")
    .attr("x", width / 2)
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .text(printTitle(column1) + " by " + printTitle(column2));

    svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .text(printTitle(column1));

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height/2)
        .attr("y", -margin.left / 1.80)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text(printTitle(column2) + " Count");
}