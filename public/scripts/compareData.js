import transportLogs from "./journeyInput.js";
import { calculateJourneyStats } from "./calculateValues.js";

function compareWithCar(journeyInput){
    const userStats = calculateStats(journeyInput.method, journeyInput.distanceKM);
    const carStats = calculateStats("car", journeyInput.distanceKM);

    if(!userStats || !carStats){
        console.log(`Unknown method: ${journeyInput.distnaceKM}`);
        return null;
    }

    return{
        method: journeyInput.method,
        distnaceKM: journeyInput.distanceKM,

        timeDifferenceHours: (userStats.time - carStats.time).toFixed(2),
        co2SavedKG: (carStats.co2 - userStats.co2).toFixed(2),
        extraCaloriesBurned: (userStats.calories - carStats.calories).toFixed(0)
    };
}

const comparisonResults = transportLogs.map(compareWithCar);

console.log("Comparison vs Driving Car:");
console.log(comparisonResults); 