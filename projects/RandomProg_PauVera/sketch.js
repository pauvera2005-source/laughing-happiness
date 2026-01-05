let seed = 101, seeds = [101, 202, 303];
let container;

function setup() {
  container = select('#sketch-container');
  let cnv = createCanvas(container.width, container.width); // quadrat
  cnv.parent(container);
  noLoop(); 
  render();
}

function render() {
  randomSeed(seed); 
  background(random(255), random(255), random(255)); 
  noStroke();

  const sizes = [6, 10, 16, 24, 32];
  for (let i = 0; i < 3000; i++) {
    fill(random(255), random(255), random(255), random(200));
    circle(random(width), random(height), random(sizes));
  }

  fill(0, 120); 
  textSize(14); 
  textAlign(LEFT, BOTTOM);
  text("seed " + seed , 10, height - 10);
}

function keyPressed() {
  if (key === '1') seed = seeds[0];
  else if (key === '2') seed = seeds[1];
  else if (key === '3') seed = seeds[2];
  else if (key === 'S' || key === 's') return saveCanvas('poster_'+seed, 'png');
  else return;
  render();
}

function windowResized() {
  resizeCanvas(container.width, container.width);
  render();
}
