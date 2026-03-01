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
    const switchPoints = [];
    
    if (journeyInput.mode != "TRANSIT") {
        const values = calculateValues(route.distanceMeters, journeyInput.mode);
        co2Emissions = values.co2Emissions;
        caloriesBurned = values.caloriesBurned;
    } else {
        co2Emissions = 0;
        caloriesBurned = 0;
        if (route.legs && Array.isArray(route.legs)) {
            route.legs.forEach(leg => {
                if (leg.steps && Array.isArray(leg.steps)) {
                    let previousMode = null;
                    
                    leg.steps.forEach((step, index) => {
                        let mode = step.travelMode;
                        let transitInfo = null;
                        
                        if (mode === "TRANSIT" && step.transitDetails) {
                            mode = step.transitDetails.transitLine?.vehicle?.type || 'BUS';
                            transitInfo = {
                                vehicleType: step.transitDetails.transitLine?.vehicle?.type || 'BUS',
                                lineName: step.transitDetails.transitLine?.name || 'Transit',
                                headsign: step.transitDetails.headsign
                            };
                        }
                        
                        const distance = step.distanceMeters || 0;
                        const values = calculateValues(distance, mode);
                        co2Emissions += values.co2Emissions;
                        caloriesBurned += values.caloriesBurned;
                        
                        if (step.startLocation && step.startLocation.latLng && previousMode !== null && previousMode !== step.travelMode) {
                            switchPoints.push({
                                location: {
                                    lat: step.startLocation.latLng.latitude,
                                    lng: step.startLocation.latLng.longitude
                                },
                                mode: mode,
                                travelMode: step.travelMode,
                                instruction: step.navigationInstruction?.instructions || getModeChangeText(step.travelMode, transitInfo),
                                transitInfo: transitInfo,
                                stepIndex: index
                            });
                        }
                        
                        previousMode = step.travelMode;
                    });
                }
            });
        }
    }

    return {
        distanceMeters: route.distanceMeters,
        durationSeconds: typeof route.staticDuration === 'string' 
            ? parseInt(route.staticDuration.replace('s', ''))
            : route.staticDuration,
        polyline: route.polyline.encodedPolyline,
        co2Emissions: co2Emissions,
        caloriesBurned: caloriesBurned,
        switchPoints: switchPoints
    }
}

function getModeChangeText(travelMode, transitInfo) {
    if (travelMode === 'WALK') {
        return 'Start walking';
    } else if (travelMode === 'TRANSIT') {
        if (transitInfo) {
            return `Board ${transitInfo.lineName}`;
        }
        return 'Board transit';
    }
    return `Switch to ${travelMode.toLowerCase()}`;
}