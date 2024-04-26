import { fetch_data } from './read_data.js';

let studyData;

export function correlationStatistics(containerId){
    fetch_data('../data/study_performance.csv').then(Data => {

        studyData = Data;

        const tabContent = `
            <div id="visualization"></div>
        `;

        document.getElementById(containerId).innerHTML = tabContent;

        updateVisualization();
    })
    .catch(error => {
        console.error(error)
    })
}

export function updateVisualization(){
    const margin = { top: 50, right: 40, bottom: 40, left: 100 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const featuresNames = ["math_score", "writing_score", "reading_score"];

    const correlationData = [];

    for(let i=0; i<featuresNames.length; i++){
        for(let j=0; j<featuresNames.length; ++j){
            const feature1 = featuresNames[i];
            const feature2 = featuresNames[j];

            const correlation = ss.sampleCorrelation(
                studyData.map(d => +d[feature1]),
                studyData.map(d => +d[feature2])
            );

            correlationData.push({
                "feature1": feature1,
                "feature2": feature2,
                "correlation": correlation
            })
        }
    }

    var groups1 = d3.map(correlationData, d=> d.feature1);
    var groups2 = d3.map(correlationData, d=> d.feature2);

    var yScale = d3.scaleBand()
            .range([0, height])
            .domain(groups2)
            .padding(0.05);

    var xScale = d3.scaleBand()
            .range([height, 0])
            .domain(groups1)
            .padding(0.05);

    // var colorScale = d3.scaleSequential()
    //     .interpolator(d3.interpolateInferno)
    //     .domain([0,1]);

    var svg = d3.select("#visualization")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Define color scale for the heatmap
    var colorScale = d3.scaleLinear()
    .domain([-1, 1])
    .range(["red", "green"]);

    svg.selectAll()
        .data(correlationData, d=> d.feature1+ ":"+d.feature2)
        .enter()
        .append("rect")
            .attr("x", d=> xScale(d.feature1))
            .attr("y", d=> yScale(d.feature2))
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("width", xScale.bandwidth() )
            .attr("height", yScale.bandwidth() )
            .style("fill", function(d) { return colorScale(d.correlation)} )
            .style("stroke-width", 4)
            .style("stroke", "none")
            .style("opacity", 0.8);

    
    svg.selectAll()
        .data(correlationData, d=> d.feature1+ ":"+d.feature2)
        .enter()
        .append("text")
            .attr("x", d=> xScale(d.feature1)+ xScale.bandwidth() / 2)
            .attr("y", d=> yScale(d.feature2) + yScale.bandwidth() / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .text(d=> `${d.correlation.toFixed(2)}`);

    svg.append("g")
        .style("font-size", 15)
        .call(d3.axisLeft(yScale).tickSize(0))
        .select(".domain").remove()

    svg.append("g")
        .style("font-size", 15)
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).tickSize(0))
        .select(".domain").remove()
}