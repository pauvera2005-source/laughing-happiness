let agents = [];
let sparks = [];
let numEach = 50;
let mode = "convert";
let moveMode = "random";

let env, osc;

function setup() {
  let c = createCanvas(windowWidth, windowHeight);
  c.parent("sketch-container");

  textAlign(CENTER, CENTER);
  textSize(20);
  noStroke();
  initAgents();

  osc = new p5.Oscillator("triangle");
  osc.start();
  osc.amp(0);
  env = new p5.Envelope();
  env.setADSR(0.001, 0.05, 0.1, 0.2);
  env.setRange(0.3, 0);
}

function initAgents() {
  agents = [];
  let types = ["rock", "paper", "scissors"];
  for (let t of types) {
    for (let i = 0; i < numEach; i++) {
      agents.push(new Agent(t, random(width), random(height)));
    }
  }
}

function draw() {
  background(20, 25, 35, 40);

  for (let a of agents) {
    a.update();
    a.show();
  }

  handleCollisions();

  for (let i = sparks.length - 1; i >= 0; i--) {
    sparks[i].update();
    sparks[i].show();
    if (sparks[i].dead) sparks.splice(i, 1);
  }

  if (sparks.length > 1000) sparks.splice(0, sparks.length - 1000);

  fill(255);
  textAlign(LEFT, TOP);
  text(
    `Agentes: ${agents.length}\nMode: ${mode}\nMoviment: ${moveMode}\n(M per canviar mode / P per moviment)`,
    10,
    10
  );
}

function handleCollisions() {
  let toRemove = [];
  for (let i = 0; i < agents.length; i++) {
    for (let j = i + 1; j < agents.length; j++) {
      let a = agents[i];
      let b = agents[j];
      let d = dist(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
      if (d < 16) {
        let result = resolveCollision(a, b);
        if (result && result.loser && mode === "eliminate") {
          toRemove.push(result.loser);
        }
      }
    }
  }
  if (mode === "eliminate" && toRemove.length > 0) {
    agents = agents.filter(a => !toRemove.includes(a));
  }
}

function resolveCollision(a, b) {
  if (a.type === b.type) return null;
  let winner, loser;
  if (
    (a.type === "rock" && b.type === "scissors") ||
    (a.type === "scissors" && b.type === "paper") ||
    (a.type === "paper" && b.type === "rock")
  ) {
    winner = a;
    loser = b;
  } else {
    winner = b;
    loser = a;
  }
  if (mode === "convert") loser.type = winner.type;
  createSparks(winner.pos.x, winner.pos.y, winner.color);
  osc.freq(random(220, 660));
  env.play(osc);
  return { winner, loser };
}

class Agent {
  constructor(type, x, y) {
    this.type = type;
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(1, 2));
    this.maxSpeed = 2;
    this.emoji = this.getEmoji();
    this.color = this.getColor();
  }

  getEmoji() {
    if (this.type === "rock") return "🪨";
    if (this.type === "paper") return "📄";
    if (this.type === "scissors") return "✂️";
  }

  getColor() {
    if (this.type === "rock") return color(255, 100, 100);
    if (this.type === "paper") return color(100, 200, 255);
    if (this.type === "scissors") return color(100, 255, 150);
  }

  update() {
    if (moveMode === "random") {
      this.pos.add(this.vel);
    } else if (moveMode === "chase") {
      this.chaseOnly();
    }
    if (this.pos.x < 0 || this.pos.x > width) this.vel.x *= -1;
    if (this.pos.y < 0 || this.pos.y > height) this.vel.y *= -1;
    this.pos.x = constrain(this.pos.x, 0, width);
    this.pos.y = constrain(this.pos.y, 0, height);
    this.emoji = this.getEmoji();
    this.color = this.getColor();
  }

  chaseOnly() {
    let targetType;
    if (this.type === "rock") targetType = "scissors";
    else if (this.type === "scissors") targetType = "paper";
    else if (this.type === "paper") targetType = "rock";

    let target = this.findClosest(targetType);
    if (target) {
      let toTarget = p5.Vector.sub(target.pos, this.pos);
      toTarget.setMag(0.2);
      this.vel.add(toTarget);
    }
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
  }

  findClosest(type) {
    let minD = Infinity;
    let closest = null;
    for (let a of agents) {
      if (a.type === type && a !== this) {
        let d = dist(this.pos.x, this.pos.y, a.pos.x, a.pos.y);
        if (d < minD) {
          minD = d;
          closest = a;
        }
      }
    }
    return closest;
  }

  show() {
    fill(this.color);
    text(this.emoji, this.pos.x, this.pos.y);
  }
}

class Spark {
  constructor(x, y, col) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(1, 4));
    this.life = 255;
    this.col = col;
    this.dead = false;
  }

  update() {
    this.pos.add(this.vel);
    this.vel.mult(0.95);
    this.life -= 5;
    if (this.life <= 0) this.dead = true;
  }

  show() {
    noStroke();
    fill(red(this.col), green(this.col), blue(this.col), this.life);
    ellipse(this.pos.x, this.pos.y, 4);
  }
}

function createSparks(x, y, col) {
  for (let i = 0; i < 20; i++) sparks.push(new Spark(x, y, col));
}

function keyPressed() {
  if (key === "m" || key === "M") mode = mode === "convert" ? "eliminate" : "convert";
  if (key === "p" || key === "P") moveMode = moveMode === "random" ? "chase" : "random";
}
