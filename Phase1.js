// ===============================
// DESI ARCADE HITS
// Advanced Framework Build
// T+2 to T+6 Milestone
// ===============================

// ---------- GAME STATES ----------
const MENU = 0;
const JALEBI = 1;
const CRICKET = 2;
const DHOL = 3;

let gameState = MENU;

// ---------- VISUAL FX ----------
let particles = [];
let flashes = [];
let screenShakeIntensity = 0;

let transitionAlpha = 255;
let transitioning = true;

// ---------- MENU BUTTONS ----------
let buttons = [];

// ---------- GLOBAL TIMER ----------
let globalPulse = 0;

// ---------- CAMERA ----------
let camX = 0;
let camY = 0;

// ===============================
// SETUP
// ===============================
function setup() {
  createCanvas(800, 800);
  rectMode(CENTER);
  angleMode(DEGREES);
  textAlign(CENTER, CENTER);

  initializeButtons();
}

// ===============================
// DRAW LOOP
// ===============================
function draw() {

  updateScreenShake();

  push();
  translate(camX, camY);

  dynamicBackground();

  switch (gameState) {

    case MENU:
      renderMenu();
      break;

    case JALEBI:
      renderJalebiPlaceholder();
      break;

    case CRICKET:
      renderCricketPlaceholder();
      break;

    case DHOL:
      renderDholPlaceholder();
      break;
  }

  updateParticles();

  pop();

  renderFlashes();
  renderTransitions();

  globalPulse += 0.8;
}

// ===============================
// MENU BUTTON CLASS
// ===============================
class MenuButton {

  constructor(x, y, w, h, label, state) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.label = label;
    this.state = state;
    this.hoverScale = 1;
  }

  display() {

    let hovering =
      mouseX > this.x - this.w / 2 &&
      mouseX < this.x + this.w / 2 &&
      mouseY > this.y - this.h / 2 &&
      mouseY < this.y + this.h / 2;

    this.hoverScale = lerp(
      this.hoverScale,
      hovering ? 1.08 : 1,
      0.1
    );

    push();

    translate(this.x, this.y);
    scale(this.hoverScale);

    // glow
    for (let i = 0; i < 5; i++) {
      fill(255, 120 - i * 20);
      rect(0, 0, this.w + i * 8, this.h + i * 8, 25);
    }

    fill(30);
    stroke(255);
    strokeWeight(2);
    rect(0, 0, this.w, this.h, 20);

    fill(255);
    noStroke();
    textSize(28);
    text(this.label, 0, 0);

    pop();
  }

  clicked() {

    let hovering =
      mouseX > this.x - this.w / 2 &&
      mouseX < this.x + this.w / 2 &&
      mouseY > this.y - this.h / 2 &&
      mouseY < this.y + this.h / 2;

    if (hovering) {
      gameState = this.state;

      triggerFlash();
      triggerShake(10);

      for (let i = 0; i < 40; i++) {
        particles.push(
          new Particle(
            this.x,
            this.y,
            color(random(255), random(255), random(255))
          )
        );
      }
    }
  }
}

// ===============================
// PARTICLE CLASS
// ===============================
class Particle {

  constructor(x, y, col) {
    this.x = x;
    this.y = y;

    this.vx = random(-3, 3);
    this.vy = random(-3, 3);

    this.size = random(4, 12);

    this.life = 255;

    this.col = col;
  }

  update() {

    this.x += this.vx;
    this.y += this.vy;

    this.vy += 0.02;

    this.life -= 4;

    this.display();
  }

  display() {

    noStroke();

    fill(
      red(this.col),
      green(this.col),
      blue(this.col),
      this.life
    );

    ellipse(this.x, this.y, this.size);
  }

  dead() {
    return this.life <= 0;
  }
}

// ===============================
// INITIALIZE BUTTONS
// ===============================
function initializeButtons() {

  buttons.push(
    new MenuButton(400, 320, 320, 80, "JALEBI SPINNER", JALEBI)
  );

  buttons.push(
    new MenuButton(400, 450, 320, 80, "CRICKET GULLY", CRICKET)
  );

  buttons.push(
    new MenuButton(400, 580, 320, 80, "DHOL BEAT", DHOL)
  );
}

// ===============================
// MENU RENDER
// ===============================
function renderMenu() {

  animatedBackgroundOrbs();

  push();

  fill(255);
  textSize(60);
  textStyle(BOLD);

  text(
    "DESI ARCADE HITS",
    width / 2,
    140 + sin(globalPulse * 2) * 8
  );

  textSize(22);
  fill(255, 180);

  text(
    "One Button Games Inspired by Indian Culture",
    width / 2,
    210
  );

  pop();

  for (let b of buttons) {
    b.display();
  }

  fill(255, 150);
  textSize(18);

  text(
    "Built with p5.js • Advanced VFX Framework",
    width / 2,
    740
  );
}

// ===============================
// DYNAMIC BACKGROUND
// ===============================
function dynamicBackground() {

  if (gameState === MENU) {

    for (let y = 0; y < height; y += 4) {

      let inter = map(y, 0, height, 0, 1);

      let c = lerpColor(
        color(20, 10, 40),
        color(80, 20, 100),
        inter
      );

      stroke(c);
      line(0, y, width, y);
    }
  }

  else if (gameState === JALEBI) {

    background(70, 30, 0);

  }

  else if (gameState === CRICKET) {

    background(100, 180, 255);

  }

  else if (gameState === DHOL) {

    background(
      40 + sin(globalPulse * 5) * 20,
      0,
      60
    );
  }
}

// ===============================
// ORB BACKGROUND
// ===============================
function animatedBackgroundOrbs() {

  noStroke();

  for (let i = 0; i < 12; i++) {

    let x =
      noise(i * 100 + frameCount * 0.003) * width;

    let y =
      noise(i * 200 + frameCount * 0.003) * height;

    let s =
      80 + sin(globalPulse + i * 20) * 30;

    fill(
      255,
      100,
      180,
      35
    );

    ellipse(x, y, s);
  }
}

// ===============================
// PARTICLE SYSTEM UPDATE
// ===============================
function updateParticles() {

  for (let i = particles.length - 1; i >= 0; i--) {

    particles[i].update();

    if (particles[i].dead()) {
      particles.splice(i, 1);
    }
  }
}

// ===============================
// SCREEN SHAKE
// ===============================
function triggerShake(intensity) {
  screenShakeIntensity = intensity;
}

function updateScreenShake() {

  camX = random(-screenShakeIntensity, screenShakeIntensity);
  camY = random(-screenShakeIntensity, screenShakeIntensity);

  screenShakeIntensity *= 0.9;

  if (screenShakeIntensity < 0.5) {
    screenShakeIntensity = 0;
  }
}

// ===============================
// FLASH SYSTEM
// ===============================
function triggerFlash() {
  flashes.push(255);
}

function renderFlashes() {

  for (let i = flashes.length - 1; i >= 0; i--) {

    fill(255, flashes[i]);
    rect(width / 2, height / 2, width, height);

    flashes[i] -= 18;

    if (flashes[i] <= 0) {
      flashes.splice(i, 1);
    }
  }
}

// ===============================
// TRANSITIONS
// ===============================
function renderTransitions() {

  if (transitioning) {

    fill(0, transitionAlpha);
    rect(width / 2, height / 2, width, height);

    transitionAlpha -= 5;

    if (transitionAlpha <= 0) {
      transitioning = false;
    }
  }
}

// ===============================
// PLACEHOLDER GAME SCREENS
// ===============================
function renderJalebiPlaceholder() {

  fill(255);

  textSize(48);
  text("JALEBI SPINNER", width / 2, 120);

  fill(255, 180);
  textSize(24);

  text(
    "Fluid Simulation Coming in T+6 to T+14",
    width / 2,
    180
  );

  drawBackInstruction();
}

function renderCricketPlaceholder() {

  fill(255);

  textSize(48);
  text("CRICKET GULLY", width / 2, 120);

  fill(255, 180);
  textSize(24);

  text(
    "Ball Physics & Impact System Next",
    width / 2,
    180
  );

  drawBackInstruction();
}

function renderDholPlaceholder() {

  fill(255);

  textSize(48);
  text("DHOL BEAT FESTIVAL", width / 2, 120);

  fill(255, 180);
  textSize(24);

  text(
    "Rhythm Engine Coming Soon",
    width / 2,
    180
  );

  drawBackInstruction();
}

// ===============================
// UI HELPERS
// ===============================
function drawBackInstruction() {

  fill(255);

  textSize(20);

  text(
    "Press M to Return Menu",
    width / 2,
    740
  );
}

// ===============================
// INPUTS
// ===============================
function mousePressed() {

  if (gameState === MENU) {

    for (let b of buttons) {
      b.clicked();
    }
  }
}

function keyPressed() {

  if (key === 'm' || key === 'M') {

    gameState = MENU;

    triggerFlash();
    triggerShake(6);
  }
}