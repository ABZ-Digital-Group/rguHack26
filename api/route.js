import express from 'express';
import dotenv from 'dotenv';

import calculateJourneyStats from '../utils/journeyMath.js';

dotenv.config();

const router = express.Router();

router.use((resq, req, next) => {
    if (!req.user)
        return res.status(401).json({ error: 'Unauthorized' });
    next();
});

router.post('/getRoute', async (req, res) => {
    try {
        const { start, end } = req.body;

        // All available travel modes
        const travelModes = ['DRIVE', 'BICYCLE', 'WALK', 'TRANSIT'];
        
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        // Make requests for all travel modes in parallel
        const routePromises = travelModes.map(async (mode) => {
            const requestBody = {
                origin: {
                    location: {
                        latLng: {
                            latitude: start.lat,
                            longitude: start.lng
                        }
                    }
                },
                destination: {
                    location: {
                        latLng: {
                            latitude: end.lat,
                            longitude: end.lng
                        }
                    }
                },
                travelMode: mode,
                routingPreference: mode === 'DRIVE' ? 'TRAFFIC_AWARE' : undefined,
                computeAlternativeRoutes: false,
                routeModifiers: {
                    avoidTolls: false,
                    avoidHighways: false,
                    avoidFerries: false
                },
                languageCode: 'en-US',
                units: 'METRIC'
            };

            try {
                const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Goog-Api-Key': apiKey,
                        'X-Goog-FieldMask': 
'routes.polyline.encodedPolyline,routes.staticDuration,routes.distanceMeters,routes.legs.steps'
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) {
                    throw new Error(`API request failed for ${mode}: ${response.statusText}`);
                }

                const data = await response.json();
                
                if (!data.routes || data.routes.length === 0) {
                    throw new Error(`No routes found for ${mode}`);
                }

                return {
                    mode: mode,
                    success: true,
                    data: data.routes
                };
            } catch (error) {
                console.error(`Error fetching route for ${mode}:`, error);
                return {
                    mode: mode,
                    success: false,
                    error: error.message
                };
            }
        });

        // Wait for all requests to complete
        const results = await Promise.all(routePromises);
        
        // Format the response
        const formattedResults = {};
        results.filter(result => result.success).forEach(result => {
            formattedResults[result.mode] = calculateJourneyStats(result);
        });

        res.json({
            origin: start,
            destination: end,
            routes: formattedResults
        });

    } catch (error) {
        console.error('Error in getRoute:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;