const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
let falling = [];
let score = 0;
let errors = 0;
let speed = 1;
let gameOver = false;

const scoreEl = document.getElementById("score");
const errorEl = document.getElementById("errors");
const overlay = document.getElementById("gameover");

class FallingLetter {
    constructor() {
        this.char = letters[Math.floor(Math.random() * letters.length)];
        this.x = Math.random() * (canvas.width - 20);
        this.y = -20;
        this.speed = 1 + Math.random() * speed;
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            errors++;
            errorEl.textContent = errors;
            if (errors >= 5) endGame();
            return false;
        }
        return true;
    }

    draw() {
        ctx.fillStyle = "#0f0";
        ctx.font = "20px Share Tech Mono";
        ctx.fillText(this.char, this.x, this.y);
    }
}

function spawn() {
    if (!gameOver && Math.random() < 0.03) {
        falling.push(new FallingLetter());
    }
}

function draw() {
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    spawn();

    falling = falling.filter(letter => {
        letter.draw();
        return letter.update();
    });

    requestAnimationFrame(draw);
}

document.addEventListener("keydown", e => {
    if (gameOver && e.key === "Enter") restart();

    for (let i = 0; i < falling.length; i++) {
        if (e.key.toUpperCase() === falling[i].char) {
            falling.splice(i, 1);
            score++;
            speed += 0.05;
            scoreEl.textContent = score;
            break;
        }
    }
});

function endGame() {
    gameOver = true;
    overlay.style.visibility = "visible";
}

function restart() {
    falling = [];
    score = 0;
    errors = 0;
    speed = 1;
    gameOver = false;
    scoreEl.textContent = score;
    errorEl.textContent = errors;
    overlay.style.visibility = "hidden";
}

draw();
