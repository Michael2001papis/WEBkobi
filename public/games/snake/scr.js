const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restartBtn");

canvas.width = 600;
canvas.height = 600;

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake, direction, fruit, gameOver, gameInterval;
let score = 0;
let particles = [];
let highScore = parseInt(localStorage.getItem('highscore_snake') || '0');
let difficulty = 'medium';
let gamesPlayed = parseInt(localStorage.getItem('snake_games_played') || '0');
let gameSpeed = 120;

function setDifficulty(level) {
    difficulty = level;
    gameSpeed = level === 'easy' ? 150 : level === 'medium' ? 120 : 80;
    if (gameInterval) {
        clearInterval(gameInterval);
        if (!gameOver) {
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
    }
}

function initializeGame() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 };
    fruit = generateFruit();
    gameOver = false;
    score = 0;
    particles = [];
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
    gamesPlayed++;
    localStorage.setItem('snake_games_played', gamesPlayed.toString());
    updateScore();
    updateStats();
    draw();
}

document.addEventListener("keydown", changeDirection);
restartBtn.addEventListener("click", initializeGame);

// בחירת קושי
document.getElementById('difficultySelect').addEventListener('change', (e) => {
    setDifficulty(e.target.value);
});

// אתחול סטטיסטיקות
updateStats();

function changeDirection(event) {
    const key = event.keyCode;
    if (key === 37 && direction.x !== 1) direction = { x: -1, y: 0 }; // LEFT
    else if (key === 38 && direction.y !== 1) direction = { x: 0, y: -1 }; // UP
    else if (key === 39 && direction.x !== -1) direction = { x: 1, y: 0 }; // RIGHT
    else if (key === 40 && direction.y !== -1) direction = { x: 0, y: 1 }; // DOWN
    
    // מניעת גלילה
    if ([37, 38, 39, 40].includes(key)) {
        event.preventDefault();
    }
}

function generateFruit() {
    let newFruit;
    do {
        newFruit = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (snake.some(segment => segment.x === newFruit.x && segment.y === newFruit.y));
    return newFruit;
}

function updateScore() {
    const scoreElement = document.getElementById('score-display');
    if (scoreElement) {
        scoreElement.textContent = `ניקוד: ${score} | שיא: ${highScore}`;
    }
}

function updateStats() {
    const gamesPlayedEl = document.getElementById('gamesPlayed');
    const highScoreEl = document.getElementById('highScoreDisplay');
    if (gamesPlayedEl) gamesPlayedEl.textContent = gamesPlayed;
    if (highScoreEl) highScoreEl.textContent = highScore;
}

function saveHighscore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highscore_snake', highScore.toString());
        updateScore();
    }
}

function createParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x * gridSize + gridSize / 2,
            y: y * gridSize + gridSize / 2,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 30,
            color: color,
            size: Math.random() * 4 + 2
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.globalAlpha = p.life / 30;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

function draw() {
    // רקע
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // רשת
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
    
    // ציור הפרי
    const gradient = ctx.createRadialGradient(
        fruit.x * gridSize + gridSize / 2,
        fruit.y * gridSize + gridSize / 2,
        0,
        fruit.x * gridSize + gridSize / 2,
        fruit.y * gridSize + gridSize / 2,
        gridSize / 2
    );
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(1, '#ee5a6f');
    ctx.fillStyle = gradient;
    ctx.shadowColor = '#ff6b6b';
    ctx.shadowBlur = 15;
    ctx.fillRect(fruit.x * gridSize + 2, fruit.y * gridSize + 2, gridSize - 4, gridSize - 4);
    ctx.shadowBlur = 0;
    
    // ציור הנחש
    snake.forEach((segment, index) => {
        const alpha = index === 0 ? 1 : 0.8 - (index / snake.length) * 0.3;
        ctx.globalAlpha = alpha;
        
        const snakeGradient = ctx.createLinearGradient(
            segment.x * gridSize,
            segment.y * gridSize,
            (segment.x + 1) * gridSize,
            (segment.y + 1) * gridSize
        );
        
        if (index === 0) {
            // ראש
            snakeGradient.addColorStop(0, '#4ecdc4');
            snakeGradient.addColorStop(1, '#44a08d');
        } else {
            // גוף
            snakeGradient.addColorStop(0, '#95e1d3');
            snakeGradient.addColorStop(1, '#6bcfb8');
        }
        
        ctx.fillStyle = snakeGradient;
        ctx.shadowColor = index === 0 ? '#4ecdc4' : '#95e1d3';
        ctx.shadowBlur = index === 0 ? 10 : 5;
        ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
        ctx.shadowBlur = 0;
    });
    ctx.globalAlpha = 1;
    
    // חלקיקים
    updateParticles();
    drawParticles();
    
    // Game Over
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('סיום המשחק!', canvas.width / 2, canvas.height / 2 - 40);
        
        ctx.font = 'bold 32px Arial';
        ctx.fillText(`ניקוד סופי: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
        
        if (score === highScore && score > 0) {
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 24px Arial';
            ctx.fillText('🎉 שיא חדש! 🎉', canvas.width / 2, canvas.height / 2 + 60);
        }
    }
}

function gameLoop() {
    if (gameOver) {
        draw();
        return;
    }

    // הזזת הנחש
    const head = { 
        x: snake[0].x + direction.x, 
        y: snake[0].y + direction.y 
    };
    
    snake.unshift(head);
    
    // בדיקת אכילת פרי
    if (head.x === fruit.x && head.y === fruit.y) {
        score = snake.length - 1;
        createParticles(fruit.x, fruit.y, '#ff6b6b');
        fruit = generateFruit();
        updateScore();
        saveHighscore();
    } else {
        snake.pop();
    }
    
    // בדיקת התנגשויות
    if (head.x < 0 || head.x >= tileCount || 
        head.y < 0 || head.y >= tileCount || 
        snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver = true;
        createParticles(head.x, head.y, '#ff6b6b');
        saveHighscore();
        clearInterval(gameInterval);
    }
    
    draw();
}

initializeGame();
