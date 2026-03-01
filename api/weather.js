import express from 'express';
import { db } from '../database.js';

const router = express.Router();

router.get('/current', async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ 
                error: 'Latitude and longitude are required' 
            });
        }

        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
            res.status(500).json({ error: 'Google Maps API key not configured' });
            return;
        }

        const url = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${apiKey}&location.latitude=${lat}&location.longitude=${lon}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Google Weather API returned ${response.status}`);
        }
        
        const data = await response.json();

        // Check if it's raining or snowing based on Google's weather condition types
        const weatherType = data.weatherCondition?.type || '';
        const isRaining = ['RAIN', 'DRIZZLE', 'THUNDERSTORM', 'SNOW', 'SLEET', 'HAIL'].includes(weatherType);

        res.json({
            weatherCondition: data.weatherCondition,
            temperature: data.temperature,
            precipitation: data.precipitation,
            isRaining: isRaining,
            description: data.weatherCondition?.description?.text || ''
        });

    } catch (error) {
        console.error('Weather API error:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch weather data',
            isRaining: false
        });
    }
});

router.post('/suggestions', async (req, res) => {
    try {
        const { lat, lon, routeData } = req.body;
        const userId = req.user?._id;

        if (!lat || !lon || !routeData) {
            return res.status(400).json({ 
                error: 'Location and route data are required' 
            });
        }

        const suggestions = {};

        let isRaining = false;
        let weatherDescription = '';
        
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (apiKey) {
            try {
                const url = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${apiKey}&location.latitude=${lat}&location.longitude=${lon}`;
                const response = await fetch(url);
                
                if (response.ok) {
                    const data = await response.json();
                    const weatherType = data.weatherCondition?.type || '';
                    isRaining = ['RAIN', 'DRIZZLE', 'THUNDERSTORM', 'SNOW', 'SLEET', 'HAIL'].includes(weatherType);
                    weatherDescription = data.weatherCondition?.description?.text || '';
                }
            } catch (error) {
                console.warn('Weather fetch failed, using defaults');
            }
        }

        let recentJourneys = [];
        if (userId) {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            recentJourneys = await db.collection('journeys')
                .find({ 
                    userId: userId.toString(),
                    status: 'completed',
                    startedAt: { $gte: sevenDaysAgo }
                })
                .sort({ startedAt: -1 })
                .toArray();
        }

        const modeCount = {};
        recentJourneys.forEach(journey => {
            const mode = journey.mode || 'DRIVE';
            modeCount[mode] = (modeCount[mode] || 0) + 1;
        });

        let walkStreak = 0;
        let cycleStreak = 0;
        for (let i = 0; i < Math.min(5, recentJourneys.length); i++) {
            if (recentJourneys[i].mode === 'WALK') walkStreak++;
            if (recentJourneys[i].mode === 'BICYCLE') cycleStreak++;
        }

        Object.keys(routeData).forEach(mode => {
            const route = routeData[mode];
            const durationMin = route.durationMin || route.duration / 60;
            const durationHours = durationMin / 60;

            let reason = '';
            let shouldSuggest = false;

            switch (mode) {
                case 'WALK':
                    if (durationHours > 2) {
                        shouldSuggest = false;
                        reason = '';
                    } else if (walkStreak >= 3) {
                        shouldSuggest = true;
                        reason = `Keep up your walking streak! You've walked ${walkStreak} times recently. 🔥`;
                    } else if (!isRaining && durationHours <= 1) {
                        shouldSuggest = true;
                        reason = weatherDescription 
                            ? `Perfect weather for a walk! ${weatherDescription}. ☀️`
                            : 'Great weather for walking! ☀️';
                    } else if (!isRaining) {
                        shouldSuggest = true;
                        reason = 'Good weather for outdoor activity! 🌤️';
                    } else if (modeCount.DRIVE >= 4) {
                        shouldSuggest = false;
                        reason = '';
                    }
                    break;

                case 'BICYCLE':
                    if (durationHours > 2) {
                        shouldSuggest = false;
                        reason = '';
                    } else if (cycleStreak >= 3) {
                        shouldSuggest = true;
                        reason = `Amazing cycling streak! ${cycleStreak} rides this week. Keep it up! 🚴`;
                    } else if (!isRaining && modeCount.DRIVE >= 4) {
                        shouldSuggest = true;
                        reason = `You've driven ${modeCount.DRIVE} times this week. Try cycling! 🌱`;
                    } else if (!isRaining) {
                        shouldSuggest = true;
                        reason = 'Great conditions for cycling! 🚴';
                    }
                    break;

                case 'TRANSIT':
                    if (isRaining) {
                        shouldSuggest = true;
                        reason = weatherDescription 
                            ? `${weatherDescription} - stay dry with transit! 🌧️`
                            : 'Rainy weather - transit keeps you dry! ☔';
                    } else if (modeCount.DRIVE >= 4) {
                        shouldSuggest = true;
                        reason = `You've driven ${modeCount.DRIVE} times this week. Save on emissions! 🌍`;
                    } else if (durationHours > 1.5) {
                        shouldSuggest = true;
                        reason = 'Longer journey - relax on transit! 🚌';
                    }
                    break;

                case 'DRIVE':
                    if (modeCount.DRIVE >= 5) {
                        shouldSuggest = false;
                        reason = '';
                    } else if (durationHours > 2 || (isRaining && durationHours > 0.5)) {
                        shouldSuggest = true;
                        reason = 'Practical choice for this journey. 🚗';
                    }
                    break;
            }

            if (shouldSuggest && reason) {
                suggestions[mode] = { reason };
            }
        });

        if (Object.keys(suggestions).length === 0 && Object.keys(routeData).length > 0) {
            const modes = Object.keys(routeData);
            if (modes.includes('WALK') && routeData.WALK.durationMin <= 120) {
                suggestions.WALK = { reason: 'A healthy choice! 🚶' };
            } else if (modes.includes('TRANSIT')) {
                suggestions.TRANSIT = { reason: 'Eco-friendly option! 🌱' };
            }
        }

        res.json({ suggestions, isRaining, weatherDescription });

    } catch (error) {
        console.error('Error generating suggestions:', error);
        res.status(500).json({ 
            error: 'Failed to generate suggestions',
            suggestions: {}
        });
    }
});

export default router;
