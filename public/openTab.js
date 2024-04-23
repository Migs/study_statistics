function openTab(event, tabName){
    const tabcontents = document.getElementsByClassName("tabcontent");
    for(var tabcontent of tabcontents){
        tabcontent.style.display="none";
    }

    document.getElementById(tabName).style.display = "block";
    
    // loadGenderVisualizations(tabName, studyData)
}