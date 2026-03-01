// Load and display achievements
async function loadAchievements() {
    try {
        const response = await fetch('/api/journey/achievements');
        
        if (!response.ok) {
            throw new Error('Failed to fetch achievements');
        }

        const achievements = await response.json();
        
        displayAchievements(achievements);
        
    } catch (error) {
        console.error('Error loading achievements:', error);
        document.getElementById('loading').textContent = 'Failed to load achievements. Please try again later.';
    }
}

function displayAchievements(achievements) {
    const grid = document.getElementById('achievementsGrid');
    const loading = document.getElementById('loading');
    const summary = document.getElementById('summary');
    
    // Calculate summary stats
    const earnedCount = achievements.filter(a => a.earned).length;
    const totalCount = achievements.length;
    const percentage = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;
    
    // Display summary
    summary.innerHTML = `
        <h2>Your Progress</h2>
        <div class="summary-stats">
            <div class="summary-stat">
                <div class="number">${earnedCount}</div>
                <div class="label">Earned</div>
            </div>
            <div class="summary-stat">
                <div class="number">${totalCount}</div>
                <div class="label">Total</div>
            </div>
            <div class="summary-stat">
                <div class="number">${percentage}%</div>
                <div class="label">Complete</div>
            </div>
        </div>
    `;
    
    // Clear and populate grid
    grid.innerHTML = '';
    
    achievements.forEach(achievement => {
        const card = createAchievementCard(achievement);
        grid.appendChild(card);
    });
    
    // Show grid, hide loading
    loading.style.display = 'none';
    grid.style.display = 'grid';
}

function createAchievementCard(achievement) {
    const card = document.createElement('div');
    card.className = `achievement-card ${achievement.earned ? 'earned' : 'locked'}`;
    
    let progressHtml = '';
    if (!achievement.earned) {
        progressHtml = `
            <div class="achievement-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${achievement.percentage}%"></div>
                </div>
                <div class="progress-text">${formatProgressValue(achievement.progress, achievement.requirement.type)} / ${formatProgressValue(achievement.target, achievement.requirement.type)}</div>
            </div>
        `;
    } else {
        const earnedDate = new Date(achievement.earnedAt);
        const dateStr = earnedDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        progressHtml = `
            <div class="earned-date">✓ Earned on ${dateStr}</div>
        `;
    }
    
    card.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-name">${achievement.name}</div>
        <div class="achievement-description">${achievement.description}</div>
        ${progressHtml}
    `;
    
    return card;
}

function formatProgressValue(value, type) {
    switch(type) {
        case 'co2Saved':
            return value.toFixed(1) + 'kg';
        case 'totalCalories':
            return Math.round(value) + ' kcal';
        case 'totalDistance':
            return (value / 1000).toFixed(1) + 'km';
        case 'totalTime':
            return Math.round(value / 3600) + 'h';
        case 'tripCount':
        case 'nonDrivingTrips':
        default:
            return Math.round(value);
    }
}

// Load achievements when page loads
document.addEventListener('DOMContentLoaded', loadAchievements);
