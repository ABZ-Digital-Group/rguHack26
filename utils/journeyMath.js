/*
Average speed (km/hour)
CO2 values = kg per km
Calories =kcal per km
*/

const transportStats = {
    DRIVE: {co2: 0.21, calories: 0},
    BUS: {co2: 0.10, calories: 0},
    TRAIN: {co2: 0.05, calories: 0},
    WALK: {co2: 0, calories: 60},
    BICYCLE: {co2: 0, calories: 40},
};

function calculateValues(distance, mode) {
    const stats = transportStats[mode];
    const co2Emissions = (distance / 1000) * stats.co2;
    const caloriesBurned = (distance / 1000) * stats.calories;
    return { co2Emissions, caloriesBurned };
}
    
    
export default function calculateJourneyStats(journeyInput){
    const route = journeyInput.data[0];

    let co2Emissions = 0;
    let caloriesBurned = 0;
    if (journeyInput.mode != "TRANSIT") {
        const values = calculateValues(route.distanceMeters, journeyInput.mode);
        co2Emissions = values.co2Emissions;
        caloriesBurned = values.caloriesBurned;
    } else {
        co2Emissions = 0;
        caloriesBurned = 0;
        route.legs.forEach(leg => {
            leg.steps.forEach(step => {
                let mode = step.travelMode;
                if (mode === "TRANSIT") {
                    mode = step.transitDetails.transitLine.vehicle.type;
                }
                const distance = step.distanceMeters;
                const values = calculateValues(distance, mode);
                co2Emissions += values.co2Emissions;
                caloriesBurned += values.caloriesBurned;
            });
        });
    }

    return {
        distanceMeters: route.distanceMeters,
        durationSeconds: route.staticDuration,
        polyline: route.polyline.encodedPolyline,
        co2Emissions: co2Emissions,
        caloriesBurned: caloriesBurned
    }
}