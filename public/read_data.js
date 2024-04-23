export function fetch_data(url){
    try{
        const response = d3.csv(url);
        return response;
    }
    catch (error){
        console.error('Error fetching data:', error);
        return null;
    }
}