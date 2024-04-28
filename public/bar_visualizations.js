import { fetch_data } from './read_data.js';

let studyData;

/**
 * barStatistics
 * 
 * Purpose: Generates bar graph visualization for study performance data.
 * Counts the number of students of one group and displays that based on another group
 * 
 * @param {string} containerId - The ID of the HTML element where the visualization will be rendered.
 */
export function barStatistics(containerId){
    // call fetch_data to obtain the csv data from study_performance.csv
        fetch_data('../data/study_performance.csv').then(Data => {

        // set data as global variable
        studyData = Data;

        // the content to be placed into the html
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
            <div id="visualization" class="horizontalitem"></div>
        `;
        // place the content in the html
        document.getElementById(containerId).innerHTML = tabContent;

        // Set an onchange listener for the drop down tabs
        document.getElementById("dropdown1").addEventListener("change", updateVisualization);
        document.getElementById("dropdown2").addEventListener("change", updateVisualization);

        // calls the updateVisualization function
        updateVisualization();
    })
    .catch(error => {
        console.error(error)
    })
}

/**
 * updateVisualization
 * 
 * Purpose: Clears the visualization location to add other visualizations depending
 *          on the drop downs.
 */
function updateVisualization(){
    // Get the drop down values
    var dropdown1Value = document.getElementById("dropdown1").value;
    var dropdown2Value = document.getElementById("dropdown2").value;

    // removes everything in the visualization div
    d3.select("#visualization").selectAll("*").remove();
    
    // Calls loadBarCountVisualizations
    loadBarCountVisualizations(dropdown1Value, dropdown2Value);
}

/**
 * printTitle
 * 
 * Purpose: Translates column names to more descriptive names for printing purposes.
 * 
 * @param {string} columnName - The name of the column to be translated
 * @returns {string} - the translated column name
 */
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

/**
 * genreateColors
 * 
 * Purpose: To generate colors depending on the length of a category.
 * 
 * @param {string} length - Generate a random color to assign depending on the length
 * @returns {string} - An array of colors to be used in visualizations
 */
function generateColors(length) {

    var colors = d3.scaleOrdinal(d3.schemeCategory10);
    return Array.from({ length: length }, (_, i) => colors(i));
}

/**
 * loadViolinVisualizations
 * 
 * Purpose: Creates bar count plots based on two groups
 * 
 * @param {string} column1 - The column to group by.
 * @param {string} column2 - The column to count.
 */
function loadBarCountVisualizations(column1, column2){

    // get the names of the groups that are being counted
    var subGroup = [...new Set(studyData.map(d => d[column2]))];
    subGroup.sort();    // sort list

    // define margins height and width
    const margin = { top: 50, right: 40, bottom: 40, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // group by column 1 and count column 2
    var groups = d3.rollup(
      studyData,
      (v) => v.length,
      (d) => d[column1],
      (d) => d[column2]
    );
    
    // obtain the max count. This is used to set the axis height
    var maxCount = d3.max(
      Array.from(groups.values()).map((d) => d3.max(d.values()))
    );
    
    // append an svg for visualization
    const svg = d3.select("#visualization")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    // The scale of the outer group
    const xScale1 = d3.scaleBand()
      .domain([...groups.keys()])
      .rangeRound([0, width])
      .paddingInner(0.1);
    
    // The scale of the inner group
    const xScale2 = d3.scaleBand()
      .domain(subGroup)
      .rangeRound([0, xScale1.bandwidth()])
      .padding(0.05);
    
    // The scale of the y axis
    const yScale = d3.scaleLinear()
      .domain([0, maxCount])
      .nice()
      .range([height, 0]);
    
    // The colors scale
    const colorScale = d3.scaleOrdinal()
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
            return "translate(" + xScale1(d[0]) + ",0)";
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
            return xScale2(d.key);
        })
        .attr("y", function(d) {
            return yScale(d.value);
        })
        .attr("width", xScale2.bandwidth())
        .attr("height", function(d) {
            return height - yScale(d.value);
        })
        .attr("fill", function(d) {
            return colorScale(d.key);
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
      .call(d3.axisBottom(xScale1));
    
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