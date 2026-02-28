import transportLogs from "./journeyInput.js";

/*
Average speed (km/hour)
CO2 values = kg per km
Calories =kcal per km
*/

export const transportStats = {
    car: {speed: 60, co2: 0.21, calories: 0},
    bus: {speed: 40, co2: 0.10, calories: 0},
    train: {speed: 80, co2: 0.05, calories: 0},
    bike: {speed: 15, co2: 0, calories: 40},
    walk: {speed: 5, co2: 0, calories: 60},
};

export function calculateJourneyStats(journeyInput){
    const stats = transportStats[journeyInput.method];

    if(!stats){
        console.log(`Unknown transport method: ${journeyInput.method}`);
        return null;
    }

    const travelTimeHours = journeyInput.distanceKM / stats.speed;
    const co2Emissions = journeyInput.distanceKM * stats.co2;
    const caloriesBurned = journeyInput.distanceKM * stats.calories;

    return{
        ...journeyInput,
        travelTimeHours: travelTimeHourse.toFixed(2),
        co2kg: co2Emissions.toFixed(2),
        calories: caloriesBurned.toFixed(0)
    };
}

// Process all journeys
const results = transportLogsLogs.map(calculateJourneyStats);

console.log("Journey Analytics:");
console.log(results);