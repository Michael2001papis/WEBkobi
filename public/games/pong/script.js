// הגדרת משתנים עבור הקנבס
const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 400;

// הגדרת מאפיינים לפדלים
const paddleWidth = 12;
const paddleHeight = 100;
const paddleSpeed = 7;
let leftPaddle = { 
    x: 20, 
    y: canvas.height / 2 - paddleHeight / 2, 
    width: paddleWidth, 
    height: paddleHeight, 
    color: 'rgba(102, 126, 234, 1)' 
};
let rightPaddle = { 
    x: canvas.width - 32, 
    y: canvas.height / 2 - paddleHeight / 2, 
    width: paddleWidth, 
    height: paddleHeight, 
    color: 'rgba(240, 147, 251, 1)' 
};

// הגדרת מאפיינים לכדור
let ball = { 
    x: canvas.width / 2, 
    y: canvas.height / 2, 
    radius: 12, 
    speedX: 5, 
    speedY: 5, 
    color: '#ffffff',
    trail: []
};

// הגדרת משתנים עבור הציונים
let leftScore = 0;
let rightScore = 0;
let gameStarted = false;
let keys = {};
let animationId = null;
let difficulty = 'medium';

// סטטיסטיקות
let gamesPlayed = parseInt(localStorage.getItem('pong_games_played') || '0');
let gamesWon = parseInt(localStorage.getItem('pong_games_won') || '0');

// אפקטים ויזואליים
let particles = [];

// שמירת מצב מקשי החצים
document.addEventListener('keydown', (event) => {
    keys[event.key.toLowerCase()] = true;
    // מניעת גלילה בדף
    if (['w', 's', 'arrowup', 'arrowdown'].includes(event.key.toLowerCase())) {
        event.preventDefault();
    }
});
document.addEventListener('keyup', (event) => {
    keys[event.key.toLowerCase()] = false;
});

// פונקציה ליצירת חלקיקים
function createParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 30,
            color: color
        });
    }
}

// עדכון חלקיקים
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

// ציור חלקיקים
function drawParticles() {
    particles.forEach(p => {
        ctx.globalAlpha = p.life / 30;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

// פונקציה לציור רקע עם קו אמצע
function drawBackground() {
    // רקע
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // קו אמצע
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// פונקציה לציור כדור עם trail
function drawBall() {
    // ציור trail
    ball.trail.forEach((point, index) => {
        ctx.globalAlpha = (index + 1) / ball.trail.length * 0.3;
        ctx.fillStyle = ball.color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, ball.radius * (index + 1) / ball.trail.length, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
    
    // ציור הכדור
    const gradient = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.radius);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#e0e0e0');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// פונקציה לציור פדל עם גרדיאנט
function drawPaddle(paddle) {
    // יצירת צבע שקוף יותר
    const colorWithAlpha = paddle.color.replace('1)', '0.7)');
    
    const gradient = ctx.createLinearGradient(paddle.x, 0, paddle.x + paddle.width, 0);
    gradient.addColorStop(0, paddle.color);
    gradient.addColorStop(1, colorWithAlpha);
    
    ctx.fillStyle = gradient;
    ctx.shadowColor = paddle.color;
    ctx.shadowBlur = 10;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowBlur = 0;
    
    // גבול
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// עדכון מיקום הכדור
function updateBall() {
    // הוספה ל-trail
    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > 5) {
        ball.trail.shift();
    }
    
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // שינוי כיוון כאשר הכדור פוגע בקירות
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.speedY = -ball.speedY;
        createParticles(ball.x, ball.y, '#ffffff');
    }

    // שינוי כיוון כאשר הכדור פוגע בפדלים
    let hitPaddle = null;
    
    if (ball.x - ball.radius < leftPaddle.x + leftPaddle.width &&
        ball.x - ball.radius > leftPaddle.x &&
        ball.y > leftPaddle.y && 
        ball.y < leftPaddle.y + leftPaddle.height) {
        ball.speedX = Math.abs(ball.speedX);
        hitPaddle = leftPaddle;
        // שינוי זווית בהתאם למקום הפגיעה
        const hitPos = (ball.y - leftPaddle.y) / leftPaddle.height;
        ball.speedY = (hitPos - 0.5) * 8;
    }

    if (ball.x + ball.radius > rightPaddle.x &&
        ball.x + ball.radius < rightPaddle.x + rightPaddle.width &&
        ball.y > rightPaddle.y && 
        ball.y < rightPaddle.y + rightPaddle.height) {
        ball.speedX = -Math.abs(ball.speedX);
        hitPaddle = rightPaddle;
        // שינוי זווית בהתאם למקום הפגיעה
        const hitPos = (ball.y - rightPaddle.y) / rightPaddle.height;
        ball.speedY = (hitPos - 0.5) * 8;
    }
    
    if (hitPaddle) {
        createParticles(ball.x, ball.y, hitPaddle.color);
        // הגברת מהירות
        ball.speedX *= 1.05;
        ball.speedY *= 1.05;
    }

    // עדכון הציונים
    if (ball.x + ball.radius > canvas.width) {
        leftScore++;
        updateScore();
        showMessage('נקודה לשחקן שמאל!', '#667eea');
        resetBall();
        checkWinner();
    } else if (ball.x - ball.radius < 0) {
        rightScore++;
        updateScore();
        showMessage('נקודה לשחקן ימין!', '#f093fb');
        resetBall();
        checkWinner();
    }
}

// עדכון ניקוד
function updateScore() {
    document.getElementById('leftScore').textContent = leftScore;
    document.getElementById('rightScore').textContent = rightScore;
    
    // אנימציה
    const scoreElements = document.querySelectorAll('.score-value');
    scoreElements.forEach(el => {
        el.style.transform = 'scale(1.2)';
        setTimeout(() => {
            el.style.transform = 'scale(1)';
        }, 200);
    });
}

// עדכון מיקום הפדלים
function updatePaddles() {
    const currentPaddleSpeed = window.paddleSpeed || paddleSpeed;
    if (keys['w'] && leftPaddle.y > 0) leftPaddle.y -= currentPaddleSpeed;
    if (keys['s'] && leftPaddle.y + leftPaddle.height < canvas.height) leftPaddle.y += currentPaddleSpeed;
    if (keys['arrowup'] && rightPaddle.y > 0) rightPaddle.y -= currentPaddleSpeed;
    if (keys['arrowdown'] && rightPaddle.y + leftPaddle.height < canvas.height) rightPaddle.y += currentPaddleSpeed;
}

// הגדרת קושי
function setDifficulty(level) {
    difficulty = level;
    const baseSpeed = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 5 : 7;
    const basePaddleSpeed = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 7 : 9;
    
    // עדכון מהירויות
    if (ball.speedX > 0) {
        ball.speedX = baseSpeed;
    } else {
        ball.speedX = -baseSpeed;
    }
    if (ball.speedY > 0) {
        ball.speedY = baseSpeed;
    } else {
        ball.speedY = -baseSpeed;
    }
    
    // עדכון מהירות פדלים
    window.paddleSpeed = basePaddleSpeed;
}

// איפוס הכדור למרכז
function resetBall() {
    const baseSpeed = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 5 : 7;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedX = baseSpeed * (Math.random() > 0.5 ? 1 : -1);
    ball.speedY = baseSpeed * (Math.random() > 0.5 ? 1 : -1);
    ball.trail = [];
}

// הצגת הודעה
function showMessage(text, color = '#ffffff') {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.style.color = color;
    messageEl.style.borderColor = color;
    messageEl.classList.remove('hidden');
    
    setTimeout(() => {
        messageEl.classList.add('hidden');
    }, 2000);
}

// עדכון סטטיסטיקות
function updateStats() {
    document.getElementById('gamesPlayed').textContent = gamesPlayed;
    document.getElementById('gamesWon').textContent = gamesWon;
}

// בדיקת מנצח
function checkWinner() {
    if (leftScore >= 5) {
        gameStarted = false;
        gamesPlayed++;
        gamesWon++;
        localStorage.setItem('pong_games_played', gamesPlayed.toString());
        localStorage.setItem('pong_games_won', gamesWon.toString());
        updateStats();
        showMessage('🎉 שחקן שמאל ניצח! 🎉', '#667eea');
        setTimeout(() => {
            resetGame();
        }, 3000);
    } else if (rightScore >= 5) {
        gameStarted = false;
        gamesPlayed++;
        localStorage.setItem('pong_games_played', gamesPlayed.toString());
        updateStats();
        showMessage('🎉 שחקן ימין ניצח! 🎉', '#f093fb');
        setTimeout(() => {
            resetGame();
        }, 3000);
    }
}

// איפוס המשחק
function resetGame() {
    leftScore = 0;
    rightScore = 0;
    updateScore();
    resetBall();
    particles = [];
    gameStarted = false;
}

// לולאת המשחק
function gameLoop() {
    if (!gameStarted) return;
    
    // ניקוי
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // ציור
    drawBackground();
    drawPaddle(leftPaddle);
    drawPaddle(rightPaddle);
    drawBall();
    updateParticles();
    drawParticles();
    
    // עדכון
    updateBall();
    updatePaddles();
    
    animationId = requestAnimationFrame(gameLoop);
}

// התחלת המשחק
document.getElementById('startBtn').addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        resetBall();
        gameLoop();
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
    }
});

// עצירת המשחק
document.getElementById('stopBtn').addEventListener('click', () => {
    if (gameStarted) {
        gameStarted = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
    }
});

// איפוס המשחק
document.getElementById('resetBtn').addEventListener('click', () => {
    gameStarted = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    resetGame();
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
});

// בחירת קושי
document.getElementById('difficultySelect').addEventListener('change', (e) => {
    setDifficulty(e.target.value);
    if (!gameStarted) {
        resetBall();
    }
});

// אתחול
window.paddleSpeed = paddleSpeed;
setDifficulty('medium');
resetGame();
updateStats();
document.getElementById('stopBtn').disabled = true;
