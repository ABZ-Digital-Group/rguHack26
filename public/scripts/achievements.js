function loadAchievements() {
    const url = '/api/journey/achievements';
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            displayAchievements(data);
            return data;
        })
        .catch(error => {
            console.error('Error loading achievements:', error);
            const loading = document.getElementById('loading');
            loading.innerHTML = '<p class="error">Failed to load achievements. Please try again later.</p>';
        });
}

function createAchievementCard(achievement) {
    const card = document.createElement('div');
    card.className = 'achievement-card';
    if (achievement.earned) {
        card.classList.add('earned');
    } else {
        card.classList.add('locked');
    }
    card.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-info">
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-description">${achievement.description}</div>
        </div>
    `;
    return card;
}

function displayAchievements(achievements) {
    const grid = document.getElementById('achievementsGrid');
    const loading = document.getElementById('loading');
    const summary = document.getElementById('summary');
    
    const earnedCount = achievements.filter(a => a.earned).length;
    const totalCount = achievements.length;
    const percentage = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;
    
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
    
    grid.innerHTML = '';
    
    achievements.forEach(achievement => {
        const card = createAchievementCard(achievement);
        grid.appendChild(card);
    });
    
    loading.style.display = 'none';
    grid.style.display = 'grid';
}



function checkForNewAchievements() {
    const urlParams = new URLSearchParams(window.location.search);
    const newAchievements = urlParams.get('new');
    
    if (newAchievements) {
        const achievementIds = newAchievements.split(',');
        return achievementIds;
    }
    return null;
}

function showCelebration(newAchievementIds, allAchievements) {
    const newAchievements = allAchievements.filter(a => newAchievementIds.includes(a.id));
    
    if (newAchievements.length === 0) return;
    
    const modal = document.createElement('div');
    modal.className = 'celebration-modal';
    modal.innerHTML = `
        <div class="celebration-content">
            <div class="celebration-icon">🎉</div>
            <div class="celebration-title">Achievement${newAchievements.length > 1 ? 's' : ''} Unlocked!</div>
            <div class="celebration-subtitle">You earned ${newAchievements.length} new achievement${newAchievements.length > 1 ? 's' : ''}!</div>
            <div class="new-achievements-list">
                ${newAchievements.map(a => `
                    <div class="new-achievement-item">
                        <div class="new-achievement-icon">${a.icon}</div>
                        <div class="new-achievement-text">
                            <div class="new-achievement-name">${a.name}</div>
                            <div class="new-achievement-desc">${a.description}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button class="celebration-btn" onclick="closeCelebration()">Awesome!</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    createConfetti();
    window.history.replaceState({}, document.title, window.location.pathname);
}

function closeCelebration() {
    const modal = document.querySelector('.celebration-modal');
    if (modal) {
        modal.style.animation = 'fadeIn 0.3s ease reverse';
        setTimeout(() => modal.remove(), 300);
    }
}

window.closeCelebration = closeCelebration;

function createConfetti() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3500);
        }, i * 30);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadAchievements();
    
    const newIds = checkForNewAchievements();
    if (newIds) {
        try {
            const response = await fetch('/api/journey/achievements');
            if (response.ok) {
                const achievements = await response.json();
                showCelebration(newIds, achievements);
            }
        } catch (error) {
            console.error('Error loading achievements for celebration:', error);
        }
    }
});
