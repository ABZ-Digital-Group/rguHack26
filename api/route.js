import express from 'express';
import dotenv from 'dotenv';

import calculateJourneyStats from '../utils/journeyMath.js';

dotenv.config();

const router = express.Router();

router.use((req, res, next) => {
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
'routes.polyline.encodedPolyline,routes.staticDuration,routes.distanceMeters,routes.legs.steps.distanceMeters,routes.legs.steps.startLocation,routes.legs.steps.endLocation,routes.legs.steps.travelMode,routes.legs.steps.transitDetails,routes.legs.steps.navigationInstruction'
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

router.get('/map/key', (req, res) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    res.json({ apiKey });
});

// New Places API - Autocomplete
router.post('/map/autocomplete', async (req, res) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    const { input } = req.body;

    if (!input) {
        return res.status(400).json({ error: 'Input required' });
    }

    try {
        const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey
            },
            body: JSON.stringify({
                input: input,
                includedPrimaryTypes: ['street_address', 'route', 'premise', 'subpremise', 'point_of_interest'],
                languageCode: 'en'
            })
        });

        if (!response.ok) {
            throw new Error('Autocomplete API request failed');
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching autocomplete:', error);
        res.status(500).json({ error: 'Failed to fetch suggestions' });
    }
});

// New Places API - Place Details
router.get('/map/place/:placeId', async (req, res) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    const { placeId } = req.params;

    try {
        const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': 'id,displayName,formattedAddress,location'
            }
        });

        if (!response.ok) {
            throw new Error('Place details API request failed');
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching place details:', error);
        res.status(500).json({ error: 'Failed to fetch place details' });
    }
});

export default router;