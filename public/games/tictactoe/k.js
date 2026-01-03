// משתני משחק
let turn = true; // true = X, false = O
let btnClicked = 0;
let btns = null; // יאותחל אחרי שה-DOM מוכן
let gameOver = false;
let gameMode = 'two-players'; // 'two-players' או 'vs-ai'
let aiDifficulty = 'medium'; // 'easy', 'medium', 'hard'
let playerSymbol = 'X'; // 'X' או 'O'
let moveHistory = []; // היסטוריית מהלכים לביטול
let boardSize = 3; // 3x3, 4x4, 5x5
let xWins = parseInt(localStorage.getItem('highscore_tictactoe_x') || '0');
let oWins = parseInt(localStorage.getItem('highscore_tictactoe_o') || '0');
let ties = parseInt(localStorage.getItem('highscore_tictactoe_ties') || '0');
let totalGames = parseInt(localStorage.getItem('highscore_tictactoe_total') || '0');
let xWinsVsAI = parseInt(localStorage.getItem('highscore_tictactoe_x_vs_ai') || '0');
let oWinsVsAI = parseInt(localStorage.getItem('highscore_tictactoe_o_vs_ai') || '0');

// טיימר
let moveTimer = null;
let moveTimeLeft = 30; // שניות לכל מהלך
let moveTimerEnabled = false;
let gameTimerEnabled = false;
let gameStartTime = null;
let gameTimerInterval = null;

// סאונד
let soundEnabled = true;
let audioContext = null;

// אפקטים
let particles = [];
let backgroundAnimation = true;

// היסטוריית משחקים
let gameHistory = JSON.parse(localStorage.getItem('highscore_tictactoe_history') || '[]');
const MAX_HISTORY = 10; // שמירת 10 משחקים אחרונים

// טורניר
let tournamentMode = false;
let tournamentGames = [];
let tournamentScore = { X: 0, O: 0 };
let tournamentRound = 0;
const TOURNAMENT_GAMES = 4; // 4 סיבובים בטורניר

// אתגרים
let currentChallenge = null;
let challenges = [
    { id: 'win_fast', name: '⚡ נצח מהר', desc: 'נצח ב-5 מהלכים או פחות', completed: false },
    { id: 'perfect_game', name: '⭐ משחק מושלם', desc: 'נצח בלי להפסיד תא', completed: false },
    { id: 'comeback', name: '🔥 קאמבק', desc: 'נצח אחרי שהיית בפיגור', completed: false },
    { id: 'first_blood', name: '🎯 ראשון', desc: 'נצח במהלך הראשון', completed: false },
    { id: 'corner_master', name: '📐 מאסטר פינות', desc: 'נצח עם כל הפינות', completed: false },
    { id: 'center_king', name: '👑 מלך המרכז', desc: 'נצח עם המרכז', completed: false },
    { id: 'ai_destroyer', name: '🤖 מחסל מחשבים', desc: 'נצח את המחשב ברמה קשה', completed: false },
    { id: 'speed_demon', name: '💨 שד מהירות', desc: 'נצח תוך 10 שניות', completed: false }
];

// יצירת UI משופר
function createUI() {
    const container = document.querySelector('.tictactoe').parentElement;
    if (!container) {
        console.error('Container not found!');
        return;
    }
    
        container.classList.add('game-container');
        
    // בדיקה אם האלמנטים כבר קיימים
    if (document.getElementById('gameModeSelect')) {
        console.log('UI already exists, skipping...');
        return;
    }
    
    // פאנל בחירת מצב משחק
    const gameModePanel = document.createElement('div');
        gameModePanel.className = 'game-mode-panel';
        gameModePanel.innerHTML = `
            <div class="mode-selector">
                <label>מצב משחק:</label>
                <select id="gameModeSelect" class="mode-select">
                    <option value="two-players">שני שחקנים</option>
                    <option value="vs-ai">נגד מחשב</option>
                </select>
            </div>
            <div class="mode-selector" id="aiSettings" style="display: none;">
                <label>רמת קושי:</label>
                <select id="aiDifficultySelect" class="mode-select">
                    <option value="easy">קל</option>
                    <option value="medium" selected>בינוני</option>
                    <option value="hard">קשה</option>
                </select>
            </div>
            <div class="mode-selector" id="playerSymbolSelector" style="display: none;">
                <label>בחר סימן:</label>
                <div class="symbol-buttons">
                    <button class="symbol-btn active" data-symbol="X">X</button>
                    <button class="symbol-btn" data-symbol="O">O</button>
                </div>
            </div>
            <div class="mode-selector">
                <label>גודל לוח:</label>
                <select id="boardSizeSelect" class="mode-select">
                    <option value="3" selected>3x3 (קלאסי)</option>
                    <option value="4">4x4 (מתקדם)</option>
                    <option value="5">5x5 (מומחה)</option>
                </select>
            </div>
    `;
    container.insertBefore(gameModePanel, document.querySelector('.tictactoe'));
    
    // אינדיקטור תור
    const turnIndicator = document.createElement('div');
        turnIndicator.className = 'turn-indicator';
        turnIndicator.id = 'turnIndicator';
    turnIndicator.innerHTML = '<span class="turn-text">תור: </span><span class="turn-symbol">X</span>';
    container.insertBefore(turnIndicator, document.querySelector('.tictactoe'));
    
    // סטטיסטיקות
        const stats = document.createElement('div');
        stats.className = 'stats';
        stats.innerHTML = `
            <div class="stat-box">
                <div class="stat-label">ניצחונות X</div>
                <div class="stat-value" id="xWins">${xWins}</div>
            </div>
        <div class="stat-box">
            <div class="stat-label">תיקו</div>
            <div class="stat-value" id="ties">${ties}</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">ניצחונות O</div>
                <div class="stat-value" id="oWins">${oWins}</div>
            </div>
        `;
        container.insertBefore(stats, document.querySelector('.tictactoe'));
        
    // טיימר
    const timerPanel = document.createElement('div');
    timerPanel.className = 'timer-panel';
    timerPanel.innerHTML = `
        <div class="timer-controls">
            <label class="toggle-label">
                <input type="checkbox" id="moveTimerToggle" class="toggle-checkbox">
                <span>טיימר למהלך (30ש)</span>
            </label>
            <label class="toggle-label">
                <input type="checkbox" id="gameTimerToggle" class="toggle-checkbox">
                <span>טיימר למשחק</span>
            </label>
        </div>
        <div class="timer-displays">
            <div class="timer-display" id="moveTimerDisplay" style="display: none;">
                <span>זמן למהלך: </span>
                <span id="moveTimer">30ש</span>
            </div>
            <div class="timer-display" id="gameTimerDisplay" style="display: none;">
                <span>זמן משחק: </span>
                <span id="gameTimer">0:00</span>
            </div>
        </div>
    `;
    container.insertBefore(timerPanel, document.querySelector('.tictactoe'));
    
    // הגדרות (סאונד, אפקטים)
    const settingsPanel = document.createElement('div');
    settingsPanel.className = 'settings-panel';
    settingsPanel.innerHTML = `
        <label class="toggle-label">
            <input type="checkbox" id="soundToggle" class="toggle-checkbox" checked>
            <span>🔊 סאונד</span>
        </label>
        <label class="toggle-label">
            <input type="checkbox" id="effectsToggle" class="toggle-checkbox" checked>
            <span>✨ אפקטים</span>
        </label>
    `;
    container.insertBefore(settingsPanel, document.querySelector('.tictactoe'));
    
    // כפתורי בקרה
    const controls = document.createElement('div');
    controls.className = 'controls';
    controls.innerHTML = `
        <button class="control-btn" id="undoBtn" title="בטל מהלך אחרון">
            <span>↶</span> בטל מהלך
        </button>
        <button class="control-btn reset-btn" id="resetBtn">
            <span>🔄</span> איפוס משחק
        </button>
        <button class="control-btn" id="shareBtn" title="שתף תוצאה">
            <span>📤</span> שתף
        </button>
        <button class="control-btn" id="tournamentBtn" title="התחל טורניר">
            <span>🏆</span> טורניר
        </button>
    `;
    container.appendChild(controls);
    
    // סטטיסטיקות מפורטות
    const detailedStats = document.createElement('div');
    detailedStats.className = 'detailed-stats';
    detailedStats.id = 'detailedStats';
    container.appendChild(detailedStats);
    
    // Event listener ל-collapse
    detailedStats.addEventListener('click', (e) => {
        if (e.target.tagName === 'H3') {
            detailedStats.classList.toggle('collapsed');
        }
    });
    
    // היסטוריית משחקים
    const historyPanel = document.createElement('div');
    historyPanel.className = 'history-panel';
    historyPanel.innerHTML = `
        <h3>היסטוריית משחקים</h3>
        <div id="gameHistory" class="game-history"></div>
    `;
    container.appendChild(historyPanel);
    
    // Event listener ל-collapse
    historyPanel.addEventListener('click', (e) => {
        if (e.target.tagName === 'H3') {
            historyPanel.classList.toggle('collapsed');
        }
    });
    
    // לוח תוצאות
    const leaderboard = document.createElement('div');
    leaderboard.className = 'leaderboard';
    leaderboard.innerHTML = `
        <h3>🏆 לוח תוצאות</h3>
        <div class="leaderboard-content">
            <div class="leaderboard-item">
                <span>X</span>
                <span>${xWins} ניצחונות</span>
            </div>
            <div class="leaderboard-item">
                <span>O</span>
                <span>${oWins} ניצחונות</span>
            </div>
            <div class="leaderboard-item">
                <span>תיקו</span>
                <span>${ties}</span>
            </div>
        </div>
    `;
    container.appendChild(leaderboard);
    
    // Event listener ל-collapse
    leaderboard.addEventListener('click', (e) => {
        if (e.target.tagName === 'H3') {
            leaderboard.classList.toggle('collapsed');
        }
    });
    
    // אתגרים
    const challengesPanel = document.createElement('div');
    challengesPanel.className = 'challenges-panel';
    challengesPanel.innerHTML = `
        <h3>🎯 אתגרים</h3>
        <div id="challengesList" class="challenges-list"></div>
    `;
    container.appendChild(challengesPanel);
    
    // Event listener ל-collapse
    challengesPanel.addEventListener('click', (e) => {
        if (e.target.tagName === 'H3') {
            challengesPanel.classList.toggle('collapsed');
        }
    });
    
    // הודעות
        const message = document.createElement('div');
        message.className = 'message';
        message.id = 'message';
        document.body.appendChild(message);
    
    // Event listeners חדשים
    document.getElementById('moveTimerToggle').addEventListener('change', (e) => {
        moveTimerEnabled = e.target.checked;
        const display = document.getElementById('moveTimerDisplay');
        display.style.display = moveTimerEnabled ? 'block' : 'none';
        if (moveTimerEnabled && !gameOver) {
            startMoveTimer();
        } else {
            clearMoveTimer();
        }
    });
    
    document.getElementById('gameTimerToggle').addEventListener('change', (e) => {
        gameTimerEnabled = e.target.checked;
        const display = document.getElementById('gameTimerDisplay');
        display.style.display = gameTimerEnabled ? 'block' : 'none';
        if (gameTimerEnabled && !gameOver) {
            startGameTimer();
        } else {
            clearGameTimer();
        }
    });
    
    document.getElementById('soundToggle').addEventListener('change', (e) => {
        soundEnabled = e.target.checked;
        localStorage.setItem('tictactoe_sound', soundEnabled);
    });
    
    document.getElementById('effectsToggle').addEventListener('change', (e) => {
        backgroundAnimation = e.target.checked;
        localStorage.setItem('tictactoe_effects', backgroundAnimation);
    });
    
    document.getElementById('shareBtn').addEventListener('click', () => {
        const result = `ניצחונות X: ${xWins}, ניצחונות O: ${oWins}, תיקו: ${ties}`;
        shareResult(result);
    });
    
    document.getElementById('tournamentBtn').addEventListener('click', startTournament);
    
    document.getElementById('boardSizeSelect').addEventListener('change', (e) => {
        boardSize = parseInt(e.target.value);
        resetBoard();
    });
    
    // טעינת העדפות
    soundEnabled = localStorage.getItem('tictactoe_sound') !== 'false';
    backgroundAnimation = localStorage.getItem('tictactoe_effects') !== 'false';
    document.getElementById('soundToggle').checked = soundEnabled;
    document.getElementById('effectsToggle').checked = backgroundAnimation;
    
    // עדכון רשימת אתגרים
    updateChallengesList();
    
    // Event listeners
    document.getElementById('gameModeSelect').addEventListener('change', handleGameModeChange);
    document.getElementById('aiDifficultySelect').addEventListener('change', (e) => {
        aiDifficulty = e.target.value;
    });
    document.getElementById('resetBtn').addEventListener('click', reset);
    document.getElementById('undoBtn').addEventListener('click', undoMove);
    
    // בחירת סימן
    document.querySelectorAll('.symbol-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (gameOver || btnClicked > 0) return;
            document.querySelectorAll('.symbol-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            playerSymbol = this.dataset.symbol;
            if (playerSymbol === 'O' && gameMode === 'vs-ai') {
                // אם שחקן בחר O, המחשב מתחיל
                setTimeout(() => makeAIMove(), 500);
            }
        });
    });
    
    // אתחול כפתורי המשחק
    initButtons();
}

// טיפול בשינוי מצב משחק
function handleGameModeChange(e) {
    gameMode = e.target.value;
    const aiSettings = document.getElementById('aiSettings');
    const playerSymbolSelector = document.getElementById('playerSymbolSelector');
    
    console.log('Game mode changed to:', gameMode);
    
    if (gameMode === 'vs-ai') {
        if (aiSettings) aiSettings.style.display = 'flex';
        if (playerSymbolSelector) playerSymbolSelector.style.display = 'flex';
        playerSymbol = 'X'; // ברירת מחדל
        const xBtn = document.querySelector('.symbol-btn[data-symbol="X"]');
        const oBtn = document.querySelector('.symbol-btn[data-symbol="O"]');
        if (xBtn) xBtn.classList.add('active');
        if (oBtn) oBtn.classList.remove('active');
        console.log('AI mode enabled, player symbol:', playerSymbol);
    } else {
        if (aiSettings) aiSettings.style.display = 'none';
        if (playerSymbolSelector) playerSymbolSelector.style.display = 'none';
        playerSymbol = 'X';
        console.log('Two players mode enabled');
    }
    
    reset();
}

// הצגת הודעה
function showMessage(text, color = '#ffffff') {
    const messageEl = document.getElementById('message');
    if (messageEl) {
        messageEl.textContent = text;
        messageEl.style.color = color;
        messageEl.classList.add('show');
        setTimeout(() => {
            messageEl.classList.remove('show');
        }, 3000);
    }
}

// עדכון סטטיסטיקות
function updateStats() {
    const xWinsEl = document.getElementById('xWins');
    const oWinsEl = document.getElementById('oWins');
    const tiesEl = document.getElementById('ties');
    if (xWinsEl) xWinsEl.textContent = xWins;
    if (oWinsEl) oWinsEl.textContent = oWins;
    if (tiesEl) tiesEl.textContent = ties;
}

// עדכון אינדיקטור תור
function updateTurnIndicator() {
    const indicator = document.getElementById('turnIndicator');
    if (indicator) {
        const symbol = turn ? 'X' : 'O';
        indicator.querySelector('.turn-symbol').textContent = symbol;
        indicator.querySelector('.turn-symbol').className = `turn-symbol ${symbol.toLowerCase()}`;
    }
}

// שמירת מהלך להיסטוריה
function saveMove(index, symbol) {
    moveHistory.push({ index, symbol, board: Array.from(btns).map(b => b.textContent) });
}

// ביטול מהלך אחרון
function undoMove() {
    if (gameOver || moveHistory.length === 0) {
        showMessage('לא ניתן לבטל מהלך', '#ff9800');
        return;
    }
    
    if (moveHistory.length === 1) {
        // אם יש רק מהלך אחד, איפוס מלא
        reset();
        return;
    }
    
    // אם זה משחק נגד AI, צריך להסיר שני מהלכים (שחקן + AI)
    if (gameMode === 'vs-ai' && moveHistory.length >= 2) {
        // הסרת המהלך האחרון (AI)
        moveHistory.pop();
        // הסרת המהלך שלפניו (שחקן)
        moveHistory.pop();
        
        if (moveHistory.length > 0) {
            const previousState = moveHistory[moveHistory.length - 1];
            // שחזור הלוח למצב הקודם
            btns.forEach((btn, i) => {
                btn.textContent = previousState.board[i] || '';
                btn.classList.remove('x', 'o', 'winning');
                btn.style.transform = '';
                btn.style.opacity = '1';
                btn.style.animation = '';
            });
            
            // עדכון משתנים
            btnClicked = previousState.board.filter(c => c).length;
            turn = previousState.symbol === 'X' ? false : true;
        } else {
            // אם אין היסטוריה, איפוס מלא
            reset();
            return;
        }
    } else {
        // משחק שני שחקנים - הסר רק מהלך אחד
        moveHistory.pop();
        const previousState = moveHistory[moveHistory.length - 1];
        
        // שחזור הלוח למצב הקודם
        btns.forEach((btn, i) => {
            btn.textContent = previousState.board[i] || '';
            btn.classList.remove('x', 'o', 'winning');
            btn.style.transform = '';
            btn.style.opacity = '1';
            btn.style.animation = '';
        });
        
        // עדכון משתנים
        btnClicked = previousState.board.filter(c => c).length;
        turn = previousState.symbol === 'X' ? false : true;
    }
    
    gameOver = false;
    updateTurnIndicator();
}

// Event listeners לכפתורים - יאותחל אחרי שה-DOM מוכן
function initButtons() {
    btns = document.querySelectorAll(".btn");
    if (btns && btns.length > 0) {
        btns.forEach((b, index) => {
            b.addEventListener("click", () => btnClick(index));
        });
    }
}

// לחיצה על תא
function btnClick(index) {
    const btn = btns[index];
    
    // בדיקות תקינות
    if (btn.textContent !== "" || gameOver) return;
    
    // בדיקה אם זה משחק נגד AI - רק השחקן יכול ללחוץ
    if (gameMode === 'vs-ai') {
        const currentSymbol = turn ? 'X' : 'O';
        if (currentSymbol !== playerSymbol) {
            // זה התור של המחשב, לא של השחקן
            console.log('Not player turn:', { currentSymbol, playerSymbol, turn });
            return;
        }
    }
    
    // ביצוע מהלך
    const symbol = turn ? "X" : "O";
    btn.textContent = symbol;
    btn.classList.add(symbol.toLowerCase());
    
    // אנימציה משופרת
    btn.style.transform = 'scale(0) rotate(180deg)';
    btn.style.opacity = '0';
    setTimeout(() => {
        btn.style.transform = 'scale(1) rotate(0deg)';
        btn.style.opacity = '1';
    }, 150);
    
    // שמירת מהלך
    saveMove(index, symbol);
    btnClicked++;
    
    // סאונד ואפקטים
    playSound('move');
    const rect = btn.getBoundingClientRect();
    createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, symbol === 'X' ? '#ff6b6b' : '#4ecdc4');
    updateParticles();
    
    // איפוס טיימר מהלך
    clearMoveTimer();
    
    // בדיקת ניצחון
    const result = checkWin();
    if (result.win) {
        gameOver = true;
        handleWin(result, symbol);
    } else if (result.isTie) {
        gameOver = true;
        handleTie();
    } else {
        // המשך משחק
        turn = !turn;
        updateTurnIndicator();
        
        // התחלת טיימר חדש
        if (moveTimerEnabled) {
            startMoveTimer();
        }
        
        // אם זה משחק נגד AI, המחשב משחק
        if (gameMode === 'vs-ai' && !gameOver) {
            setTimeout(() => makeAIMove(), 500);
        }
    }
}

// טיפול בניצחון
function handleWin(result, symbol) {
    clearMoveTimer();
    clearGameTimer();
    
        // הדגשת התאים המנצחים
    result.pos.forEach((pos, idx) => {
            btns[pos].classList.add('winning');
        // אנימציית ניצחון
        setTimeout(() => {
            btns[pos].style.animation = 'winPulse 0.6s ease infinite';
        }, 100 * idx);
        
        // חלקיקים בניצחון
        const rect = btns[pos].getBoundingClientRect();
        createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, symbol === 'X' ? '#ff6b6b' : '#4ecdc4', 30);
    });
    updateParticles();
    
    // סאונד ניצחון
    playSound('win');
        
        // שמירת ניצחון
    totalGames++;
    if (symbol === "X") {
            xWins++;
        if (gameMode === 'vs-ai') {
            xWinsVsAI++;
        }
            localStorage.setItem('highscore_tictactoe_x', xWins.toString());
            showMessage('🎉 X ניצח! 🎉', '#ff6b6b');
        } else {
            oWins++;
        if (gameMode === 'vs-ai') {
            oWinsVsAI++;
        }
            localStorage.setItem('highscore_tictactoe_o', oWins.toString());
            showMessage('🎉 O ניצח! 🎉', '#4ecdc4');
        }
        
    localStorage.setItem('highscore_tictactoe_total', totalGames.toString());
    if (gameMode === 'vs-ai') {
        localStorage.setItem('highscore_tictactoe_x_vs_ai', xWinsVsAI.toString());
        localStorage.setItem('highscore_tictactoe_o_vs_ai', oWinsVsAI.toString());
    }
    
    // בדיקת אתגרים
    checkChallenges(`ניצח ${symbol}`, btnClicked);
    
    // שמירת היסטוריה
    saveGameToHistory(`${symbol} ניצח`);
    
    // עדכון סטטיסטיקות
        updateStats();
    updateDetailedStats();
    updateTurnIndicator();
    
    // טורניר
    if (tournamentMode) {
        tournamentScore[symbol]++;
        tournamentRound++;
        if (tournamentRound >= TOURNAMENT_GAMES) {
            endTournament();
        }
    }
        
        setTimeout(() => {
            reset();
    }, 3000);
}

// טיפול בתיקו
function handleTie() {
    clearMoveTimer();
    clearGameTimer();
    
    // סאונד תיקו
    playSound('tie');
    
    // שמירת תיקו
    ties++;
    totalGames++;
    localStorage.setItem('highscore_tictactoe_ties', ties.toString());
    localStorage.setItem('highscore_tictactoe_total', totalGames.toString());
    
    // שמירת היסטוריה
    saveGameToHistory('תיקו');
    
        showMessage('🤝 תיקו! 🤝', '#ffd700');
    updateStats();
    updateDetailedStats();
    
    // טורניר
    if (tournamentMode) {
        tournamentRound++;
        if (tournamentRound >= TOURNAMENT_GAMES) {
            endTournament();
        }
    }
    
    setTimeout(() => {
        reset();
    }, 3000);
}

// איפוס משחק
function reset() {
    btnClicked = 0;
    gameOver = false;
    moveHistory = [];
    turn = true;
    
    // איפוס טיימרים
    clearMoveTimer();
    if (gameTimerEnabled) {
        startGameTimer();
    }
    
    btns.forEach(b => {
        b.textContent = "";
        b.classList.remove('winning', 'x', 'o');
        b.style.transform = '';
        b.style.opacity = '1';
        b.style.animation = '';
    });
    
    updateTurnIndicator();
    
    // אם זה משחק נגד AI ושחקן בחר O, המחשב מתחיל
    if (gameMode === 'vs-ai' && playerSymbol === 'O') {
        setTimeout(() => makeAIMove(), 500);
    } else if (moveTimerEnabled) {
        startMoveTimer();
    }
}

// איפוס לוח - שינוי גודל
function resetBoard() {
    const tictactoeEl = document.querySelector('.tictactoe');
    if (!tictactoeEl) return;
    
    // ניקוי הלוח הישן
    tictactoeEl.innerHTML = '';
    
    // יצירת לוח חדש
    const totalCells = boardSize * boardSize;
    for (let i = 0; i < totalCells; i++) {
        const btn = document.createElement('div');
        btn.className = 'btn';
        tictactoeEl.appendChild(btn);
    }
    
    // עדכון משתנים
    btns = document.querySelectorAll(".btn");
    btnClicked = 0;
    gameOver = false;
    moveHistory = [];
    turn = true;
    
    // עדכון עיצוב
    tictactoeEl.style.width = boardSize === 3 ? '400px' : boardSize === 4 ? '500px' : '600px';
    tictactoeEl.style.height = boardSize === 3 ? '400px' : boardSize === 4 ? '500px' : '600px';
    tictactoeEl.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
    tictactoeEl.style.gridTemplateRows = `repeat(${boardSize}, 1fr)`;
    
    // עדכון גודל פונט
    const fontSize = boardSize === 3 ? '60px' : boardSize === 4 ? '45px' : '35px';
    btns.forEach(b => {
        b.style.fontSize = fontSize;
    });
    
    // Event listeners חדשים
    btns.forEach((b, index) => {
        b.addEventListener("click", () => btnClick(index));
    });
    
    updateTurnIndicator();
    
    // אם זה משחק נגד AI ושחקן בחר O, המחשב מתחיל
    if (gameMode === 'vs-ai' && playerSymbol === 'O') {
        setTimeout(() => makeAIMove(), 500);
    }
}

// בדיקת ניצחון - תומך ב-3x3, 4x4, 5x5
function checkWin() {
    const obj = { win: false, isTie: false, pos: [] };
    const totalCells = boardSize * boardSize;
    
    // יצירת תנאי ניצחון דינמיים
    const winConditions = [];
    
    // שורות
    for (let row = 0; row < boardSize; row++) {
        const condition = [];
        for (let col = 0; col < boardSize; col++) {
            condition.push(row * boardSize + col);
        }
        winConditions.push(condition);
    }
    
    // עמודות
    for (let col = 0; col < boardSize; col++) {
        const condition = [];
        for (let row = 0; row < boardSize; row++) {
            condition.push(row * boardSize + col);
        }
        winConditions.push(condition);
    }
    
    // אלכסון ראשי
    const diag1 = [];
    for (let i = 0; i < boardSize; i++) {
        diag1.push(i * boardSize + i);
    }
    winConditions.push(diag1);
    
    // אלכסון משני
    const diag2 = [];
    for (let i = 0; i < boardSize; i++) {
        diag2.push(i * boardSize + (boardSize - 1 - i));
    }
    winConditions.push(diag2);
    
    // בדיקת תנאי ניצחון
    for (let condition of winConditions) {
        if (condition.length === 0) continue;
        
        const firstSymbol = btns[condition[0]]?.textContent;
        if (!firstSymbol) continue;
        
        const allMatch = condition.every(index => 
            btns[index] && btns[index].textContent === firstSymbol
        );
        
        if (allMatch) {
            obj.win = true;
            obj.pos = condition;
            return obj;
        }
    }
    
    // בדיקת תיקו
    if (btnClicked === totalCells) {
        obj.isTie = true;
    }
    
    return obj;
}

// AI - קבלת הלוח הנוכחי
function getBoard() {
    return Array.from(btns).map(b => b.textContent);
}

// AI - בדיקת ניצחון אפשרי (תומך בכל הגדלים)
function checkWinForSymbol(board, symbol) {
    // יצירת תנאי ניצחון דינמיים
    const winConditions = [];
    
    // שורות
    for (let row = 0; row < boardSize; row++) {
        const condition = [];
        for (let col = 0; col < boardSize; col++) {
            condition.push(row * boardSize + col);
        }
        winConditions.push(condition);
    }
    
    // עמודות
    for (let col = 0; col < boardSize; col++) {
        const condition = [];
        for (let row = 0; row < boardSize; row++) {
            condition.push(row * boardSize + col);
        }
        winConditions.push(condition);
    }
    
    // אלכסון ראשי
    const diag1 = [];
    for (let i = 0; i < boardSize; i++) {
        diag1.push(i * boardSize + i);
    }
    winConditions.push(diag1);
    
    // אלכסון משני
    const diag2 = [];
    for (let i = 0; i < boardSize; i++) {
        diag2.push(i * boardSize + (boardSize - 1 - i));
    }
    winConditions.push(diag2);
    
    // בדיקה
    for (let condition of winConditions) {
        const values = condition.map(i => board[i]);
        const count = values.filter(v => v === symbol).length;
        const empty = values.filter(v => v === '').length;
        
        if (count === boardSize - 1 && empty === 1) {
            return condition.find(i => board[i] === '');
        }
    }
    return -1;
}

// AI - מציאת מהלך אופטימלי (תומך בכל הגדלים)
function findBestMove(board, aiSymbol, playerSymbol) {
    // 1. נסה לנצח
    const winMove = checkWinForSymbol(board, aiSymbol);
    if (winMove !== -1) return winMove;
    
    // 2. חסום את השחקן
    const blockMove = checkWinForSymbol(board, playerSymbol);
    if (blockMove !== -1) return blockMove;
    
    // 3. קח את המרכז אם פנוי
    const center = Math.floor((boardSize * boardSize) / 2);
    if (board[center] === '') return center;
    
    // 4. קח פינה אם פנויה (רק ב-3x3)
    if (boardSize === 3) {
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => board[i] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
    }
    
    // 5. כל מקום פנוי
    const available = board.map((cell, i) => cell === '' ? i : -1).filter(i => i !== -1);
    if (available.length === 0) return -1;
    return available[Math.floor(Math.random() * available.length)];
}

// AI - ביצוע מהלך
function makeAIMove() {
    if (gameOver) return;
    
    // בדיקה שהמחשב צריך לשחק
    const aiSymbol = playerSymbol === 'X' ? 'O' : 'X';
    const currentSymbol = turn ? 'X' : 'O';
    
    // אם זה לא התור של המחשב, לא לעשות כלום
    if (currentSymbol !== aiSymbol) {
        console.log('Not AI turn:', { currentSymbol, aiSymbol, playerSymbol, turn });
        return;
    }
    
    const board = getBoard();
    
    let moveIndex;
    
    if (aiDifficulty === 'easy') {
        // רמה קלה - מהלכים אקראיים
        const available = board.map((cell, i) => cell === '' ? i : -1).filter(i => i !== -1);
        if (available.length === 0) {
            console.log('No available moves');
            return;
        }
        moveIndex = available[Math.floor(Math.random() * available.length)];
    } else if (aiDifficulty === 'medium') {
        // רמה בינונית - 70% מהלכים חכמים, 30% אקראיים
        if (Math.random() < 0.7) {
            moveIndex = findBestMove(board, aiSymbol, playerSymbol);
        } else {
            const available = board.map((cell, i) => cell === '' ? i : -1).filter(i => i !== -1);
            if (available.length === 0) {
                console.log('No available moves');
                return;
            }
            moveIndex = available[Math.floor(Math.random() * available.length)];
        }
    } else {
        // רמה קשה - תמיד מהלכים אופטימליים
        moveIndex = findBestMove(board, aiSymbol, playerSymbol);
    }
    
    if (moveIndex === undefined || moveIndex === -1) {
        console.log('Invalid move index:', moveIndex);
        return;
    }
    
    if (!btns || !btns[moveIndex] || btns[moveIndex].textContent !== '') {
        console.log('Cell not empty or buttons not found');
        return;
    }
    
    // ביצוע המהלך ישירות (בלי לקרוא ל-btnClick כדי למנוע בדיקות)
    const btn = btns[moveIndex];
    btn.textContent = aiSymbol;
    btn.classList.add(aiSymbol.toLowerCase());
    
    // אנימציה
    btn.style.transform = 'scale(0) rotate(180deg)';
    btn.style.opacity = '0';
    setTimeout(() => {
        btn.style.transform = 'scale(1) rotate(0deg)';
        btn.style.opacity = '1';
    }, 150);
    
    // שמירת מהלך
    saveMove(moveIndex, aiSymbol);
    btnClicked++;
    
    // סאונד ואפקטים
    playSound('move');
    const rect = btn.getBoundingClientRect();
    createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, aiSymbol === 'X' ? '#ff6b6b' : '#4ecdc4');
    updateParticles();
    
    // איפוס טיימר מהלך
    clearMoveTimer();
    
    // בדיקת ניצחון
    const result = checkWin();
    if (result.win) {
        gameOver = true;
        handleWin(result, aiSymbol);
    } else if (result.isTie) {
        gameOver = true;
        handleTie();
    } else {
        // המשך משחק - עכשיו התור של השחקן
        turn = !turn;
        updateTurnIndicator();
        
        // התחלת טיימר חדש
        if (moveTimerEnabled) {
            startMoveTimer();
        }
    }
}

// ========== טיימר ==========
function startMoveTimer() {
    if (!moveTimerEnabled || gameOver) return;
    
    clearMoveTimer();
    moveTimeLeft = 30;
    updateMoveTimerDisplay();
    
    moveTimer = setInterval(() => {
        moveTimeLeft--;
        updateMoveTimerDisplay();
        
        if (moveTimeLeft <= 0) {
            clearMoveTimer();
            handleTimeOut();
        } else if (moveTimeLeft <= 5) {
            // התראה כשהזמן נגמר (לא משעמם)
            const timerEl = document.getElementById('moveTimer');
            if (timerEl) {
                timerEl.style.animation = 'pulse 0.5s ease';
                setTimeout(() => timerEl.style.animation = '', 500);
            }
        }
    }, 1000);
}

function clearMoveTimer() {
    if (moveTimer) {
        clearInterval(moveTimer);
        moveTimer = null;
    }
}

function updateMoveTimerDisplay() {
    const timerEl = document.getElementById('moveTimer');
    if (timerEl) {
        timerEl.textContent = `${moveTimeLeft}ש`;
        if (moveTimeLeft <= 5) {
            timerEl.style.color = '#ff6b6b';
        } else {
            timerEl.style.color = 'white';
        }
    }
}

function handleTimeOut() {
    if (gameOver) return;
    
    // המהלך עובר לשחקן השני
    turn = !turn;
    updateTurnIndicator();
    playSound('timeout');
    showMessage('⏰ הזמן נגמר! התור עובר', '#ff9800');
    
    // אם זה משחק נגד AI, המחשב משחק
    if (gameMode === 'vs-ai' && !gameOver) {
        setTimeout(() => makeAIMove(), 500);
    } else {
        startMoveTimer();
    }
}

function startGameTimer() {
    if (!gameTimerEnabled) return;
    
    gameStartTime = Date.now();
    clearGameTimer();
    
    gameTimerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const timerEl = document.getElementById('gameTimer');
        if (timerEl) {
            timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

function clearGameTimer() {
    if (gameTimerInterval) {
        clearInterval(gameTimerInterval);
        gameTimerInterval = null;
    }
}

// ========== סאונד ==========
function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.warn('Audio not supported');
    }
}

function playSound(type) {
    if (!soundEnabled || !audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
        case 'win':
            oscillator.frequency.value = 523.25; // C5
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
            
            // צליל נוסף
            setTimeout(() => {
                const osc2 = audioContext.createOscillator();
                const gain2 = audioContext.createGain();
                osc2.connect(gain2);
                gain2.connect(audioContext.destination);
                osc2.frequency.value = 659.25; // E5
                gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                osc2.start();
                osc2.stop(audioContext.currentTime + 0.5);
            }, 100);
            break;
            
        case 'tie':
            oscillator.frequency.value = 392; // G4
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
            
        case 'move':
            oscillator.frequency.value = 440; // A4
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
            
        case 'timeout':
            oscillator.frequency.value = 200; // נמוך
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
            break;
    }
}

// ========== אפקטים ויזואליים ==========
function createParticles(x, y, color, count = 20) {
    if (!backgroundAnimation) return;
    
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 30,
            color: color,
            size: Math.random() * 4 + 2
        });
    }
}

function updateParticles() {
    if (!backgroundAnimation) {
        particles = [];
        return;
    }
    
    const canvas = document.getElementById('particlesCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        
        if (p.life > 0) {
            ctx.globalAlpha = p.life / 30;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        } else {
            particles.splice(i, 1);
        }
    }
    
    if (particles.length > 0) {
        requestAnimationFrame(updateParticles);
    }
}

function createParticlesCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particlesCanvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '999';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ========== סטטיסטיקות ==========
function updateDetailedStats() {
    const statsEl = document.getElementById('detailedStats');
    if (!statsEl) return;
    
    const total = xWins + oWins + ties;
    const xWinRate = total > 0 ? Math.round((xWins / total) * 100) : 0;
    const oWinRate = total > 0 ? Math.round((oWins / total) * 100) : 0;
    const isCollapsed = statsEl.classList.contains('collapsed');
    
    statsEl.innerHTML = `
        <h3>📊 סטטיסטיקות מפורטות</h3>
        <div class="stat-detail">
            <span class="stat-label">אחוז ניצחונות X:</span>
            <span class="stat-value">${xWinRate}%</span>
        </div>
        <div class="stat-detail">
            <span class="stat-label">אחוז ניצחונות O:</span>
            <span class="stat-value">${oWinRate}%</span>
        </div>
        <div class="stat-detail">
            <span class="stat-label">משחקים כולל:</span>
            <span class="stat-value">${totalGames}</span>
        </div>
        <div class="stat-detail">
            <span class="stat-label">ניצחונות נגד מחשב:</span>
            <span class="stat-value">X: ${xWinsVsAI} | O: ${oWinsVsAI}</span>
        </div>
    `;
    
    if (isCollapsed) {
        statsEl.classList.add('collapsed');
    }
    
    // Event listener ל-collapse
    const h3 = statsEl.querySelector('h3');
    if (h3) {
        h3.addEventListener('click', () => {
            statsEl.classList.toggle('collapsed');
        });
    }
}

// ========== היסטוריית משחקים ==========
function saveGameToHistory(result) {
    const gameData = {
        id: Date.now(),
        date: new Date().toLocaleString('he-IL'),
        result: result,
        moves: moveHistory.map(m => ({ index: m.index, symbol: m.symbol })),
        boardSize: boardSize,
        mode: gameMode
    };
    
    gameHistory.unshift(gameData);
    if (gameHistory.length > MAX_HISTORY) {
        gameHistory.pop();
    }
    
    localStorage.setItem('highscore_tictactoe_history', JSON.stringify(gameHistory));
}

function showGameHistory() {
    const historyEl = document.getElementById('gameHistory');
    if (!historyEl) return;
    
    if (gameHistory.length === 0) {
        historyEl.innerHTML = '<p style="color: rgba(255,255,255,0.7);">אין היסטוריה</p>';
        return;
    }
    
    historyEl.innerHTML = gameHistory.map(game => `
        <div class="history-item" data-game-id="${game.id}">
            <div class="history-date">${game.date}</div>
            <div class="history-result">${game.result}</div>
            <div class="history-mode">${game.mode === 'vs-ai' ? 'נגד מחשב' : 'שני שחקנים'}</div>
        </div>
    `).join('');
    
    // Event listeners להיסטוריה
    historyEl.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            const gameId = parseInt(item.dataset.gameId);
            replayGame(gameId);
        });
    });
}

function replayGame(gameId) {
    const game = gameHistory.find(g => g.id === gameId);
    if (!game) return;
    
    // שחזור המשחק
    reset();
    boardSize = game.boardSize;
    gameMode = game.mode;
    
    // שחזור מהלכים
    setTimeout(() => {
        game.moves.forEach((move, index) => {
            setTimeout(() => {
                if (btns[move.index]) {
                    btnClick(move.index);
                }
            }, index * 500);
        });
    }, 500);
}

// ========== טורניר ==========
function startTournament() {
    tournamentMode = true;
    tournamentGames = [];
    tournamentScore = { X: 0, O: 0 };
    tournamentRound = 0;
    
    showMessage('🏆 טורניר התחיל! 5 משחקים', '#ffd700');
    reset();
}

function endTournament() {
    tournamentMode = false;
    const winner = tournamentScore.X > tournamentScore.O ? 'X' : 
                   tournamentScore.O > tournamentScore.X ? 'O' : 'תיקו';
    
    showMessage(`🏆 טורניר הסתיים! המנצח: ${winner}`, '#ffd700');
    tournamentScore = { X: 0, O: 0 };
    tournamentRound = 0;
}

// ========== אתגרים ==========
function updateChallengesList() {
    const listEl = document.getElementById('challengesList');
    if (!listEl) return;
    
    listEl.innerHTML = challenges.map(challenge => `
        <div class="challenge-item ${challenge.completed ? 'completed' : ''}">
            <div class="challenge-name">${challenge.name}</div>
            <div class="challenge-desc">${challenge.desc}</div>
            ${challenge.completed ? '<span class="challenge-check">✓</span>' : ''}
        </div>
    `).join('');
}

function checkChallenges(result, moves) {
    challenges.forEach(challenge => {
        if (challenge.completed) return;
        
        switch(challenge.id) {
            case 'win_fast':
                if (result.includes('ניצח') && moves <= 5) {
                    challenge.completed = true;
                    showMessage(`🎯 אתגר הושלם: ${challenge.name}!`, '#4caf50');
                    playSound('win');
                    updateChallengesList();
                }
                break;
            case 'perfect_game':
                // נצח בלי להפסיד תא - צריך לבדוק
                if (result.includes('ניצח') && moves <= boardSize) {
                    challenge.completed = true;
                    showMessage(`🎯 אתגר הושלם: ${challenge.name}!`, '#4caf50');
                    playSound('win');
                    updateChallengesList();
                }
                break;
            case 'ai_destroyer':
                if (result.includes('ניצח') && gameMode === 'vs-ai' && aiDifficulty === 'hard') {
                    challenge.completed = true;
                    showMessage(`🎯 אתגר הושלם: ${challenge.name}!`, '#4caf50');
                    playSound('win');
                    updateChallengesList();
                }
                break;
            case 'speed_demon':
                if (result.includes('ניצח') && gameStartTime) {
                    const timeElapsed = (Date.now() - gameStartTime) / 1000;
                    if (timeElapsed <= 10) {
                        challenge.completed = true;
                        showMessage(`🎯 אתגר הושלם: ${challenge.name}!`, '#4caf50');
                        playSound('win');
                        updateChallengesList();
                    }
                }
                break;
        }
    });
}

// ========== שיתוף ==========
function shareResult(result) {
    const text = `🎮 איקס עיגול - ${result}\n\nניצחונות X: ${xWins}\nניצחונות O: ${oWins}\nתיקו: ${ties}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'איקס עיגול',
            text: text
        });
    } else {
        // Fallback - העתקה ללוח
        navigator.clipboard.writeText(text).then(() => {
            showMessage('✅ התוצאה הועתקה ללוח!', '#4caf50');
        });
    }
}

// אתחול - מחכה ל-DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function init() {
    console.log('Initializing game...');
    
    // אתחול btns
    btns = document.querySelectorAll(".btn");
    if (!btns || btns.length === 0) {
        console.error('Buttons not found!');
        setTimeout(init, 100); // נסה שוב
        return;
    }
    
    // יצירת UI
createUI();
    
    // עדכון כל הנתונים
    setTimeout(() => {
        console.log('Updating UI elements...');
updateStats();
        updateTurnIndicator();
        initAudio();
        createParticlesCanvas();
        updateDetailedStats();
        showGameHistory();
        updateChallengesList();
        console.log('Game initialized!');
    }, 100);
}
