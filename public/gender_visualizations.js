import { fetch_data } from '../public/read_data.js';

let studyData;

export function genderStatistics(containerId){
        fetch_data('../data/study_performance.csv').then(Data => {

            studyData = Data;

            const tabContent = `
                <div class="tab">
                    <button class="tablinks" data-tab="visualization1">Gender and Scores</button>
                    <button class="tablinks" data-tab="visualization2">Gender and Ethnicity</button>
                    <button class="tablinks" data-tab="visualization3">Gender and Parent Education</button>
                    <button class="tablinks" data-tab="visualization4">Gender and Lunch Type</button>
                    <button class="tablinks" data-tab="visualization5">Gender and Prep Course</button>
                </div>
                <div id="visualization1" class="tabcontent"></div>
                <div id="visualization2" class="tabcontent"></div>
                <div id="visualization3" class="tabcontent"></div>
                <div id="visualization4" class="tabcontent"></div>
                <div id="visualization5" class="tabcontent"></div>

            `;

            document.getElementById(containerId).innerHTML = tabContent;

            const btns = document.querySelectorAll(".tablinks");

            btns.forEach(function(currentBtn){
                currentBtn.addEventListener("click", function(event){
                    const tabName = this.getAttribute("data-tab");
                    openTab(event, tabName);
                })
            })

            loadGenderVisualizations('visualization3', studyData);
        })
        .catch(error => {
            console.error(error)
        })
}

function openTab(event, tabName){
    const tabcontents = document.getElementsByClassName("tabcontent");
    for(var tabcontent of tabcontents){
        tabcontent.style.display="none";
    }

    document.getElementById(tabName).style.display = "block";
    
    loadGenderVisualizations(tabName);
}

function loadGenderVisualizations(tabName){

        document.getElementById(tabName).innerHTML = '';

        if(tabName === "visualization1"){
            genderTestScores(tabName);
        }
        if(tabName === "visualization2"){
            genderStatisticsByColumnName(tabName, "race_ethnicity");
        }
        if(tabName == "visualization3"){
            genderStatisticsByColumnName(tabName, "parental_level_of_education");
        }
        if(tabName == "visualization4"){
            genderStatisticsByColumnName(tabName, "lunch");
        }
        if(tabName == "visualization5"){
            genderStatisticsByColumnName(tabName, "test_preparation_course");
        }
}

function printTitle(columnName){
    var name = columnName
    switch(columnName){
        case "race_ethnicity":
            name = "Ethnicity";
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
    }
    return name;
}

function printScoreName(scoreName){
    
    var name = scoreName
    switch(scoreName){
        case 'math_score':
            name = "Math Score";
            break;
        case 'reading_score':
            name =  "Reading Score";
            break;
        case 'writing_score':
            name = "Writing Score";
            break;
    }
    return name;
}

function generateColors(length) {

    var colors = d3.scaleOrdinal(d3.schemeCategory10);
    return Array.from({ length: length }, (_, i) => colors(i));
}

function genderStatisticsByColumnName(tabName, columnName){
    var subGroup = [...new Set(studyData.map(d => d[columnName]))];
    subGroup.sort();

    const margin = { top: 50, right: 40, bottom: 40, left: 50 };
    const width = 460 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    var groups = d3.rollup(
      studyData,
      (v) => v.length,
      (d) => d.gender,
      (d) => d[columnName]
    );
    
    var maxCount = d3.max(
      Array.from(groups.values()).map((d) => d3.max(d.values()))
    );
    
    const svg = d3
      .select(`#${tabName}`)
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
            return color(d.key);4
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
    .text(printTitle(columnName) + " by Gender");

}

function genderTestScores(tabName){
    const margin = {top: 15, right: 40, bottom: 40, left: 50}
    const width = 460 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const test_scores = ["math_score", "reading_score", "writing_score"]

    for(var i in test_scores){
        const div = d3.select(`#${tabName}`)
                        .append("div")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom);

        const svg = div.append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const xScale = d3.scaleBand()
                        .domain(studyData.map(data => data.gender))
                        .range([0, width])
                        .padding(0.05);

        const yScale = d3.scaleLinear()
                        .domain([0, d3.max(studyData, d => d[test_scores[i]])])
                        .nice()
                        .range([height, 0]);

        //**************************************************************************
        // Note: This portion of code was taken from this website and repurposed my 
        // use case:
        // https://d3-graph-gallery.com/graph/violin_basicHist.html
        var histogram = d3.bin()
                            .domain(yScale.domain())
                            .thresholds(yScale.ticks(20));

        var sumstat = d3.group(studyData, data => data.gender);

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
            .text(printScoreName(test_scores[i]) + " V.S. Gender");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .text("Gender");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height/2)
            .attr("y", -margin.left / 2)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .text(printScoreName(test_scores[i]));
    }
}