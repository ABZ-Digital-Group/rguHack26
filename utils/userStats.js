import { db } from '../database.js';

export async function calculateUserStats(userId) {
    try {
        const userObjectId = typeof userId === 'string' ? userId : userId.toString();
        
        const journeys = await db.collection('journeys')
            .find({ 
                userId: userObjectId,
                status: 'completed'
            })
            .toArray();

        const stats = {
            overall: {
                co2Saved: 0,
                totalCalories: 0,
                totalDistance: 0, // in meters
                totalTime: 0, // in seconds
                tripCount: 0
            },
            byMode: {
                DRIVE: {
                    co2Saved: 0,
                    totalCalories: 0,
                    totalDistance: 0,
                    totalTime: 0,
                    tripCount: 0
                },
                WALK: {
                    co2Saved: 0,
                    totalCalories: 0,
                    totalDistance: 0,
                    totalTime: 0,
                    tripCount: 0
                },
                BICYCLE: {
                    co2Saved: 0,
                    totalCalories: 0,
                    totalDistance: 0,
                    totalTime: 0,
                    tripCount: 0
                },
                BUS: {
                    co2Saved: 0,
                    totalCalories: 0,
                    totalDistance: 0,
                    totalTime: 0,
                    tripCount: 0
                },
                TRAIN: {
                    co2Saved: 0,
                    totalCalories: 0,
                    totalDistance: 0,
                    totalTime: 0,
                    tripCount: 0
                },
                TRANSIT: {
                    co2Saved: 0,
                    totalCalories: 0,
                    totalDistance: 0,
                    totalTime: 0,
                    tripCount: 0
                }
            }
        };

        journeys.forEach(journey => {
            const mode = journey.mode || 'DRIVE';

            let co2Impact = 0;
            if (mode === 'DRIVE') {
                co2Impact = -(journey.co2WastedVsWalking || 0);
            } else {
                co2Impact = journey.co2SavedVsDriving || 0;
            }
            
            const distance = parseFloat(journey.distance) || 0;
            const duration = parseFloat(journey.duration) || 0;
            const calories = parseFloat(journey.calories) || 0;
            
            stats.overall.co2Saved += co2Impact;
            stats.overall.totalCalories += calories;
            stats.overall.totalDistance += distance;
            stats.overall.totalTime += duration;
            stats.overall.tripCount++;
            
            if (stats.byMode[mode]) {
                stats.byMode[mode].co2Saved += co2Impact;
                stats.byMode[mode].totalCalories += calories;
                stats.byMode[mode].totalDistance += distance;
                stats.byMode[mode].totalTime += duration;
                stats.byMode[mode].tripCount++;
            }
        });

        stats.overall.co2Saved = Math.round(stats.overall.co2Saved * 100) / 100;
        stats.overall.totalCalories = Math.round(stats.overall.totalCalories * 100) / 100;
        stats.overall.totalDistance = Math.round(stats.overall.totalDistance);
        stats.overall.totalTime = Math.round(stats.overall.totalTime);
        
        Object.keys(stats.byMode).forEach(mode => {
            stats.byMode[mode].co2Saved = Math.round(stats.byMode[mode].co2Saved * 100) / 100;
            stats.byMode[mode].totalCalories = Math.round(stats.byMode[mode].totalCalories * 100) / 100;
            stats.byMode[mode].totalDistance = Math.round(stats.byMode[mode].totalDistance);
            stats.byMode[mode].totalTime = Math.round(stats.byMode[mode].totalTime);
        });

        const totalTrips = stats.overall.tripCount;
        if (totalTrips > 0) {
            const greenTrips = stats.byMode.WALK.tripCount + stats.byMode.BICYCLE.tripCount;
            const okayTrips = stats.byMode.BUS.tripCount + stats.byMode.TRAIN.tripCount + stats.byMode.TRANSIT.tripCount;
            const badTrips = stats.byMode.DRIVE.tripCount;
            
            const greenPoints = (greenTrips * 100) + (okayTrips * 70) + (badTrips * 0);
            const maxPoints = totalTrips * 100;
            
            stats.overall.greenScore = Math.round((greenPoints / maxPoints) * 100);
        } else {
            stats.overall.greenScore = 50;
        }

        return stats;

    } catch (error) {
        console.error('Error calculating user stats:', error);
        throw error;
    }
}

export default calculateUserStats;
