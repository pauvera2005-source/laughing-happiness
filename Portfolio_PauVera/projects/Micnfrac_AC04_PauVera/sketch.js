let mic, fft, amplitude;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  angleMode(DEGREES);

  mic = new p5.AudioIn();
  mic.start();

  fft = new p5.FFT(0.8, 128);
  fft.setInput(mic);

  amplitude = new p5.Amplitude();
  amplitude.setInput(mic);

  userStartAudio();
}

function draw() {
  background(0, 0.1);

  let level = amplitude.getLevel();
  let spectrum = fft.analyze();

  // Greus i aguts
  let bass = fft.getEnergy("bass");
  let treble = fft.getEnergy("treble");

  // Mapeig de paràmetres
  let numArms = floor(map(treble, 0, 255, 3, 12));  // més aguts → més braços
  let spin = map(bass, 0, 255, -5, 5);              // els greus fan girar l'espiral
  let pulse = map(level, 0, 0.3, 0.5, 2);           // el volum fa expandir / contraure

  translate(width / 2, height / 2);
  rotate(frameCount * spin);

  for (let i = 0; i < numArms; i++) {
    push();
    rotate((360 / numArms) * i);
    drawFlame(0, 0, 120 * pulse, 0);
    pop();
  }
}

// ✨ Fractal recursiu de flama
function drawFlame(x, y, size, depth) {
  if (size < 5) return;

  let hue = (frameCount + depth * 20) % 360;
  stroke(hue, 200, 255);
  noFill();

  let swirl = map(noise(frameCount * 0.01 + depth), 0, 1, -30, 30);

  push();
  translate(x, y);
  rotate(swirl);

  ellipse(0, 0, size, size * 0.4);

  // Recursió – dues rames
  drawFlame(size * 0.4, 0, size * 0.65, depth + 1);
  drawFlame(-size * 0.4, 0, size * 0.65, depth + 1);

  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
