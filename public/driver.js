import { genderStatistics} from "../public/gender_visualizations.js";

const visualizations = {
    tab1:{
        visualization1: genderStatistics
    }
};

function loadVisualization(){
    var selectedOption = document.getElementById("visualizationSelect").value;
    var tabVisualizations = visualizations[selectedOption];

    d3.select("#visualizationContainer").selectAll("*").remove();

    Object.values(tabVisualizations).forEach(visualization => {
        visualization("visualizationContainer");
    })
}

loadVisualization();