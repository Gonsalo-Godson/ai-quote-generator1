const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = 0;
let lives = 3;
let level = 1;
let rightPressed = false;
let leftPressed = false;
let paused = false;

// Responsive canvas
function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Paddle
const paddle = {
  width: 100,
  height: 10,
  x: canvas.width / 2 - 50,
  speed: 7,
};

// Balls (support multiple balls for powerups)
function createBall(x, y, dx, dy) {
  return {
    x: x ?? canvas.width / 2,
    y: y ?? canvas.height - 30,
    radius: 8,
    dx: dx ?? 3 * (Math.random() > 0.5 ? 1 : -1),
    dy: dy ?? -3,
  };
}

let balls = [createBall()];

// Blocks
const rows = 5;
const cols = 9;
const blockWidth = 75;
const blockHeight = 20;
const padding = 10;
const offsetTop = 50;
const offsetLeft = 35;

let blocks = [];

function initBlocks() {
  blocks = [];
  for (let c = 0; c < cols; c++) {
    blocks[c] = [];
    for (let r = 0; r < rows; r++) {
      blocks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }
}
initBlocks();

// Particles for blast effect
let particles = [];
function spawnParticles(x, y, color) {
  const count = 12 + Math.floor(Math.random() * 8);
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.8) * 6,
      life: 40 + Math.floor(Math.random() * 20),
      color: color || '#61dafb',
      size: 2 + Math.random() * 3,
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15; // gravity
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawParticles() {
  particles.forEach(p => {
    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0, p.life / 60);
    ctx.fillRect(p.x, p.y, p.size, p.size);
    ctx.globalAlpha = 1;
    ctx.closePath();
  });
}

// Powerups
const powerups = [];
const POWERUP_TYPES = [
  { id: 'expand', color: '#7bd389', label: 'P+' },
  { id: 'shrink', color: '#ff6b6b', label: 'P-' },
  { id: 'fast', color: '#ffd166', label: 'B+' },
  { id: 'slow', color: '#89cff0', label: 'B-' },
  { id: 'multiball', color: '#ffdd57', label: '+B' },
  { id: 'bomb', color: '#222222', label: 'BMB' },
  { id: 'life', color: '#ffb86b', label: '1UP' },
];

function spawnPowerup(x, y) {
  // 25% chance to spawn a powerup when a block is destroyed
  if (Math.random() > 0.25) return;
  const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
  powerups.push({ x: x, y: y, vy: 1.5, type: type.id, color: type.color, label: type.label });
}

function updatePowerups() {
  for (let i = powerups.length - 1; i >= 0; i--) {
    const p = powerups[i];
    p.y += p.vy;
    // collision with paddle
    const padTop = canvas.height - paddle.height - 10;
    if (
      p.y + 12 >= padTop &&
      p.x > paddle.x - 6 &&
      p.x < paddle.x + paddle.width + 6
    ) {
      applyPowerup(p.type);
      powerups.splice(i, 1);
      continue;
    }
    // remove if off-screen
    if (p.y > canvas.height + 20) powerups.splice(i, 1);
  }
}

function drawPowerups() {
  powerups.forEach(p => {
    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - 12, p.y - 8, 24, 16);
    ctx.fillStyle = '#071025';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(p.label, p.x, p.y + 4);
    ctx.closePath();
  });
}

// Active effect timers to revert changes
const activeEffects = {};
function applyPowerup(type) {
  console.log('Powerup collected:', type);
  if (type === 'expand') {
    if (activeEffects.expand) clearTimeout(activeEffects.expand.timer);
    paddle.width *= 1.5;
    activeEffects.expand = { timer: setTimeout(() => { paddle.width /= 1.5; delete activeEffects.expand; }, 10000) };
  } else if (type === 'shrink') {
    if (activeEffects.shrink) clearTimeout(activeEffects.shrink.timer);
    paddle.width = Math.max(30, paddle.width * 0.6);
    activeEffects.shrink = { timer: setTimeout(() => { paddle.width /= 0.6; delete activeEffects.shrink; }, 10000) };
  } else if (type === 'fast') {
    if (activeEffects.fast) clearTimeout(activeEffects.fast.timer);
    // apply to all existing balls
    balls.forEach(b => { b.dx *= 1.4; b.dy *= 1.4; });
    activeEffects.fast = { timer: setTimeout(() => { balls.forEach(b => { b.dx /= 1.4; b.dy /= 1.4; }); delete activeEffects.fast; }, 10000) };
  } else if (type === 'slow') {
    if (activeEffects.slow) clearTimeout(activeEffects.slow.timer);
    balls.forEach(b => { b.dx *= 0.7; b.dy *= 0.7; });
    activeEffects.slow = { timer: setTimeout(() => { balls.forEach(b => { b.dx /= 0.7; b.dy /= 0.7; }); delete activeEffects.slow; }, 10000) };
  } else if (type === 'multiball') {
    // add two extra balls with slight variance
    const spawnX = paddle.x + paddle.width / 2;
    const spawnY = canvas.height - paddle.height - 20;
    balls.push(createBall(spawnX, spawnY, 2.5, -3));
    balls.push(createBall(spawnX, spawnY, -2.5, -3.5));
  } else if (type === 'bomb') {
    // immediate penalty
    lives--;
    document.getElementById('lives').innerText = 'Lives: ' + lives;
    // spawn a visible blast near paddle to indicate penalty
    spawnParticles(paddle.x + paddle.width / 2, canvas.height - paddle.height - 20, '#ff6b6b');
    if (!lives) paused = true;
  } else if (type === 'life') {
    lives++;
    document.getElementById('lives').innerText = 'Lives: ' + lives;
  }
}

// Key listeners
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d") rightPressed = true;
  else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a") leftPressed = true;
  else if (e.key === " " || e.key === "Spacebar") paused = !paused;
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d") rightPressed = false;
  else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a") leftPressed = false;
}

// Drawing
function drawBalls() {
  balls.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffb86b";
    ctx.fill();
    ctx.closePath();
  });
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, canvas.height - paddle.height - 10, paddle.width, paddle.height);
  ctx.fillStyle = "#7bd389";
  ctx.fill();
  ctx.closePath();
}

function drawBlocks() {
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      if (blocks[c][r].status === 1) {
        const blockX = c * (blockWidth + padding) + offsetLeft;
        const blockY = r * (blockHeight + padding) + offsetTop;
        blocks[c][r].x = blockX;
        blocks[c][r].y = blockY;
        ctx.beginPath();
        ctx.rect(blockX, blockY, blockWidth, blockHeight);
        ctx.fillStyle = "#61dafb";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function collisionDetection() {
  // Check collisions for each ball against blocks
  balls.forEach(ball => {
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const b = blocks[c][r];
        if (b.status === 1) {
          if (
            ball.x > b.x &&
            ball.x < b.x + blockWidth &&
            ball.y > b.y &&
            ball.y < b.y + blockHeight
          ) {
            ball.dy = -ball.dy;
            b.status = 0;
            score += 10;
            document.getElementById("score").innerText = "Score: " + score;
            // spawn particles at block center
            const cx = b.x + blockWidth / 2;
            const cy = b.y + blockHeight / 2;
            spawnParticles(cx, cy, '#61dafb');
            // small chance to spawn powerup
            spawnPowerup(cx, cy);
            if (score === rows * cols * 10) {
              level++;
              document.getElementById("level").innerText = "Level: " + level;
              initBlocks();
            }
          }
        }
      }
    }
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBlocks();
  drawBalls();
  drawPaddle();
  collisionDetection();

  if (!paused) {
    // Ball(s) movement
    for (let i = balls.length - 1; i >= 0; i--) {
      const b = balls[i];
      b.x += b.dx;
      b.y += b.dy;

      // Wall collision
      if (b.x + b.dx > canvas.width - b.radius || b.x + b.dx < b.radius) {
        b.dx = -b.dx;
      }
      if (b.y + b.dy < b.radius) {
        b.dy = -b.dy;
      } else if (b.y + b.dy > canvas.height - b.radius - paddle.height - 10) {
        if (b.x > paddle.x && b.x < paddle.x + paddle.width) {
          b.dy = -b.dy;
        } else if (b.y + b.dy > canvas.height - b.radius) {
          // ball fell below bottom, remove it
          balls.splice(i, 1);
        }
      }
    }

    // if no balls left, lose a life and reset one ball or end game
    if (balls.length === 0) {
      lives--;
      document.getElementById("lives").innerText = "Lives: " + lives;
      if (!lives) {
        // game over - show overlay and pause
        paused = true;
      } else {
        balls = [createBall()];
        paddle.x = (canvas.width - paddle.width) / 2;
      }
    }

    // Paddle movement
    if (rightPressed && paddle.x < canvas.width - paddle.width) paddle.x += paddle.speed;
    else if (leftPressed && paddle.x > 0) paddle.x -= paddle.speed;
  }

  // update and draw particles & powerups regardless of pause
  updateParticles();
  drawParticles();
  updatePowerups();
  drawPowerups();

  // Draw Game Over overlay when paused due to zero lives
  if (paused && lives <= 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ff6b6b';
    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 10);
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px sans-serif';
    ctx.fillText('Click Restart to play again', canvas.width / 2, canvas.height / 2 + 30);
  }

  requestAnimationFrame(draw);
}
draw();

// Buttons
document.getElementById("restart").onclick = () => {
  score = 0;
  lives = 3;
  level = 1;
  document.getElementById("score").innerText = "Score: 0";
  document.getElementById("lives").innerText = "Lives: 3";
  document.getElementById("level").innerText = "Level: 1";
  initBlocks();
  // reset balls, paddle and effects
  balls = [createBall()];
  paddle.width = 100;
  paused = false;
  // clear active effects
  Object.keys(activeEffects).forEach(k => { clearTimeout(activeEffects[k].timer); delete activeEffects[k]; });
};

document.getElementById("pause").onclick = () => {
  paused = !paused;
};
