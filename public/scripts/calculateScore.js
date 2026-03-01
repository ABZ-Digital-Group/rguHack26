export function calculateScoreFromCO2(co2savedKG) {
    // Define a scoring system based on CO2 saved
    // For example, 1 point for every 0.1 kg of CO2 saved
    const pointsPerKg = 10; // 10 points per kg of CO2 saved
    return Math.round(co2savedKG * pointsPerKg);
}