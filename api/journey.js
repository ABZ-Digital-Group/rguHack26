import express from 'express';
import { db } from '../database.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

router.use((req, res, next) => {
    if (!req.user)
        return res.status(401).json({ error: 'Unauthorized' });
    next();
});

// Start a new journey
router.post('/start', async (req, res) => {
    try {
        const { mode, startAddress, endAddress, startCoords, endCoords, routeData, allRoutesData } = req.body;

        if (!mode || !routeData) {
            return res.status(400).json({ error: 'Missing required journey data' });
        }

        // Calculate comparisons vs other methods
        let caloriesVsOthers = {};
        let co2VsOthers = {};
        let co2SavedVsDriving = 0;
        let co2WastedVsWalking = 0;
        
        if (allRoutesData) {
            const currentCalories = parseFloat(routeData.calories) || 0;
            const currentCo2 = parseFloat(routeData.co2) || 0;
            
            Object.keys(allRoutesData).forEach(otherMode => {
                if (otherMode !== mode) {
                    const otherCalories = parseFloat(allRoutesData[otherMode].calories) || 0;
                    const otherCo2 = parseFloat(allRoutesData[otherMode].co2) || 0;
                    
                    // Positive means you burned MORE calories (good for exercise)
                    caloriesVsOthers[otherMode] = currentCalories - otherCalories;
                    
                    // Positive means you SAVED CO2 (good for environment)
                    co2VsOthers[otherMode] = otherCo2 - currentCo2;
                }
            });
            
            // Calculate specific stats for display
            if (mode === 'DRIVE') {
                // For driving, calculate CO2 wasted vs walking
                if (allRoutesData['WALK']) {
                    const walkCo2 = parseFloat(allRoutesData['WALK'].co2) || 0;
                    co2WastedVsWalking = currentCo2 - walkCo2;
                }
            } else {
                // For non-driving modes, calculate CO2 saved vs driving
                if (allRoutesData['DRIVE']) {
                    const driveCo2 = parseFloat(allRoutesData['DRIVE'].co2) || 0;
                    co2SavedVsDriving = Math.max(0, driveCo2 - currentCo2);
                }
            }
        }

        const journey = {
            userId: req.user._id,
            username: req.user.username,
            mode: mode,
            status: 'in-progress',
            startAddress: startAddress || '',
            endAddress: endAddress || '',
            startCoords: startCoords,
            endCoords: endCoords,
            distance: routeData.distance,
            duration: routeData.duration,
            distanceKm: routeData.distanceKm,
            durationMin: routeData.durationMin,
            co2: parseFloat(routeData.co2) || 0,
            calories: parseFloat(routeData.calories) || 0,
            color: routeData.color,
            switchPoints: routeData.switchPoints || [],
            caloriesVsOthers: caloriesVsOthers,
            co2VsOthers: co2VsOthers,
            co2SavedVsDriving: co2SavedVsDriving,
            co2WastedVsWalking: co2WastedVsWalking,
            startedAt: new Date(),
            completedAt: null
        };

        const result = await db.collection('journeys').insertOne(journey);

        res.json({
            success: true,
            journeyId: result.insertedId
        });

    } catch (error) {
        console.error('Error starting journey:', error);
        res.status(500).json({ error: 'Failed to start journey' });
    }
});

// Get active journey for current user
router.get('/active', async (req, res) => {
    try {
        const activeJourney = await db.collection('journeys').findOne({
            userId: req.user._id,
            status: 'in-progress'
        });

        if (!activeJourney) {
            return res.status(404).json({ error: 'No active journey found' });
        }

        res.json(activeJourney);

    } catch (error) {
        console.error('Error fetching active journey:', error);
        res.status(500).json({ error: 'Failed to fetch journey' });
    }
});

// Complete a journey
router.post('/complete/:journeyId', async (req, res) => {
    try {
        const { journeyId } = req.params;

        if (!ObjectId.isValid(journeyId)) {
            return res.status(400).json({ error: 'Invalid journey ID' });
        }

        const result = await db.collection('journeys').updateOne(
            { 
                _id: new ObjectId(journeyId),
                userId: req.user._id,
                status: 'in-progress'
            },
            {
                $set: {
                    status: 'completed',
                    completedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Journey not found or already completed' });
        }

        res.json({ success: true });

    } catch (error) {
        console.error('Error completing journey:', error);
        res.status(500).json({ error: 'Failed to complete journey' });
    }
});

// Get all journeys for current user
router.get('/history', async (req, res) => {
    try {
        const journeys = await db.collection('journeys')
            .find({ userId: req.user._id })
            .sort({ startedAt: -1 })
            .toArray();

        res.json(journeys);

    } catch (error) {
        console.error('Error fetching journey history:', error);
        res.status(500).json({ error: 'Failed to fetch journey history' });
    }
});

export default router;
