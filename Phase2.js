let gameState = "MENU";

const W = 800;
const H = 800;

// Global juice
let shakePower = 0;
let flashAlpha = 0;
let flashCol;
let particles = [];
let uiPops = [];

// Jalebi
let jalebiPath = [];
let jalebiScore = 0;
let jalebiCombo = 0;
let drawingJalebi = false;
let lastAngle = null;
let lastRadius = null;
let totalRotation = 0;
let jalebiMsg = "";
let panPulse = 0;

// Cricket
let ball;
let cricketMsg = "";
let cricketOver = false;
let windowBroken = false;
let cracks = [];
let slowMo = 0;
let dangerWindow;

// Dhol
let beats = [];
let beatTimer = 0;
let dholScore = 0;
let dholCombo = 0;
let dholMisses = 0;
let dholMsg = "";
let dholMsgTimer = 0;
let strikeAnim = 0;
let rhythmPulse = 0;

function setup() {
  createCanvas(W, H);
  textAlign(CENTER, CENTER);
  angleMode(RADIANS);
  flashCol = color(255);
  resetAll();
}

function draw() {
  updateGlobalEffects();

  push();
  applyShake();

  switch (gameState) {
    case "MENU":
      renderMenu();
      break;
    case "JALEBI":
      playJalebi();
      break;
    case "CRICKET":
      playCricket();
      break;
    case "DHOL":
      playDhol();
      break;
  }

  renderParticles();
  renderUiPops();
  pop();

  renderFlash();
}

function resetAll() {
  resetJalebi();
  resetCricket();
  resetDhol();
}

function changeState(state) {
  gameState = state;

  if (gameState === "JALEBI") resetJalebi();
  if (gameState === "CRICKET") resetCricket();
  if (gameState === "DHOL") resetDhol();
}

// --------------------
// Global VFX
// --------------------

class Particle {
  constructor(x, y, vx, vy, life, size, col, type = "soft") {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.size = size;
    this.startSize = size;
    this.col = col;
    this.type = type;
    this.rot = random(TWO_PI);
    this.spin = random(-0.12, 0.12);
    this.gravity = type === "shard" ? 0.22 : 0;
  }

  update() {
    this.vx *= 0.985;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.rot += this.spin;
    this.life--;
  }

  show() {
    let t = constrain(this.life / this.maxLife, 0, 1);
    let a = 255 * t;

    push();
    translate(this.x, this.y);
    rotate(this.rot);
    noStroke();

    if (this.type === "steam") {
      fill(red(this.col), green(this.col), blue(this.col), a * 0.25);
      ellipse(0, 0, this.startSize * (1.7 - t));
    } else if (this.type === "bubble") {
      noFill();
      stroke(255, 230, 120, a);
      strokeWeight(2);
      ellipse(0, 0, this.startSize * (1.2 - t * 0.2));
    } else if (this.type === "shard") {
      fill(180, 235, 255, a * 0.75);
      triangle(-this.size, this.size, this.size, this.size * 0.4, 0, -this.size);
    } else {
      fill(red(this.col), green(this.col), blue(this.col), a);
      ellipse(0, 0, this.startSize * t);
    }

    pop();
  }

  dead() {
    return this.life <= 0;
  }
}

function addParticles(x, y, count, type, col) {
  for (let i = 0; i < count; i++) {
    let ang = random(TWO_PI);
    let spd = random(0.8, 5.5);
    let vx = cos(ang) * spd;
    let vy = sin(ang) * spd;

    if (type === "steam") {
      vx = random(-0.4, 0.4);
      vy = random(-1.8, -0.4);
    }

    particles.push(new Particle(
      x + random(-12, 12),
      y + random(-12, 12),
      vx,
      vy,
      random(35, 85),
      random(5, 22),
      col,
      type
    ));
  }
}

function renderParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();

    if (particles[i].dead()) {
      particles.splice(i, 1);
    }
  }
}

function screenShake(power) {
  shakePower = max(shakePower, power);
}

function screenFlash(col, alpha = 150) {
  flashCol = col;
  flashAlpha = max(flashAlpha, alpha);
}

function applyShake() {
  if (shakePower > 0.1) {
    translate(random(-shakePower, shakePower), random(-shakePower, shakePower));
    shakePower *= 0.82;
  }
}

function renderFlash() {
  if (flashAlpha <= 0) return;

  push();
  noStroke();
  fill(red(flashCol), green(flashCol), blue(flashCol), flashAlpha);
  rect(0, 0, W, H);
  pop();

  flashAlpha *= 0.82;
}

function updateGlobalEffects() {
  for (let p of uiPops) {
    p.y -= 0.7;
    p.life--;
  }

  uiPops = uiPops.filter(p => p.life > 0);
}

function addUiPop(txt, x, y, col) {
  uiPops.push({ txt, x, y, life: 45, col });
}

function renderUiPops() {
  push();
  textStyle(BOLD);

  for (let p of uiPops) {
    let t = p.life / 45;
    fill(red(p.col), green(p.col), blue(p.col), 255 * t);
    textSize(18 + (1 - t) * 18);
    text(p.txt, p.x, p.y);
  }

  pop();
}

function drawTopHud(title, score) {
  push();
  noStroke();
  fill(0, 0, 0, 90);
  rect(0, 0, W, 70);

  fill(255, 245, 210);
  textSize(15);
  textAlign(LEFT, CENTER);
  text("Back to Menu [M]   Reset [R]", 20, 25);

  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(28 + sin(frameCount * 0.08) * 1.5);
  text(title, 400, 35);

  textAlign(RIGHT, CENTER);
  fill(255, 225, 80);
  textSize(20);
  text(score, 770, 35);
  pop();
}

// --------------------
// Menu
// --------------------

function renderMenu() {
  push();
  background(18, 14, 30);

  for (let i = 0; i < 45; i++) {
    let x = (i * 83 + frameCount * 0.35) % W;
    let y = (i * 47) % H;
    fill(255, 160 + sin(frameCount * 0.04 + i) * 60, 60, 35);
    noStroke();
    ellipse(x, y, 18 + sin(frameCount * 0.03 + i) * 6);
  }

  fill(255);
  textStyle(BOLD);
  textSize(56);
  text("DESI ARCADE HITS", 400, 130);

  fill(255, 220, 120);
  textSize(18);
  textStyle(NORMAL);
  text("Pick a mini-game. Chase perfect timing. Break only fictional windows.", 400, 180);

  menuButton(220, 270, 360, 88, "1. Jalebi Spinner", color(255, 125, 20));
  menuButton(220, 390, 360, 88, "2. Cricket Gully", color(80, 200, 255));
  menuButton(220, 510, 360, 88, "3. Dhol Beat", color(255, 40, 155));

  fill(230);
  textSize(16);
  text("Press 1, 2, 3 or click", 400, 675);
  pop();
}

function menuButton(x, y, w, h, label, accent) {
  let hot = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;

  push();
  stroke(accent);
  strokeWeight(hot ? 5 : 3);
  fill(hot ? color(red(accent), green(accent), blue(accent), 120) : color(35, 30, 55, 230));
  rect(x, y, w, h, 12);

  noStroke();
  fill(255);
  textStyle(BOLD);
  textSize(hot ? 29 : 26);
  text(label, x + w / 2, y + h / 2);
  pop();
}

// --------------------
// Jalebi Spinner
// --------------------

function resetJalebi() {
  jalebiPath = [];
  jalebiScore = 0;
  jalebiCombo = 0;
  drawingJalebi = false;
  lastAngle = null;
  lastRadius = null;
  totalRotation = 0;
  jalebiMsg = "";
  panPulse = 0;
}

function playJalebi() {
  push();
  background(86, 35, 14);

  drawJalebiScene();
  drawTopHud("Jalebi Spinner", "Score " + floor(jalebiScore));

  if (frameCount % 6 === 0) {
    addParticles(400 + random(-160, 160), 405 + random(-100, 100), 1, "steam", color(235, 235, 225));
  }

  if (mouseIsPressed && drawingJalebi) {
    updateJalebi();
  }

  drawBatterTrail();

  fill(255, 235, 165);
  textSize(17);
  text("Hold mouse and draw a smooth outward spiral", 400, 755);

  if (jalebiMsg) {
    fill(255, 240, 90);
    textStyle(BOLD);
    textSize(34 + sin(frameCount * 0.18) * 3);
    text(jalebiMsg, 400, 675);
  }

  pop();
}

function drawJalebiScene() {
  push();
  translate(400, 410);

  noStroke();
  fill(45, 30, 24);
  ellipse(0, 15, 510, 510);

  fill(120, 58, 18);
  ellipse(0, 0, 460 + panPulse, 460 + panPulse);

  fill(188, 96, 22);
  ellipse(0, 0, 410, 410);

  strokeWeight(4);
  noFill();

  let accuracyGlow = map(jalebiCombo, 0, 120, 50, 210, true);
  stroke(255, 220, 90, accuracyGlow);

  beginShape();
  for (let a = 0; a < TWO_PI * 3.1; a += 0.08) {
    let r = 45 + a * 18;
    vertex(cos(a) * r, sin(a) * r);
  }
  endShape();

  pop();

  panPulse *= 0.9;
}

function updateJalebi() {
  let cx = 400;
  let cy = 410;
  let dx = mouseX - cx;
  let dy = mouseY - cy;
  let angle = atan2(dy, dx);
  let radius = dist(mouseX, mouseY, cx, cy);

  let accuracy = 0;

  if (lastAngle !== null) {
    let delta = angle - lastAngle;
    if (delta < -PI) delta += TWO_PI;
    if (delta > PI) delta -= TWO_PI;

    if (delta > 0.01) totalRotation += delta;

    let targetR = 45 + totalRotation * 18;
    let error = abs(radius - targetR);
    accuracy = constrain(1 - error / 70, 0, 1);

    jalebiScore += accuracy * 2.2;
    jalebiCombo = accuracy > 0.68 ? jalebiCombo + 1 : max(0, jalebiCombo - 2);

    if (frameCount % 3 === 0) {
      addParticles(mouseX, mouseY, 2, "bubble", color(255, 220, 80));
    }

    if (accuracy > 0.78 && totalRotation > TWO_PI * 2.05) {
      jalebiMsg = "Perfect Sizzle!";
      panPulse = 12;
      screenShake(5);
      screenFlash(color(255, 180, 40), 90);
      addParticles(mouseX, mouseY, 14, "bubble", color(255, 235, 100));
      addParticles(mouseX, mouseY, 8, "soft", color(255, 120, 20));
      addUiPop("+ SIZZLE", mouseX, mouseY - 35, color(255, 240, 90));
    }
  }

  jalebiPath.push({
    x: mouseX,
    y: mouseY,
    r: 18 + accuracy * 14 + sin(frameCount * 0.2) * 2,
    acc: accuracy
  });

  if (jalebiPath.length > 210) jalebiPath.shift();

  lastAngle = angle;
  lastRadius = radius;
}

function drawBatterTrail() {
  if (jalebiPath.length < 2) return;

  push();
  noFill();

  for (let i = 1; i < jalebiPath.length; i++) {
    let a = map(i, 0, jalebiPath.length, 40, 255);
    let p = jalebiPath[i];

    stroke(255, lerp(110, 210, p.acc), 25, a);
    strokeWeight(p.r);
    line(jalebiPath[i - 1].x, jalebiPath[i - 1].y, p.x, p.y);

    stroke(255, 230, 110, a * 0.45);
    strokeWeight(p.r * 0.35);
    point(p.x - 4, p.y - 4);
  }

  pop();
}

// --------------------
// Cricket
// --------------------

class CricketBall {
  constructor() {
    this.x = 820;
    this.y = 420;
    this.baseY = 420;
    this.vx = -5.3;
    this.vy = 0;
    this.t = 0;
    this.hit = false;
    this.trail = [];
  }

  update() {
    let step = slowMo > 0 ? 0.34 : 1;

    if (!this.hit) {
      this.x += this.vx * step;
      this.t += 0.08 * step;
      this.y = this.baseY + sin(this.t) * 26;
    } else {
      this.x += this.vx * step;
      this.y += this.vy * step;
      this.vy += 0.32 * step;
    }

    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 28) this.trail.shift();
  }

  draw() {
    push();

    noFill();
    for (let i = 0; i < this.trail.length; i++) {
      let p = this.trail[i];
      let a = map(i, 0, this.trail.length, 20, 160);
      stroke(255, 80, 50, a);
      strokeWeight(map(i, 0, this.trail.length, 2, 13));
      point(p.x, p.y);
    }

    noStroke();
    fill(220, 40, 34);
    ellipse(this.x, this.y, 24);

    fill(255, 255, 255, 130);
    ellipse(this.x - 5, this.y - 5, 7);

    pop();
  }
}

function resetCricket() {
  ball = new CricketBall();
  cricketMsg = "";
  cricketOver = false;
  windowBroken = false;
  cracks = [];
  slowMo = 0;
  dangerWindow = { x: 100, y: 200, w: 120, h: 100 };
}

function playCricket() {
  push();

  background(130, 202, 224);
  drawGully();
  drawTopHud("Cricket Gully Sixer", cricketOver ? "Press R" : "Timing");

  if (slowMo > 0) slowMo--;

  ball.update();
  ball.draw();

  drawBat();

  if (!ball.hit && ball.x < 145 && !cricketOver) {
    cricketMsg = "OUT!";
    cricketOver = true;
    screenShake(8);
    addUiPop("OUT", 400, 650, color(255, 80, 80));
  }

  if (
    ball.hit &&
    !windowBroken &&
    ball.x > dangerWindow.x &&
    ball.x < dangerWindow.x + dangerWindow.w &&
    ball.y > dangerWindow.y &&
    ball.y < dangerWindow.y + dangerWindow.h
  ) {
    breakWindow();
  }

  fill(255);
  textSize(18);
  text("Press SPACE when ball reaches bat. Perfect: 150-200, Good: 200-250", 400, 755);

  if (cricketMsg) {
    fill(255, 240, 90);
    textStyle(BOLD);
    textSize(36 + sin(frameCount * 0.12) * 2);
    text(cricketMsg, 400, 675);
  }

  pop();
}

function drawGully() {
  push();
  noStroke();

  fill(130, 92, 68);
  rect(0, 560, 800, 240);

  fill(185, 126, 86);
  rect(60, 125, 255, 435);

  fill(165, 105, 82);
  rect(520, 105, 225, 455);

  fill(45, 65, 90);
  rect(dangerWindow.x, dangerWindow.y, dangerWindow.w, dangerWindow.h);

  fill(windowBroken ? color(80, 110, 130, 150) : color(245, 235, 160));
  rect(dangerWindow.x + 10, dangerWindow.y + 10, dangerWindow.w - 20, dangerWindow.h - 20);

  stroke(70);
  strokeWeight(4);
  line(dangerWindow.x + dangerWindow.w / 2, dangerWindow.y, dangerWindow.x + dangerWindow.w / 2, dangerWindow.y + dangerWindow.h);
  line(dangerWindow.x, dangerWindow.y + dangerWindow.h / 2, dangerWindow.x + dangerWindow.w, dangerWindow.y + dangerWindow.h / 2);

  if (windowBroken) drawCracks();

  noStroke();
  fill(70);
  rect(138, 432, 12, 95);
  rect(158, 432, 12, 95);
  rect(178, 432, 12, 95);

  pop();
}

function drawCracks() {
  push();
  stroke(220, 250, 255, 210);
  strokeWeight(2);

  for (let c of cracks) {
    line(c.x1, c.y1, c.x2, c.y2);
    line(
      c.x2,
      c.y2,
      c.x2 + cos(c.a + 0.7) * c.len * 0.45,
      c.y2 + sin(c.a + 0.7) * c.len * 0.45
    );
  }

  pop();
}

function drawBat() {
  push();
  translate(160, 450);
  rotate(-0.45 + (slowMo > 0 ? sin(frameCount * 0.4) * 0.05 : 0));

  fill(150, 75, 35);
  stroke(70, 35, 20);
  strokeWeight(3);
  rect(-15, -88, 30, 142, 12);

  fill(50);
  rect(-10, 45, 20, 66, 8);

  pop();
}

function hitCricket() {
  if (cricketOver || ball.hit) return;

  if (ball.x >= 150 && ball.x <= 200) {
    ball.hit = true;
    ball.vx = -4.8;
    ball.vy = -12.5;
    cricketMsg = "PERFECT SIXER!";
    slowMo = 36;
    screenShake(10);
    screenFlash(color(255, 240, 120), 120);
    addParticles(ball.x, ball.y, 28, "soft", color(255, 230, 70));
    addUiPop("+ SIXER", ball.x, ball.y - 40, color(255, 240, 90));
  } else if (ball.x > 200 && ball.x <= 250) {
    ball.hit = true;
    ball.vx = -5.8;
    ball.vy = -7.5;
    cricketMsg = "GOOD FOUR!";
    screenShake(5);
    addUiPop("+ FOUR", ball.x, ball.y - 40, color(150, 230, 255));
  } else {
    cricketMsg = "MISS!";
    cricketOver = true;
    screenShake(5);
  }
}

function breakWindow() {
  windowBroken = true;
  cricketOver = true;
  cricketMsg = "Neighbor's Window Broken!";
  screenShake(15);
  screenFlash(color(190, 240, 255), 145);

  let cx = dangerWindow.x + dangerWindow.w / 2;
  let cy = dangerWindow.y + dangerWindow.h / 2;

  for (let i = 0; i < 18; i++) {
    let a = random(TWO_PI);
    let len = random(25, 85);

    cracks.push({
      x1: cx,
      y1: cy,
      x2: cx + cos(a) * len,
      y2: cy + sin(a) * len,
      a,
      len
    });
  }

  addParticles(cx, cy, 55, "shard", color(190, 235, 255));
}

// --------------------
// Dhol
// --------------------

function resetDhol() {
  beats = [];
  beatTimer = 0;
  dholScore = 0;
  dholCombo = 0;
  dholMisses = 0;
  dholMsg = "";
  dholMsgTimer = 0;
  strikeAnim = 0;
  rhythmPulse = 0;
}

function playDhol() {
  push();

  rhythmPulse = sin(frameCount * 0.12) * 0.5 + 0.5;
  background(26 + rhythmPulse * 20, 12, 50 + dholCombo * 0.7);

  drawFestivalLights();
  drawDholLanes();
  drawDholInstrument();

  drawTopHud("Dhol Beat Festival", "Score " + dholScore + "  Combo " + dholCombo);

  beatTimer++;

  if (beatTimer > max(22, 48 - dholCombo * 0.8)) {
    spawnBeat();
    beatTimer = 0;
  }

  for (let i = beats.length - 1; i >= 0; i--) {
    let b = beats[i];
    b.y += b.speed;
    drawBeat(b);

    if (b.y > 780) {
      beats.splice(i, 1);
      dholCombo = 0;
      dholMisses++;
    }
  }

  stroke(255, 230, 80);
  strokeWeight(5);
  line(125, 700, 675, 700);

  fill(255);
  noStroke();
  textSize(17);
  text("Press SPACE as beats touch the yellow line", 400, 755);

  if (dholMsgTimer > 0) {
    dholMsgTimer--;
    textStyle(BOLD);
    fill(255);
    textSize(52 + sin(frameCount * 0.4) * 5);
    text(dholMsg, 400, 360);
  }

  pop();
}

function drawFestivalLights() {
  push();
  noStroke();

  for (let i = 0; i < 12; i++) {
    let x = i * 75 + 10;
    let c = color(
      120 + sin(frameCount * 0.06 + i) * 120,
      100 + sin(frameCount * 0.08 + i * 2) * 110,
      180 + sin(frameCount * 0.05 + i) * 70
    );

    fill(red(c), green(c), blue(c), 75 + dholCombo * 3);
    ellipse(x, 120 + sin(frameCount * 0.05 + i) * 25, 70 + dholCombo);
  }

  pop();
}

function drawDholLanes() {
  push();

  let lanes = [220, 400, 580];

  for (let x of lanes) {
    noStroke();
    fill(255, 255, 255, 35);
    rect(x - 64, 105, 128, 620, 10);

    stroke(255, 255, 255, 80);
    strokeWeight(2);
    line(x, 110, x, 720);
  }

  pop();
}

function spawnBeat() {
  let lanes = [220, 400, 580];
  let idx = floor(random(3));

  beats.push({
    x: lanes[idx],
    lane: idx,
    y: -20,
    speed: random(4.8, 6.4) + dholCombo * 0.025,
    size: 50
  });
}

function drawBeat(b) {
  push();
  noStroke();

  fill(255, 40, 150);
  ellipse(b.x, b.y, b.size);

  fill(255, 235, 80);
  ellipse(b.x, b.y, b.size * 0.48);

  fill(70, 20, 50);
  textStyle(BOLD);
  textSize(18);
  text("D", b.x, b.y);

  pop();
}

function hitDhol() {
  let best = -1;
  let bestDist = 999;

  for (let i = 0; i < beats.length; i++) {
    let d = abs(beats[i].y - 700);

    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }

  if (best !== -1 && bestDist < 20) {
    let b = beats.splice(best, 1)[0];

    dholScore += 10 + dholCombo;
    dholCombo++;
    dholMsg = "BOOM!";
    dholMsgTimer = 22;
    strikeAnim = 18;

    screenShake(7 + min(8, dholCombo * 0.4));
    screenFlash(randomHoliColor(), 100);
    addParticles(b.x, 700, 12, "soft", randomHoliColor());
    addUiPop("PERFECT +" + (10 + dholCombo), b.x, 660, color(255, 245, 90));
  } else if (best !== -1 && bestDist < 48) {
    let b = beats.splice(best, 1)[0];

    dholScore += 4;
    dholCombo = 0;
    dholMsg = "GOOD";
    dholMsgTimer = 18;

    addParticles(b.x, 700, 10, "soft", color(120, 220, 255));
  } else {
    dholCombo = 0;
    dholMisses++;
    dholMsg = "MISS";
    dholMsgTimer = 16;
    screenShake(3);
  }
}

function drawDholInstrument() {
  push();
  translate(400, 610);

  fill(145, 70, 35);
  stroke(255, 210, 120);
  strokeWeight(4);
  ellipse(0, 0, 155, 90);

  noStroke();
  fill(255, 225, 150);
  ellipse(-55, 0, 52, 72);
  ellipse(55, 0, 52, 72);

  if (strikeAnim > 0) strikeAnim--;

  stroke(230, 180, 90);
  strokeWeight(7);

  let hitOffset = strikeAnim > 0 ? sin(strikeAnim * 0.55) * 26 : 0;

  line(-90, -90, -28, -20 + hitOffset);
  line(90, -90, 28, -20 + hitOffset);

  pop();
}

function randomHoliColor() {
  return random([
    color(255, 0, 140),
    color(70, 255, 65),
    color(255, 230, 0),
    color(0, 220, 255),
    color(255, 95, 20)
  ]);
}

// --------------------
// Input
// --------------------

function mousePressed() {
  if (gameState === "MENU") {
    if (inside(mouseX, mouseY, 220, 270, 360, 88)) changeState("JALEBI");
    if (inside(mouseX, mouseY, 220, 390, 360, 88)) changeState("CRICKET");
    if (inside(mouseX, mouseY, 220, 510, 360, 88)) changeState("DHOL");
  }

  if (gameState === "JALEBI") {
    drawingJalebi = true;
    jalebiPath = [];
    lastAngle = null;
    lastRadius = null;
    totalRotation = 0;
    jalebiMsg = "";
  }
}

function mouseReleased() {
  if (gameState === "JALEBI") {
    drawingJalebi = false;
  }
}

function keyPressed() {
  if (key === "m" || key === "M") {
    changeState("MENU");
  }

  if (key === "r" || key === "R") {
    if (gameState === "JALEBI") resetJalebi();
    if (gameState === "CRICKET") resetCricket();
    if (gameState === "DHOL") resetDhol();
  }

  if (gameState === "MENU") {
    if (key === "1") changeState("JALEBI");
    if (key === "2") changeState("CRICKET");
    if (key === "3") changeState("DHOL");
  }

  if (keyCode === 32) {
    if (gameState === "CRICKET") hitCricket();
    if (gameState === "DHOL") hitDhol();
  }
}

function inside(px, py, x, y, w, h) {
  return px > x && px < x + w && py > y && py < y + h;
}

