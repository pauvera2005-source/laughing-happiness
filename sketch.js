// Groan Tube digital amb acceleròmetre + p5.sound
// Provat amb orientació vertical (portrait)

let osc;
let filter;

let started = false;

// UI
let startButton;
let sensitivitySlider, pitchMinSlider, pitchMaxSlider, brightnessSlider;

// Valors d'acceleració
let lastAx = 0;
let lastAy = 0;
let lastAz = 0;

// Valors mapejats
let rawIntensity = 0;
let smoothIntensity = 0;

let rawPitch = 0;
let smoothPitch = 0;

// Paràmetres per defecte
let defaultSensitivity = 5;     // com de sensible és al moviment
let defaultPitchMin = 100;      // Hz
let defaultPitchMax = 800;      // Hz
let defaultBrightness = 0.7;    // 0..1

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  textAlign(CENTER, CENTER);
  textSize(16);

  // Botó per iniciar l'àudio
  startButton = createButton("Start Groan Tube");
  startButton.size(200, 50);
  startButton.position(width / 2 - 100, height - 80);
  startButton.mousePressed(startAudio);

  // Sliders de control
  sensitivitySlider = createSlider(1, 20, defaultSensitivity, 1);
  pitchMinSlider = createSlider(50, 500, defaultPitchMin, 10);
  pitchMaxSlider = createSlider(200, 2000, defaultPitchMax, 10);
  brightnessSlider = createSlider(0, 1, defaultBrightness, 0.01);

  // Posicionem els sliders a la part superior
  const margin = 10;
  const sliderWidth = width - margin * 2;

  sensitivitySlider.size(sliderWidth);
  pitchMinSlider.size(sliderWidth);
  pitchMaxSlider.size(sliderWidth);
  brightnessSlider.size(sliderWidth);

  sensitivitySlider.position(margin, 20 + 0 * 40);
  pitchMinSlider.position(margin, 20 + 1 * 40);
  pitchMaxSlider.position(margin, 20 + 2 * 40);
  brightnessSlider.position(margin, 20 + 3 * 40);
}

function startAudio() {
  // Cal per a les polítiques d'àudio en mòbil
  let ctx = getAudioContext();
  if (ctx.state !== "running") {
    ctx.resume();
  }

  if (!osc) {
    osc = new p5.Oscillator("sawtooth"); // so "raspat" tipus groan tube
    filter = new p5.LowPass();

    osc.disconnect();
    osc.connect(filter);
    filter.connect(); // cap a sortida principal

    osc.start();
    osc.amp(0); // començem en silenci
  }

  started = true;
}

// Per a iOS: demanar permís als sensors en el primer toc
function touchStarted() {
  if (typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function") {
    DeviceMotionEvent.requestPermission().catch(() => {
      // L'usuari pot rebutjar; simplement no tindrem acceleròmetre
      console.log("Permís de moviment rebutjat o no concedit.");
    });
  }

  // Reprendre àudio també aquí, per si de cas
  let ctx = getAudioContext();
  if (ctx.state !== "running") {
    ctx.resume();
  }
}

function draw() {
  background(15);

  // Llegeix acceleròmetre (si no hi ha dades, 0)
  let ax = (typeof accelerationX === "number") ? accelerationX : 0;
  let ay = (typeof accelerationY === "number") ? accelerationY : 0;
  let az = (typeof accelerationZ === "number") ? accelerationZ : 0;

  // -----------------------------
  // 1) Intensitat = "agitació"
  // -----------------------------
  // Diferència respecte el frame anterior (mida del moviment)
  let dx = ax - lastAx;
  let dy = ay - lastAy;
  let dz = az - lastAz;

  let speed = sqrt(dx * dx + dy * dy + dz * dz);

  // Més sensibilitat => amb poc speed ja és intens
  let sens = sensitivitySlider.value();
  let targetIntensity = map(speed, 0, sens, 0, 1, true);
  rawIntensity = targetIntensity;

  // Suavitzem intensitat
  smoothIntensity = lerp(smoothIntensity, rawIntensity, 0.15);

  // -----------------------------
  // 2) Pitch = orientació / inversió
  // -----------------------------
  // Fem servir accelerationZ: quan gires el mòbil, canvia el to
  let pitchMin = pitchMinSlider.value();
  let pitchMax = pitchMaxSlider.value();

  // accelerationZ sol estar aproximadament entre -30 i 30 en moviment típic
  let targetPitch = map(az, -30, 30, pitchMin, pitchMax, true);
  rawPitch = targetPitch;

  // Suavitzem pitch
  smoothPitch = lerp(smoothPitch, rawPitch, 0.15);

  // -----------------------------
  // 3) Mapeig a so: freqüència, volum, filtre
  // -----------------------------
  if (started && osc && filter) {
    // Freqüència de l'oscil·lador
    osc.freq(smoothPitch);

    // Amplitud: una mica de base + depèn de la intensitat
    let baseAmp = 0.02;
    let maxExtraAmp = 0.3;
    let targetAmp = baseAmp + smoothIntensity * maxExtraAmp;
    osc.amp(targetAmp, 0.05); // interpolació suau

    // Brillo: controlem el low-pass amb intensitat + slider
    let brightness = brightnessSlider.value(); // 0..1
    // Rang del filtre (Hz)
    let minCutoff = 300;
    let maxCutoff = map(brightness, 0, 1, 2000, 8000);
    let cutoff = map(smoothIntensity, 0, 1, minCutoff, maxCutoff, true);
    filter.freq(cutoff);
    filter.res(10 * smoothIntensity + 1); // una mica de ressonància segons intensitat
  }

  // Guardem valors per al proper frame
  lastAx = ax;
  lastAy = ay;
  lastAz = az;

  // -----------------------------
  // 4) Interfície visual
  // -----------------------------
  drawUI(ax, ay, az);
}

function drawUI(ax, ay, az) {
  // Títol
  fill(255);
  noStroke();
  textSize(22);
  text("Groan Tube Digital", width / 2, height / 2 - 160);

  textSize(14);
  text("Mou i gira el mòbil per canviar el so", width / 2, height / 2 - 135);

  // Indicador visual principal: cercle d'intensitat
  let maxRadius = min(width, height) * 0.35;
  let radius = maxRadius * smoothIntensity;

  // Color segons intensitat
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

  // Info text
  fill(255);
  textSize(14);

  let infoY = height / 2 + 100;
  text(
    "Intensitat: " + nf(smoothIntensity, 1, 2),
    width / 2,
    infoY
  );
  text(
    "Pitch (Hz): " + nf(smoothPitch, 3, 1),
    width / 2,
    infoY + 20
  );

  text(
    "accZ: " + nf(az, 1, 2),
    width / 2,
    infoY + 40
  );

  // Labels sliders
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
  resizeCanvas(windowWidth, windowHeight);

  // Reposicionar botó en cas de canvi d'orientació / mida
  if (startButton) {
    startButton.position(width / 2 - 100, height - 80);
  }

  const margin = 10;
  const sliderWidth = width - margin * 2;

  if (sensitivitySlider) sensitivitySlider.size(sliderWidth);
  if (pitchMinSlider) pitchMinSlider.size(sliderWidth);
  if (pitchMaxSlider) pitchMaxSlider.size(sliderWidth);
  if (brightnessSlider) brightnessSlider.size(sliderWidth);
}
