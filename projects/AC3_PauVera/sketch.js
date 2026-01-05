let osc;
let filter;
let started = false;
let startButton;
let sensitivitySlider, pitchMinSlider, pitchMaxSlider, brightnessSlider;
let lastAx = 0;
let lastAy = 0;
let lastAz = 0;
let rawIntensity = 0;
let smoothIntensity = 0;
let rawPitch = 0;
let smoothPitch = 0;
let defaultSensitivity = 5;
let defaultPitchMin = 100;
let defaultPitchMax = 800;
let defaultBrightness = 0.7;

function setup() {
  let container = select('#sketch-holder');
  let controlsContainer = select('#ui-controls');

  let cnv = createCanvas(800, 500);
  cnv.parent(container);

  angleMode(DEGREES);
  textAlign(CENTER, CENTER);
  textSize(16);
  textFont('Share Tech Mono');

  sensitivitySlider = createSlider(1, 20, defaultSensitivity, 1);
  sensitivitySlider.parent(controlsContainer);
  sensitivitySlider.attribute('title', 'Sensibilitat');

  pitchMinSlider = createSlider(50, 500, defaultPitchMin, 10);
  pitchMinSlider.parent(controlsContainer);
  pitchMinSlider.attribute('title', 'Pitch Min');

  pitchMaxSlider = createSlider(200, 2000, defaultPitchMax, 10);
  pitchMaxSlider.parent(controlsContainer);
  pitchMaxSlider.attribute('title', 'Pitch Max');

  brightnessSlider = createSlider(0, 1, defaultBrightness, 0.01);
  brightnessSlider.parent(controlsContainer);
  brightnessSlider.attribute('title', 'Brillo');

  startButton = createButton("[ INICIALITZAR SISTEMA AUDIO ]");
  startButton.parent(controlsContainer);
  startButton.mousePressed(startAudio);
}

function startAudio() {
  let ctx = getAudioContext();
  if (ctx.state !== "running") {
    ctx.resume();
  }
  if (!osc) {
    osc = new p5.Oscillator("sawtooth");
    filter = new p5.LowPass();
    osc.disconnect();
    osc.connect(filter);
    filter.connect();
    osc.start();
    osc.amp(0);
  }
  started = true;
  startButton.html("[ SISTEMA ACTIU ]");
}

function touchStarted() {
  if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
    DeviceMotionEvent.requestPermission().catch(() => {});
  }
  let ctx = getAudioContext();
  if (ctx.state !== "running") {
    ctx.resume();
  }
}

function draw() {
  background(0, 15, 0); 

  let ax = (typeof accelerationX === "number") ? accelerationX : 0;
  let ay = (typeof accelerationY === "number") ? accelerationY : 0;
  let az = (typeof accelerationZ === "number") ? accelerationZ : 0;

  let dx = ax - lastAx;
  let dy = ay - lastAy;
  let dz = az - lastAz;
  let speed = sqrt(dx * dx + dy * dy + dz * dz);

  let sens = sensitivitySlider.value();
  let targetIntensity = map(speed, 0, sens, 0, 1, true);
  rawIntensity = targetIntensity;
  smoothIntensity = lerp(smoothIntensity, rawIntensity, 0.15);

  let pitchMin = pitchMinSlider.value();
  let pitchMax = pitchMaxSlider.value();
  let targetPitch = map(az, -30, 30, pitchMin, pitchMax, true);
  rawPitch = targetPitch;
  smoothPitch = lerp(smoothPitch, rawPitch, 0.15);

  if (started && osc && filter) {
    osc.freq(smoothPitch);
    let baseAmp = 0.02;
    let maxExtraAmp = 0.3;
    let targetAmp = baseAmp + smoothIntensity * maxExtraAmp;
    osc.amp(targetAmp, 0.05);

    let brightness = brightnessSlider.value();
    let minCutoff = 300;
    let maxCutoff = map(brightness, 0, 1, 2000, 8000);
    let cutoff = map(smoothIntensity, 0, 1, minCutoff, maxCutoff, true);
    filter.freq(cutoff);
    filter.res(10 * smoothIntensity + 1);
  }

  lastAx = ax;
  lastAy = ay;
  lastAz = az;

  drawUI(ax, ay, az);
}

function drawUI(ax, ay, az) {
  fill(0, 255, 65);
  noStroke();
  textSize(22);
  text("GROAN_TUBE.EXE", width / 2, height / 2 - 160);

  textSize(14);
  fill(0, 200, 50);
  text(">> GIRA EL DISPOSITIU PER MODULAR <<", width / 2, height / 2 - 135);

  let maxRadius = min(width, height) * 0.35;
  let radius = maxRadius * smoothIntensity;

  push();
  translate(width / 2, height / 2);
  noFill();
  stroke(0, 255, 65);
  strokeWeight(2);
  ellipse(0, 0, radius, radius);
  stroke(0, 255, 65, 100);
  ellipse(0, 0, radius * 1.5, radius * 1.5);
  pop();

  fill(0, 255, 65);
  textSize(14);
  let infoY = height / 2 + 100;
  text("INTENSITAT: " + nf(smoothIntensity, 1, 2), width / 2, infoY);
  text("FREQ (Hz): " + nf(smoothPitch, 3, 1), width / 2, infoY + 20);
  text("ACC_Z: " + nf(az, 1, 2), width / 2, infoY + 40);

  textAlign(LEFT, CENTER);
  let margin = 20;
  let baseY = 30;
  fill(0, 150, 40);
  textSize(12);
  text("SENSIBILITAT", margin, baseY);
  text("PITCH MIN", margin, baseY + 30);
  text("PITCH MAX", margin, baseY + 60);
  text("FILTRE", margin, baseY + 90);
  textAlign(CENTER, CENTER);
}

function windowResized() {
  let container = select('#sketch-holder');
  resizeCanvas(container.width, 500);
}