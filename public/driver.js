import { violinStatistics} from "./violin_visualizations.js";
import {barStatistics} from "./bar_visualizations.js";
import {correlationStatistics} from "./correlation_visualizations.js";
 
const visualizations = {
    tab1:{
        visualization1: violinStatistics
    },
    tab2:{
        visualization2: barStatistics
    },
    tab3:{
        visualization3: correlationStatistics
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