/**
 * Real-world comparison utilities for calories and CO2
 * Based on real conversion rates
 */

// Conversion constants
const CONVERSIONS = {
    // Calories (kcal)
    CHOCOLATE_BAR: 230,           // Average chocolate bar
    APPLE: 95,                    // Medium apple
    BANANA: 105,                  // Medium banana
    SLICE_PIZZA: 285,            // Average slice of pizza
    DONUT: 250,                  // Average donut
    
    // CO2 (kg)
    TREE_PER_YEAR: 21.8,         // kg CO2 absorbed by one tree per year
    TREE_PER_DAY: 0.0597,        // kg CO2 absorbed by one tree per day (21.8/365)
    KM_DRIVEN: 0.192,            // kg CO2 per km driven (average car)
    SMARTPHONE_CHARGE: 0.008,    // kg CO2 per smartphone charge
};

/**
 * Get calorie comparison text
 * @param {number} calories - Calories in kcal
 * @returns {string} Comparison text
 */
function getCalorieComparison(calories) {
    if (!calories || calories <= 0) return '';
    
    const absoluteCalories = Math.abs(calories);
    
    // Choose the most appropriate comparison based on magnitude
    if (absoluteCalories >= CONVERSIONS.SLICE_PIZZA) {
        const count = (absoluteCalories / CONVERSIONS.SLICE_PIZZA).toFixed(1);
        return `${count} slice${count != 1 ? 's' : ''} of pizza`;
    } else if (absoluteCalories >= CONVERSIONS.CHOCOLATE_BAR) {
        const count = (absoluteCalories / CONVERSIONS.CHOCOLATE_BAR).toFixed(1);
        return `${count} chocolate bar${count != 1 ? 's' : ''}`;
    } else if (absoluteCalories >= CONVERSIONS.BANANA) {
        const count = (absoluteCalories / CONVERSIONS.BANANA).toFixed(1);
        return `${count} banana${count != 1 ? 's' : ''}`;
    } else {
        const count = (absoluteCalories / CONVERSIONS.APPLE).toFixed(1);
        return `${count} apple${count != 1 ? 's' : ''}`;
    }
}

/**
 * Get CO2 comparison text
 * @param {number} co2Kg - CO2 in kilograms
 * @param {string} context - 'saved' or 'wasted' or 'emitted'
 * @returns {string} Comparison text
 */
function getCO2Comparison(co2Kg, context = 'saved') {
    if (!co2Kg || co2Kg <= 0) return '';
    
    const absoluteCO2 = Math.abs(co2Kg);
    
    // Calculate tree equivalents
    const treeDays = absoluteCO2 / CONVERSIONS.TREE_PER_DAY;
    const treeYears = absoluteCO2 / CONVERSIONS.TREE_PER_YEAR;
    
    // Choose best representation
    if (treeYears >= 1) {
        const trees = treeYears.toFixed(1);
        return `${trees} tree${trees != 1 ? 's' : ''} for a year`;
    } else if (treeDays >= 1) {
        const days = treeDays.toFixed(0);
        return `1 tree for ${days} day${days != 1 ? 's' : ''}`;
    } else {
        // For very small amounts, show as fraction of a day
        const hours = (treeDays * 24).toFixed(0);
        return `1 tree for ${hours} hour${hours != 1 ? 's' : ''}`;
    }
}

/**
 * Get formatted calorie display with comparison
 * @param {number} calories - Calories in kcal
 * @returns {string} Formatted display string
 */
function formatCaloriesWithComparison(calories) {
    if (!calories) return '0 kcal';
    
    const rounded = Math.round(calories);
    const comparison = getCalorieComparison(calories);
    
    if (comparison) {
        return `${rounded} kcal (${comparison})`;
    }
    return `${rounded} kcal`;
}

/**
 * Get formatted CO2 display with comparison
 * @param {number} co2Kg - CO2 in kilograms
 * @param {string} context - 'saved' or 'wasted' or 'emitted'
 * @returns {string} Formatted display string
 */
function formatCO2WithComparison(co2Kg, context = 'saved') {
    if (!co2Kg) return '0.00 kg';
    
    const formatted = co2Kg.toFixed(2);
    const comparison = getCO2Comparison(co2Kg, context);
    
    if (comparison) {
        return `${formatted} kg (${comparison})`;
    }
    return `${formatted} kg`;
}

// Export for use in other scripts (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getCalorieComparison,
        getCO2Comparison,
        formatCaloriesWithComparison,
        formatCO2WithComparison,
        CONVERSIONS
    };
}
