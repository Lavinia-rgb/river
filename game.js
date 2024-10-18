const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let airplane = { x: canvas.width / 2 - 25, y: canvas.height - 100, width: 50, height: 50 };
let bullets = [];
let enemies = [];
let score = 0;
let keys = {};
let username = null;
let fuel = 100;
let gameOver = false;

// Função para iniciar o jogo após o login
function startGame() {
    const userInput = document.getElementById('username').value;

    if (userInput) {
        username = userInput;
        document.getElementById('loginScreen').style.display = 'none';
        canvas.style.display = 'block';
        loadHighScores();
        update();
    } else {
        alert('Por favor, insira um nome de usuário!');
    }
}

// Função para desenhar o avião
function drawAirplane() {
    ctx.fillStyle = 'green';
    ctx.fillRect(airplane.x, airplane.y, airplane.width, airplane.height);
}

// Função para desenhar balas
function drawBullets() {
    ctx.fillStyle = 'yellow';
    bullets.forEach((bullet, index) => {
        bullet.y -= 5;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        // Remove bala se sair da tela
        if (bullet.y < 0) bullets.splice(index, 1);
    });
}

// Função para gerar inimigos
function spawnEnemies() {
    if (Math.random() < 0.02) {
        let size = 50;
        let x = Math.random() * (canvas.width - size);
        enemies.push({ x, y: -size, width: size, height: size });
    }
}

// Função para desenhar inimigos
function drawEnemies() {
    ctx.fillStyle = 'red';
    enemies.forEach((enemy, index) => {
        enemy.y += 2;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        // Remove inimigos que saem da tela
        if (enemy.y > canvas.height) enemies.splice(index, 1);
    });
}

// Função para verificar colisão
function checkCollisions() {
    enemies.forEach((enemy, enemyIndex) => {
        bullets.forEach((bullet, bulletIndex) => {
            if (bullet.x < enemy.x + enemy.width && bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height && bullet.y + bullet.height > enemy.y) {
                // Colisão detectada (bala e inimigo)
                enemies.splice(enemyIndex, 1);
                bullets.splice(bulletIndex, 1);
                score += 10;  // Aumenta a pontuação
            }
        });

        // Colisão do avião com inimigos
        if (airplane.x < enemy.x + enemy.width && airplane.x + airplane.width > enemy.x &&
            airplane.y < enemy.y + enemy.height && airplane.y + airplane.height > enemy.y) {
            endGame();
        }
    });
}

// Função para salvar pontuação no localStorage
function saveScore() {
    let scores = JSON.parse(localStorage.getItem('scores')) || [];
    scores.push({ username: username, score: score });
    localStorage.setItem('scores', JSON.stringify(scores));
}

// Função para carregar e exibir pontuações anteriores
function loadHighScores() {
    let scores = JSON.parse(localStorage.getItem('scores')) || [];
    let highScoresDiv = document.getElementById('highScores');
    highScoresDiv.innerHTML = '<h3>High Scores:</h3>';

    scores
        .sort((a, b) => b.score - a.score) // Ordenar por pontuação
        .slice(0, 5) // Mostrar os 5 melhores
        .forEach(score => {
            highScoresDiv.innerHTML += `<p>${score.username}: ${score.score}</p>`;
        });
}

// Função para atualizar o combustível
function updateFuel() {
    fuel -= 0.1;
    if (fuel <= 0) {
        endGame();
    }
}

// Função para terminar o jogo
function endGame() {
    gameOver = true;
    alert(`Game Over! Pontuação final: ${score}`);
    saveScore();
    document.location.reload();
}

// Função para atualizar o jogo
function update() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawAirplane();
    drawBullets();
    drawEnemies();
    checkCollisions();
    updateFuel();

    // Atualiza pontuação
    document.getElementById('score').innerText = `Score: ${score}`;

    // Movimentação do avião
    if (keys.ArrowLeft && airplane.x > 0) airplane.x -= 5;
    if (keys.ArrowRight && airplane.x < canvas.width - airplane.width) airplane.x += 5;
    if (keys.ArrowUp && airplane.y > 0) airplane.y -= 5;
    if (keys.ArrowDown && airplane.y < canvas.height - airplane.height) airplane.y += 5;

    spawnEnemies();
    requestAnimationFrame(update);
}

// Captura das teclas para movimentação
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Função para disparar tiros automaticamente
setInterval(() => {
    if (!gameOver) {
        bullets.push({ x: airplane.x + airplane.width / 2 - 5, y: airplane.y, width: 10, height: 20 });
    }
}, 300);  // Dispara a cada 300ms

