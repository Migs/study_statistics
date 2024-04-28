import { fetch_data } from './read_data.js';

let studyData;

/**
 * scatterVisualizations
 * 
 * Purpose: Generates a scatter plot based on two of the three test scores and color codes them based
 *          on a group.
 * 
 * @param {string} containerId - The ID of the HTML element where the visualization will be rendered.
 */
export function scatterVisualizations(containerId){
    fetch_data('../data/study_performance.csv').then(Data => {

        studyData = Data;

        const tabContent = `
            <select id="xaxis">
                <option value="math_score">Math Score</option>
                <option value="reading_score">Reading Score</option>
                <option value="writing_score">Writing Score</option>
            </select>
            <select id="yaxis">
                <option value="math_score">Math Score</option>
                <option value="reading_score">Reading Score</option>
                <option value="writing_score">Writing Score</option>
            </select>
            <select id="group">
                <option value="gender">Gender</option>
                <option value="race_ethnicity">Ethnicity</option>
                <option value="parental_level_of_education">Parent Level</option>
                <option value="lunch">Lunch Type</option>
                <option value="test_preparation_course">Test Preperation Course</option>
            </select>
            <div id="visualization" class="horizontalitem"></div>
        `;

        document.getElementById(containerId).innerHTML = tabContent;

        document.getElementById("xaxis").addEventListener("change", updateVisualization);
        document.getElementById("yaxis").addEventListener("change", updateVisualization);
        document.getElementById("group").addEventListener("change", updateVisualization);

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
    var xAxisValue = document.getElementById("xaxis").value;
    var yAxisValue = document.getElementById("yaxis").value;
    var group = document.getElementById("group").value;

    d3.select("#visualization").selectAll("*").remove();
    loadScatterClusterVisualizations(xAxisValue, yAxisValue, group);
}

/**
 * printName
 * 
 * Purpose: Translates column names to more descriptive names for printing purposes.
 * 
 * @param {string} columnName - The name of the column to be translated
 * @returns {string} - the translated column name
 */
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

/**
 * loadScatterClusterVisualizations
 * 
 * Purpose: Generate a scatter plot with desired scores on the x and y axis
 *          as well as a group to color code the circles by.
 * 
 * @param {string} xAxisValue - The score to display on the x-axis
 * @param {string} yAxisValue - The score to display on the y-axis
 * @param {string} group - The group to color code things by
 */
function loadScatterClusterVisualizations(xAxisValue, yAxisValue, group){
    const margin = {top: 15, right: 40, bottom: 40, left: 50}
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#visualization")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.bottom + margin.top);

    const xScale = d3.scaleLinear()
            .domain([0, d3.max(studyData, d => +d[xAxisValue])*1.05])
            .range([margin.left, width]);

    const yScale = d3.scaleLinear()
            .domain([0, d3.max(studyData, d => +d[yAxisValue])*1.05])
            .range([height, margin.bottom]);

    const colorScale = d3.scaleOrdinal()
            .domain(studyData.map(data => data[group]))
            .range(d3.schemeCategory10);

    svg.append("g")
        .selectAll("circle")
        .data(studyData)
        .enter()
        .append("circle")
            .attr("cx", d=> xScale(+d[xAxisValue]))
            .attr("cy", d=> yScale(+d[yAxisValue]))
            .attr("r", 4)
            .style("fill", d => colorScale(d[group]))
        .on("mouseover", function(event, d) {
            d3.select(this).attr("opacity", 0.7);
            svg.append("text")
                .attr("class", "hover-text")
                .attr("x", width / 2)
                .attr("y", margin.top)
                .attr("text-anchor", "middle")
                .text(`${printName(xAxisValue)}: ${d[xAxisValue]}
                    ${printName(yAxisValue)}: ${d[yAxisValue]}
                    ${printName(group)}: ${d[group]}`)
            })
        .on("mouseout", function(d) {
            d3.select(this).attr("opacity", 1);
            svg.select(".hover-text").remove();
        });

    svg.append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(d3.axisLeft(yScale));

    svg.append("g")
        .attr("transform", "translate(0," + height + ")" )
        .call(d3.axisBottom(xScale));
}