let mic, amplitude, fft;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  // Habilitar audio
  mic = new p5.AudioIn();
  mic.start();

  amplitude = new p5.Amplitude();
  amplitude.setInput(mic);

  fft = new p5.FFT(0.8, 64);
  fft.setInput(mic);

  userStartAudio(); // Necesario para activar audio por interacción
}

function draw() {
  background(10);

  // Nivel general de volumen
  let level = amplitude.getLevel();
  let volMapped = map(level, 0, 0.3, 50, 200);

  // Obtener espectro
  let spectrum = fft.analyze();
  let bass = fft.getEnergy("bass"); // 20-140 Hz

  // Mapeo de parámetros fractales
  let branchLength = map(level, 0, 0.3, 80, 200);
  let angle = map(bass, 0, 255, 10, 45);

  // Color reactivo
  let hue = map(level, 0, 0.3, 100, 255);

  translate(width / 2, height);
  stroke(hue, 200, 255);
  strokeWeight(2);

  drawBranch(branchLength, angle);

  // Barra de nivel de audio
  drawAudioMeter(volMapped);
}

// Función recursiva del árbol
function drawBranch(len, angle) {
  line(0, 0, 0, -len);
  translate(0, -len);

  if (len > 10) {
    push();
    rotate(angle);
    drawBranch(len * 0.67, angle);
    pop();

    push();
    rotate(-angle);
    drawBranch(len * 0.67, angle);
    pop();
  }
}

// Pequeña interfaz de volumen
function drawAudioMeter(value) {
  push();
  noStroke();
  fill(255);
  rect(20, height - 40, value, 15);
  textSize(14);
  text("Nivel de audio", 20, height - 45);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
