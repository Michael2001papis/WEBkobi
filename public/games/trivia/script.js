const questionElement = document.getElementById('question');
const answerButtons = [
    document.getElementById('answer-1'),
    document.getElementById('answer-2'),
    document.getElementById('answer-3'),
    document.getElementById('answer-4')
];
const resultElement = document.getElementById('result');
const scoreElement = document.getElementById('score');
const resetButton = document.getElementById('reset');
const newGameButton = document.getElementById('new-game');

const questions = [
    { "question": "מהו שם מדינת האי של האי קריביים?", "answers": ["הונדורס", "ג'מייקה", "אורוגוואי", "קולומביה"], "correctAnswer": 1 },
    { "question": "מהי השפה המדוברת ביותר בעולם?", "answers": ["אנגלית", "סינית", "ספרדית", "ערבית"], "correctAnswer": 1 },
    { "question": "איזה גוף נחשב לגורם שמבצע את תהליך הנשימה?", "answers": ["העור", "הריאות", "הכבד", "הלב"], "correctAnswer": 1 },
    { "question": "מהו הים הרחב ביותר?", "answers": ["הים התיכון", "הים האדום", "הים הצפוני", "הים השחור"], "correctAnswer": 0 },
    { "question": "מהו המזון שנחשב לטעים ביותר בעולם?", "answers": ["פיצה", "סושי", "פסטה", "המבורגר"], "correctAnswer": 0 },
    { "question": "מהי העיר אשר נמצאת על שני היבשות, אסיה ואירופה?", "answers": ["איסטנבול", "ברצלונה", "רומא", "פריז"], "correctAnswer": 0 },
    { "question": "מהו צבע הבזיליקום?", "answers": ["ירוק", "אדום", "צהוב", "כחול"], "correctAnswer": 0 },
    { "question": "מי כתב את ספרי 'ההרפתקאות של הילד הארי פוטר'?", "answers": ["ג'ורג' אורוול", "ג'יי קיי רולינג", "לואיס קרול", "הנס כריסטיאן אנדרסן"], "correctAnswer": 1 },
    { "question": "מהי הגבעה שמרבית המבקרים פוגשים כאתר בולט בהודו?", "answers": ["ההימלאיה", "הר האוורסט", "ההר ראג'מא", "ההר חימלאיה"], "correctAnswer": 0 },
    { "question": "מהי בירת ישראל?", "answers": ["תל אביב", "חיפה", "ירושלים", "באר שבע"], "correctAnswer": 2 },
    { "question": "מהו צבע השמיים ביום בהיר?", "answers": ["אדום", "כחול", "ירוק", "צהוב"], "correctAnswer": 1 },
    { "question": "כמה ימים יש בשנה מעוברת?", "answers": ["365", "366", "367", "368"], "correctAnswer": 1 },
    { "question": "מהו החודש האחרון בשנה?", "answers": ["נובמבר", "דצמבר", "יולי", "אוגוסט"], "correctAnswer": 1 },
    { "question": "איזו עיר היא בירת צרפת?", "answers": ["ברצלונה", "פריז", "רומא", "לונדון"], "correctAnswer": 1 }
];

let score = 0;
let currentQuestionIndex = 0;
let highScore = parseFloat(localStorage.getItem('highscore_trivia') || '0');

// יצירת UI
function createUI() {
    const questionArea = document.getElementById('question-area');
    
    // Progress bar
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-bar';
    progressContainer.innerHTML = '<div class="progress-fill" id="progressFill"></div>';
    questionArea.insertBefore(progressContainer, questionElement);
    
    // Question number
    const questionNumber = document.createElement('div');
    questionNumber.className = 'question-number';
    questionNumber.id = 'questionNumber';
    questionArea.insertBefore(questionNumber, questionElement);
    
    // Answers container
    const answersContainer = document.createElement('div');
    answersContainer.className = 'answers-container';
    answerButtons.forEach(btn => {
        answersContainer.appendChild(btn);
    });
    questionArea.appendChild(answersContainer);
    
    // Controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'controls';
    controlsContainer.appendChild(resetButton);
    controlsContainer.appendChild(newGameButton);
    document.body.appendChild(controlsContainer);
    
    // Message element
    const message = document.createElement('div');
    message.className = 'message';
    message.id = 'message';
    document.body.appendChild(message);
}

function showMessage(text, type = '') {
    const messageEl = document.getElementById('message');
    if (messageEl) {
        messageEl.textContent = text;
        messageEl.className = `message show ${type}`;
        setTimeout(() => {
            messageEl.classList.remove('show');
        }, 1500);
    }
}

function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const questionNumber = document.getElementById('questionNumber');
    if (progressFill) {
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        progressFill.style.width = progress + '%';
    }
    if (questionNumber) {
        questionNumber.textContent = `שאלה ${currentQuestionIndex + 1} מתוך ${questions.length}`;
    }
}

function displayQuestion() {
    const questionData = questions[currentQuestionIndex];
    questionElement.innerText = questionData.question;
    
    answerButtons.forEach((button, index) => {
        button.innerText = questionData.answers[index];
        button.onclick = () => checkAnswer(index);
        button.disabled = false;
        button.classList.remove('correct', 'incorrect');
    });
    
    updateProgress();
}

function checkAnswer(selectedIndex) {
    const questionData = questions[currentQuestionIndex];
    
    // Disable all buttons
    answerButtons.forEach(btn => btn.disabled = true);
    
    // Highlight correct answer
    answerButtons[questionData.correctAnswer].classList.add('correct');
    
    if (selectedIndex === questionData.correctAnswer) {
        score += 7.5;
        answerButtons[selectedIndex].classList.add('correct');
        showMessage('✅ תשובה נכונה!', 'correct');
    } else {
        answerButtons[selectedIndex].classList.add('incorrect');
        showMessage('❌ תשובה שגויה', 'incorrect');
    }
    
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            displayQuestion();
        } else {
            endGame();
        }
    }, 1500);
}

function endGame() {
    document.getElementById('question-area').style.display = 'none';
    
    const scoreArea = document.getElementById('score-area');
    scoreArea.style.display = 'block';
    
    resultElement.innerText = 'המשחק הסתיים!';
    scoreElement.innerText = `${score.toFixed(1)} נקודות`;
    
    // שמירת שיא
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highscore_trivia', highScore.toString());
        const highScoreEl = document.createElement('div');
        highScoreEl.className = 'high-score';
        highScoreEl.innerHTML = `🎉 שיא חדש! השיא הקודם: ${(score - 7.5).toFixed(1)} 🎉`;
        scoreArea.appendChild(highScoreEl);
    } else {
        const highScoreEl = document.createElement('div');
        highScoreEl.className = 'high-score';
        highScoreEl.textContent = `שיא אישי: ${highScore.toFixed(1)} נקודות`;
        scoreArea.appendChild(highScoreEl);
    }
}

resetButton.addEventListener("click", function() {
    score = 0;
    currentQuestionIndex = 0;
    document.getElementById('score-area').style.display = 'none';
    document.getElementById('question-area').style.display = 'block';
    displayQuestion();
});

newGameButton.addEventListener("click", function() {
    window.location.reload();
});

// אתחול
createUI();
displayQuestion();
