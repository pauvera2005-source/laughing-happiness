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
  let container = select('#sketch-container');

  // Canvas ocupa tot l’ample del contenidor i alçada gran
  let cnv = createCanvas(container.width, windowHeight * 0.8);
  cnv.parent(container);

  angleMode(DEGREES);
  textAlign(CENTER, CENTER);
  textSize(16);

  // Sliders dins del contenidor
  sensitivitySlider = createSlider(1, 20, defaultSensitivity, 1);
  pitchMinSlider = createSlider(50, 500, defaultPitchMin, 10);
  pitchMaxSlider = createSlider(200, 2000, defaultPitchMax, 10);
  brightnessSlider = createSlider(0, 1, defaultBrightness, 0.01);

  sensitivitySlider.parent(container);
  pitchMinSlider.parent(container);
  pitchMaxSlider.parent(container);
  brightnessSlider.parent(container);

  // Posicions verticals dins del div
  const sliderMargin = 20;
  sensitivitySlider.position(sliderMargin, 10);
  pitchMinSlider.position(sliderMargin, 50);
  pitchMaxSlider.position(sliderMargin, 90);
  brightnessSlider.position(sliderMargin, 130);

  // Botó start dins del contenidor, just sota els sliders
  startButton = createButton("Start Groan Tube");
  startButton.size(200, 50);
  startButton.parent(container);
  startButton.mousePressed(startAudio);
  startButton.position(container.width / 2 - 100, 200); // posició visible
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
}

function touchStarted() {
  if (typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function") {
    DeviceMotionEvent.requestPermission().catch(() => {
      console.log("Permís de moviment rebutjat o no concedit.");
    });
  }

  let ctx = getAudioContext();
  if (ctx.state !== "running") {
    ctx.resume();
  }
}

function draw() {
  background(15);

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
  fill(255);
  noStroke();
  textSize(22);
  text("Groan Tube Digital", width / 2, height / 2 - 160);

  textSize(14);
  text("Mou i gira el mòbil per canviar el so", width / 2, height / 2 - 135);

  let maxRadius = min(width, height) * 0.35;
  let radius = maxRadius * smoothIntensity;

  let c1 = color(80, 180, 255);
  let c2 = color(255, 80, 120);
  let mix = smoothIntensity;
  let r = lerp(red(c1), red(c2), mix);
  let g = lerp(green(c1), green(c2), mix);
  let b = lerp(blue(c1), blue(c2), mix);

  push();
  translate(width / 2, height / 2);
  noStroke();
  fill(r, g, b, 200);
  ellipse(0, 0, radius, radius);
  pop();

  fill(255);
  textSize(14);

  let infoY = height / 2 + 100;
  text("Intensitat: " + nf(smoothIntensity, 1, 2), width / 2, infoY);
  text("Pitch (Hz): " + nf(smoothPitch, 3, 1), width / 2, infoY + 20);
  text("accZ: " + nf(az, 1, 2), width / 2, infoY + 40);

  textAlign(LEFT, CENTER);
  let margin = 10;
  let baseY = 10;
  text("Sensibilitat moviment", margin, baseY);
  text("Pitch mínim (Hz)", margin, baseY + 40);
  text("Pitch màxim (Hz)", margin, baseY + 80);
  text("Brillo / filtre", margin, baseY + 120);
  textAlign(CENTER, CENTER);
}

function windowResized() {
  let container = select('#sketch-container');
  resizeCanvas(container.width, windowHeight * 0.8);

  // Botó just sota els sliders
  startButton.position(container.width / 2 - 100, 200);

  const sliderMargin = 20;
  const sliderWidth = container.width - sliderMargin * 2;

  sensitivitySlider.size(sliderWidth);
  pitchMinSlider.size(sliderWidth);
  pitchMaxSlider.size(sliderWidth);
  brightnessSlider.size(sliderWidth);

  sensitivitySlider.position(sliderMargin, 10);
  pitchMinSlider.position(sliderMargin, 50);
  pitchMaxSlider.position(sliderMargin, 90);
  brightnessSlider.position(sliderMargin, 130);
}
