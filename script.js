// Konstanta game
const GRID_SIZE = 20;
const GAME_SPEED = 150;

// Variabel game
let canvas, ctx;
let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = 0;
let gameInterval;
let isPaused = false;
let gameOver = false;

// Elemen DOM
let scoreElement, highScoreElement, finalScoreElement;
let startBtn, pauseBtn, restartBtn;
let gameOverElement;

// Inisialisasi game
function init() {
    // Dapatkan elemen DOM
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    scoreElement = document.getElementById('score');
    highScoreElement = document.getElementById('high-score');
    finalScoreElement = document.getElementById('final-score');
    
    startBtn = document.getElementById('start-btn');
    pauseBtn = document.getElementById('pause-btn');
    restartBtn = document.getElementById('restart-btn');
    
    gameOverElement = document.getElementById('game-over');
    
    // Muat rekor tertinggi dari localStorage
    highScore = localStorage.getItem('snakeHighScore') || 0;
    highScoreElement.textContent = highScore;
    
    // Setup event listeners
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', restartGame);
    document.addEventListener('keydown', handleKeyPress);
    
    // Gambar layar awal
    drawInitialScreen();
}

// Gambar layar awal
function drawInitialScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Gambar latar belakang
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Gambar judul
    ctx.fillStyle = '#4CAF50';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Ular', canvas.width / 2, canvas.height / 2 - 30);
    
    // Gambar instruksi
    ctx.fillStyle = '#FFF';
    ctx.font = '16px Arial';
    ctx.fillText('Klik "Mulai" untuk memulai game', canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText('Gunakan tombol panah atau WASD', canvas.width / 2, canvas.height / 2 + 40);
}

// Mulai game
function startGame() {
    if (gameInterval) return;
    
    // Reset status game
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    
    generateFood();
    score = 0;
    dx = 1;
    dy = 0;
    isPaused = false;
    gameOver = false;
    
    // Update UI
    scoreElement.textContent = score;
    gameOverElement.classList.add('hidden');
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    pauseBtn.textContent = 'Jeda';
    
    // Mulai game loop
    gameInterval = setInterval(gameLoop, GAME_SPEED);
}

// Generate makanan di posisi acak
function generateFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / GRID_SIZE)),
        y: Math.floor(Math.random() * (canvas.height / GRID_SIZE))
    };
    
    // Pastikan makanan tidak muncul di atas ular
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            break;
        }
    }
}

// Game loop utama
function gameLoop() {
    if (isPaused || gameOver) return;
    
    moveSnake();
    checkCollision();
    draw();
}

// Gerakkan ular
function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
    
    // Cek jika ular memakan makanan
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();
    } else {
        snake.pop();
    }
}

// Cek tabrakan
function checkCollision() {
    const head = snake[0];
    
    // Tabrakan dengan dinding
    if (
        head.x < 0 || 
        head.x >= canvas.width / GRID_SIZE || 
        head.y < 0 || 
        head.y >= canvas.height / GRID_SIZE
    ) {
        endGame();
        return;
    }
    
    // Tabrakan dengan tubuh sendiri
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            endGame();
            return;
        }
    }
}

// Gambar game
function draw() {
    // Bersihkan canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Gambar ular
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#4CAF50' : '#8BC34A';
        ctx.fillRect(
            segment.x * GRID_SIZE, 
            segment.y * GRID_SIZE, 
            GRID_SIZE, 
            GRID_SIZE
        );
        
        // Gambar border untuk segment ular
        ctx.strokeStyle = '#000';
        ctx.strokeRect(
            segment.x * GRID_SIZE, 
            segment.y * GRID_SIZE, 
            GRID_SIZE, 
            GRID_SIZE
        );
    });
    
    // Gambar makanan
    ctx.fillStyle = '#FF5252';
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// Handle input keyboard
function handleKeyPress(e) {
    if (gameOver) return;
    
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (dy !== 1) {
                dx = 0;
                dy = -1;
            }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (dy !== -1) {
                dx = 0;
                dy = 1;
            }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (dx !== 1) {
                dx = -1;
                dy = 0;
            }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (dx !== -1) {
                dx = 1;
                dy = 0;
            }
            break;
        case ' ':
            togglePause();
            break;
    }
}

// Jeda/lanjutkan game
function togglePause() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Lanjutkan' : 'Jeda';
}

// Akhiri game
function endGame() {
    clearInterval(gameInterval);
    gameInterval = null;
    gameOver = true;
    
    // Update rekor tertinggi jika perlu
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('snakeHighScore', highScore);
    }
    
    // Tampilkan layar game over
    finalScoreElement.textContent = score;
    gameOverElement.classList.remove('hidden');
    
    // Update tombol
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// Mulai ulang game
function restartGame() {
    endGame();
    startGame();
}

// Jalankan game saat halaman dimuat
window.addEventListener('load', init);