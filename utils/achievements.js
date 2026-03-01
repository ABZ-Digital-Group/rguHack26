import { db } from '../database.js';
import { ObjectId } from 'mongodb';
import calculateUserStats from './userStats.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load achievements from JSON file
let achievementsData = [];
try {
    const achievementsPath = join(__dirname, '..', 'achievements.json');
    const data = readFileSync(achievementsPath, 'utf8');
    achievementsData = JSON.parse(data);
} catch (error) {
    console.error('Error loading achievements.json:', error);
}


export async function checkAndGrantAchievements(userId) {
    try {
        const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
        
        const userAchievements = await db.collection('achievements').find({
            userId: userObjectId
        }).toArray();
        
        const earnedAchievementIds = userAchievements.map(a => a.achievementId);
        
        const stats = await calculateUserStats(userObjectId);
        
        const nonDrivingTrips = stats.overall.tripCount - (stats.byMode.DRIVE?.tripCount || 0);
        
        const newAchievements = [];
        
        for (const achievement of achievementsData) {
            if (earnedAchievementIds.includes(achievement.id)) {
                continue;
            }
            
            const requirement = achievement.requirement;
            let currentValue = 0;
            
            if (requirement.type === 'nonDrivingTrips') {
                currentValue = nonDrivingTrips;
            } else if (requirement.mode === 'overall') {
                currentValue = stats.overall[requirement.type] || 0;
            } else {
                currentValue = stats.byMode[requirement.mode]?.[requirement.type] || 0;
            }
            
            if (currentValue >= requirement.value) {
                await db.collection('achievements').insertOne({
                    userId: userObjectId,
                    achievementId: achievement.id,
                    earnedAt: new Date()
                });
                
                newAchievements.push(achievement.id);
            }
        }
        
        return newAchievements;
        
    } catch (error) {
        console.error('Error checking achievements:', error);
        throw error;
    }
}

export async function getUserAchievements(userId) {
    try {
        const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
        
        const earnedAchievements = await db.collection('achievements').find({
            userId: userObjectId
        }).toArray();
        
        const earnedMap = {};
        earnedAchievements.forEach(a => {
            earnedMap[a.achievementId] = a.earnedAt;
        });
        
        const stats = await calculateUserStats(userObjectId);
        const nonDrivingTrips = stats.overall.tripCount - (stats.byMode.DRIVE?.tripCount || 0);
        
        const achievements = achievementsData.map(achievement => {
            const earned = earnedMap[achievement.id];
            
            const requirement = achievement.requirement;
            let currentValue = 0;
            
            if (requirement.type === 'nonDrivingTrips') {
                currentValue = nonDrivingTrips;
            } else if (requirement.mode === 'overall') {
                currentValue = stats.overall[requirement.type] || 0;
            } else {
                currentValue = stats.byMode[requirement.mode]?.[requirement.type] || 0;
            }
            
            return {
                ...achievement,
                earned: !!earned,
                earnedAt: earned || null,
                progress: currentValue,
                target: requirement.value,
                percentage: Math.min(100, Math.round((currentValue / requirement.value) * 100))
            };
        });
        
        achievements.sort((a, b) => {
            if (a.earned && !b.earned) return -1;
            if (!a.earned && b.earned) return 1;
            if (a.earned && b.earned) {
                return new Date(b.earnedAt) - new Date(a.earnedAt);
            }
            return b.percentage - a.percentage;
        });
        
        return achievements;
        
    } catch (error) {
        console.error('Error getting user achievements:', error);
        throw error;
    }
}

export function getAllAchievements() {
    return achievementsData;
}

export default {
    checkAndGrantAchievements,
    getUserAchievements,
    getAllAchievements
};
