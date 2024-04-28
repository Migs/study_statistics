import { fetch_data } from './read_data.js';

// Global data from the study csv
let studyData;

/**
 * violinStatistics
 * 
 * Purpose: Generates a violin plot visualization for study performance data.
 * Populates a dropdown menu for selecting demographic variables and test scores.
 * Renders the violin plot based on the selected variables.
 * 
 * @param {string} containerId - The ID of the HTML element where the visualization will be rendered.
 */
export function violinStatistics(containerId){
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
        <select id="score">
            <option value="math_score">Math Score</option>
            <option value="reading_score">Reading Score</option>
            <option value="writing_score">Writing Score</option>
        </select>

        <div id="visualization" class="horizontalitem"></div>
        `;

        // place the content in the html
        document.getElementById(containerId).innerHTML = tabContent;

        // Set an onchange listener for the drop down tabs
        document.getElementById("dropdown1").addEventListener("change", updateVisualization);
        document.getElementById("score").addEventListener("change", updateVisualization);

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

    // get the dropdown values
    var dropdown1Value = document.getElementById("dropdown1").value;
    var score = document.getElementById("score").value;

    // clear the visualization location
    d3.select("#visualization").selectAll("*").remove();
    
    // calls loadViolinVisualizations to add violin plots
    loadViolinVisualizations(dropdown1Value, score);
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
 * loadViolinVisualizations
 * 
 * Purpose: Generates a violin plot grouping by the column name and binning by a score.
 * 
 * @param {string} columnName - The name of the column to group together.
 * @param {string} scoreName - The name of the score to display.
 */
function loadViolinVisualizations(columnName, scoreName){
    const margin = {top: 15, right: 40, bottom: 40, left: 50}
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    console.log(scoreName);

    const svg = d3.select("#visualization")
                    .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)                
                    .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const xScale = d3.scaleBand()
                    .domain(studyData.map(data => data[columnName]))
                    .range([0, width])
                    .padding(0.05);

    const yScale = d3.scaleLinear()
                    .domain([0, d3.max(studyData, d => d[scoreName])])
                    .nice()
                    .range([height, 0]);

    //**************************************************************************
    // Note: This portion of code was taken from this website and repurposed to
    // fit my use case:
    // https://d3-graph-gallery.com/graph/violin_basicHist.html
    var histogram = d3.bin()
                        .domain(yScale.domain())
                        .thresholds(yScale.ticks(20));

    var sumstat = d3.group(studyData, data => data[columnName]);

    var sumstatArray = Array.from(sumstat, ([key, value]) => {
            var input = value.map(data => +data[scoreName]);
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
        .text(printName(scoreName) + " vs. " + printName(columnName));

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
        .text(printName(scoreName));
}