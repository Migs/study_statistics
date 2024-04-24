import { genderStatistics} from "../public/gender_visualizations.js";
import {ethnicityStatistics} from "../public/ethnicity_visualizations.js"

const visualizations = {
    tab1:{
        visualization1: genderStatistics
    },
    tab2:{
        visualization2: ethnicityStatistics
    }
};

export function loadVisualization(){
    var selectedOption = document.getElementById("visualizationSelect").value;
    var tabVisualizations = visualizations[selectedOption];

    d3.select("#visualizationContainer").selectAll("*").remove();

    Object.values(tabVisualizations).forEach(visualization => {
        visualization("visualizationContainer");
    })
}