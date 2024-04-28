import { violinStatistics} from "./violin_visualizations.js";
import {barStatistics} from "./bar_visualizations.js";
import {correlationStatistics} from "./correlation_visualizations.js";
import {scatterVisualizations} from "./scatter_visualizations.js";
 

// Define visualizations object containing different visualization functions for each tab
const visualizations = {
    // tab1 visualizations are violin plots
    tab1:{
        visualization1: violinStatistics
    },
    // tab2 visualizations are barplots
    tab2:{
        visualization2: barStatistics
    },
    // tab3 visualizations are correlation matrices
    tab3:{
        visualization3: correlationStatistics
    },
    // tab4 visualizations are scatter plots with clusters
    tab4:{
        visualization4: scatterVisualizations
    }
};

/**
 * loadVisualization
 * 
 * Purpose: Loads visualizations based on the selected option from the dropdown menu.
 *          Clears existing content in the visualization container and invokes each
 *          visualization function.
 */

export function loadVisualization(){
    // get the visualiationSelection selector value
    var selectedOption = document.getElementById("visualizationSelect").value;

    // retrieve the visualizations associated with the selected option
    var tabVisualizations = visualizations[selectedOption];

    d3.select("#visualizationContainer").selectAll("*").remove();

    // Iterate over each visualization function associated with the selected option
    Object.values(tabVisualizations).forEach(visualization => {
        // Call the visualization function, passing the ID of the visualization container
        visualization("visualizationContainer");
    })
}