let mic, amp;
let level = 0;

let ball;
let colors = ["red", "green", "blue"];
let activeColor = "red";

let started = false;

function setup() {
  createCanvas(400, 600);
  textAlign(CENTER, CENTER);

  mic = new p5.AudioIn();
  amp = new p5.Amplitude();
}

function draw() {
  background(20);

  if (!started) {
    fill(255);
    textSize(20);
    text("TOCA LA PANTALLA\nPER ACTIVAR EL MICRÒFON", width/2, height/2);
    return;
  }

  level = amp.getLevel();

  checkMicInput();

  ball.update();
  ball.show();

  drawUI();
}

// 🔓 DESBLOQUEIG D’ÀUDIO (OBLIGATORI)
function mousePressed() {
  if (!started) {
    userStartAudio();
    mic.start();
    amp.setInput(mic);

    ball = new FallingBall();
    started = true;
  }
}

// 📢 CONTROL AMB SOROLL
function checkMicInput() {
  if (level > 0.015 && level < 0.035) {
    activeColor = "red";
  } else if (level >= 0.035 && level < 0.06) {
    activeColor = "green";
  } else if (level >= 0.06) {
    activeColor = "blue";
  }
}

// 🎨 UI
function drawUI() {
  fill(255);
  textSize(16);
  text("Color actiu: " + activeColor, width/2, 30);
  text("Volum: " + level.toFixed(3), width/2, 55);

  // Barra volum
  noStroke();
  fill(100);
  rect(100, height - 30, 200, 10);
  fill(0, 255, 0);
  rect(100, height - 30, level * 3000, 10);
}

// 🔵 BOLA QUE CAU
class FallingBall {
  constructor() {
    this.x = width / 2;
    this.y = -20;
    this.r = 20;
    this.speed = 3;
    this.colorName = random(colors);
  }

  update() {
    this.y += this.speed;

    if (this.y > height - 60) {
      if (this.colorName === activeColor) {
        this.reset();
      } else {
        noLoop();
        fill(255, 0, 0);
        textSize(30);
        text("GAME OVER", width/2, height/2);
      }
    }
  }

  reset() {
    this.y = -20;
    this.colorName = random(colors);
  }

  show() {
    if (this.colorName === "red") fill(255, 0, 0);
    if (this.colorName === "green") fill(0, 255, 0);
    if (this.colorName === "blue") fill(0, 0, 255);
    noStroke();
    circle(this.x, this.y, this.r * 2);
  }
}
