/* ================================================
   AD-SENSE — Flappy Ad Game
   Flappy Bird–inspired ad-avoidance game.
   Obstacles are ad canvases generated one-by-one.
   Crashing into or clicking an ad = game over.
   ================================================ */

(function (window) {
  'use strict';

  const { DOM, Utils, Accounts } = window.AdSense;

  /* ── Constants ────────────────────────────── */
  const CANVAS_W = 480;
  const CANVAS_H = 640;

  const BIRD_SCREEN_X = 90;           // fixed horizontal position on screen
  const BIRD_W = 34;
  const BIRD_H = 28;
  const GRAVITY = 0.38;
  const FLAP_FORCE = -6.8;
  const MAX_FALL_SPEED = 8;

  // Ad-obstacle dimensions (pixels) — IMPORTANT FOR MONETISATION
  // Each obstacle column is 110 px wide. Top & bottom ad panels fill
  // from the edge to the gap. Typical visible ad canvas per panel:
  //   Width  = 110 px
  //   Height = 140–410 px  (depends on random gap position)
  // These map closely to IAB's 120 × 240 "Vertical Banner" unit.
  const OBSTACLE_W = 110;

  const DIFFICULTY_CONFIG = {
    easy:   { gap: 170, speed: 2.2, spawnDist: 310, baseReward: 25 },
    medium: { gap: 145, speed: 3.0, spawnDist: 270, baseReward: 50 },
    hard:   { gap: 120, speed: 3.8, spawnDist: 240, baseReward: 100 },
  };

  const AD_TEXTS = [
    'BUY NOW', 'SALE!', 'CLICK ME', 'AD', '50% OFF',
    'FREE TRIAL', 'SUBSCRIBE', 'SHOP', 'PROMO', 'DEAL',
    'LIMITED', 'HOT OFFER', 'NEW!', 'BEST BUY', 'SPONSOR',
  ];

  const AD_COLORS = [
    { bg: '#1a1a2e', border: '#e94560', text: '#e94560' },
    { bg: '#16213e', border: '#0f3460', text: '#53a8b6' },
    { bg: '#1b1b2f', border: '#f6c90e', text: '#f6c90e' },
    { bg: '#0d1117', border: '#58a6ff', text: '#58a6ff' },
    { bg: '#1a1a2e', border: '#10b981', text: '#10b981' },
    { bg: '#1c1c3c', border: '#ec4899', text: '#ec4899' },
  ];

  /* ── State ─────────────────────────────── */
  let gameState = {
    status: 'idle',          // idle | ready | playing | dead
    difficulty: 'easy',
    bird: { y: 0, vel: 0, rotation: 0 },
    obstacles: [],           // { worldX, gapTop, colorIdx, textIdx, scored }
    worldOffset: 0,
    nextSpawnX: 0,
    score: 0,
    bestScore: 0,
    frameId: null,
    lastTime: 0,
    deathReason: '',
    flapAnim: 0,
  };

  let canvas, ctx;

  /* ── Helpers ───────────────────────────── */
  function cfg() {
    return DIFFICULTY_CONFIG[gameState.difficulty];
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /* ── Screen Navigation ─────────────────── */
  function showScreen(name) {
    DOM.hide(DOM.element('flappy-instructions'));
    DOM.hide(DOM.element('flappy-game-play'));
    DOM.hide(DOM.element('flappy-results'));

    if (name === 'instructions') DOM.show(DOM.element('flappy-instructions'));
    else if (name === 'playing')  DOM.show(DOM.element('flappy-game-play'));
    else if (name === 'results')  DOM.show(DOM.element('flappy-results'));
  }

  /* ── Obstacle Generation (one-by-one) ─── */
  function spawnObstacle() {
    const { gap } = cfg();
    const minTop = 60;
    const maxTop = CANVAS_H - gap - 60;
    const gapTop = randInt(minTop, maxTop);

    gameState.obstacles.push({
      worldX: gameState.nextSpawnX,
      gapTop: gapTop,
      colorIdx: randInt(0, AD_COLORS.length - 1),
      textIdx: randInt(0, AD_TEXTS.length - 1),
      scored: false,
    });

    gameState.nextSpawnX += cfg().spawnDist;
  }

  /* ── Drawing ───────────────────────────── */

  // Draw a single ad-panel (top or bottom portion of an obstacle)
  function drawAdPanel(x, y, w, h, colorIdx, textIdx) {
    if (h <= 0 || w <= 0) return;
    const clr = AD_COLORS[colorIdx];
    const txt = AD_TEXTS[textIdx];

    // Panel body
    ctx.fillStyle = clr.bg;
    ctx.fillRect(x, y, w, h);

    // Border
    ctx.strokeStyle = clr.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

    // Inner glow line at the opening edge
    ctx.strokeStyle = clr.border;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 4;
    // Determine which edge faces the gap
    if (y === 0) {
      // top panel → glow at bottom edge
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.stroke();
    } else {
      // bottom panel → glow at top edge
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;

    // "Advertisement" label
    if (h > 50) {
      ctx.fillStyle = clr.text;
      ctx.globalAlpha = 0.35;
      ctx.font = '700 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ADVERTISEMENT', x + w / 2, y + 16);
      ctx.globalAlpha = 1;
    }

    // Main ad text
    if (h > 80) {
      ctx.fillStyle = clr.text;
      ctx.font = '800 18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(txt, x + w / 2, y + h / 2);
      ctx.textBaseline = 'alphabetic';
    }

    // Decorative dashed inner border
    if (h > 60) {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = clr.border;
      ctx.globalAlpha = 0.18;
      ctx.strokeRect(x + 8, y + 24, w - 16, h - 32);
      ctx.globalAlpha = 1;
      ctx.setLineDash([]);
    }
  }

  function drawObstacles() {
    const { gap } = cfg();
    gameState.obstacles.forEach((obs) => {
      const screenX = obs.worldX - gameState.worldOffset;
      // Only draw if on screen (with small margin)
      if (screenX + OBSTACLE_W < -20 || screenX > CANVAS_W + 20) return;

      const topH = obs.gapTop;
      const botY = obs.gapTop + gap;
      const botH = CANVAS_H - botY;

      drawAdPanel(screenX, 0, OBSTACLE_W, topH, obs.colorIdx, obs.textIdx);
      drawAdPanel(screenX, botY, OBSTACLE_W, botH,
        (obs.colorIdx + 1) % AD_COLORS.length,
        (obs.textIdx + 3) % AD_TEXTS.length);
    });
  }

  function drawBird() {
    const b = gameState.bird;
    const cx = BIRD_SCREEN_X + BIRD_W / 2;
    const cy = b.y + BIRD_H / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(b.rotation);

    // Body
    ctx.fillStyle = '#f6c90e';
    ctx.beginPath();
    ctx.ellipse(0, 0, BIRD_W / 2, BIRD_H / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d4a800';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Wing
    const wingFlap = Math.sin(gameState.flapAnim) * 4;
    ctx.fillStyle = '#e0b400';
    ctx.beginPath();
    ctx.ellipse(-4, wingFlap, 8, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(8, -4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(9, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#e94560';
    ctx.beginPath();
    ctx.moveTo(BIRD_W / 2 - 2, -2);
    ctx.lineTo(BIRD_W / 2 + 8, 2);
    ctx.lineTo(BIRD_W / 2 - 2, 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawBackground() {
    // Dark gradient sky
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    grad.addColorStop(0, '#0a0a14');
    grad.addColorStop(0.5, '#0e0e1a');
    grad.addColorStop(1, '#12121f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    const gridOffset = -(gameState.worldOffset % 40);
    for (let gx = gridOffset; gx < CANVAS_W; gx += 40) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, CANVAS_H);
      ctx.stroke();
    }
    for (let gy = 0; gy < CANVAS_H; gy += 40) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(CANVAS_W, gy);
      ctx.stroke();
    }
  }

  function drawHUD() {
    // Score in top-center
    ctx.fillStyle = '#fff';
    ctx.font = '800 36px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.globalAlpha = 0.85;
    ctx.fillText(gameState.score, CANVAS_W / 2, 18);
    ctx.globalAlpha = 1;
    ctx.textBaseline = 'alphabetic';
  }

  function render() {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    drawBackground();
    drawObstacles();
    if (gameState.status !== 'idle') drawBird();
    if (gameState.status === 'playing' || gameState.status === 'dead') drawHUD();
  }

  /* ── Collision Detection ───────────────── */
  function checkCollision() {
    const b = gameState.bird;
    const { gap } = cfg();

    // Floor / ceiling
    if (b.y < 0 || b.y + BIRD_H > CANVAS_H) {
      return 'Crashed into the boundary!';
    }

    // Obstacles
    for (const obs of gameState.obstacles) {
      const screenX = obs.worldX - gameState.worldOffset;
      const birdRight = BIRD_SCREEN_X + BIRD_W;
      const obsRight = screenX + OBSTACLE_W;

      // Horizontal overlap?
      if (birdRight > screenX + 4 && BIRD_SCREEN_X < obsRight - 4) {
        const topH = obs.gapTop;
        const botY = obs.gapTop + gap;
        // Vertical overlap with top or bottom panel?
        if (b.y < topH - 2 || b.y + BIRD_H > botY + 2) {
          return 'Crashed into an ad canvas!';
        }
      }
    }
    return null;
  }

  /* ── Click-on-Ad Detection ─────────────── */
  function isClickOnAd(canvasX, canvasY) {
    const { gap } = cfg();
    for (const obs of gameState.obstacles) {
      const screenX = obs.worldX - gameState.worldOffset;
      if (canvasX >= screenX && canvasX <= screenX + OBSTACLE_W) {
        const topH = obs.gapTop;
        const botY = obs.gapTop + gap;
        if (canvasY <= topH || canvasY >= botY) {
          return true;
        }
      }
    }
    return false;
  }

  /* ── Game Loop ─────────────────────────── */
  function update() {
    if (gameState.status !== 'playing') return;

    const { speed } = cfg();
    const b = gameState.bird;

    // Physics
    b.vel += GRAVITY;
    if (b.vel > MAX_FALL_SPEED) b.vel = MAX_FALL_SPEED;
    b.y += b.vel;

    // Bird rotation based on velocity
    b.rotation = Math.max(-0.45, Math.min(b.vel * 0.07, 1.2));

    // Wing flap animation
    gameState.flapAnim += 0.25;

    // Scroll world
    gameState.worldOffset += speed;

    // Spawn next obstacle when needed (one-by-one generation)
    const lastObs = gameState.obstacles[gameState.obstacles.length - 1];
    const lastScreenX = lastObs ? lastObs.worldX - gameState.worldOffset : -999;
    if (!lastObs || lastScreenX < CANVAS_W - 50) {
      spawnObstacle();
    }

    // Score — when bird passes an obstacle's right edge
    for (const obs of gameState.obstacles) {
      if (!obs.scored) {
        const obsRight = obs.worldX + OBSTACLE_W;
        if (obsRight < gameState.worldOffset + BIRD_SCREEN_X) {
          obs.scored = true;
          gameState.score++;
          updateScoreDisplay();
        }
      }
    }

    // Prune far-behind obstacles
    gameState.obstacles = gameState.obstacles.filter(
      (obs) => obs.worldX + OBSTACLE_W > gameState.worldOffset - 100
    );

    // Collision
    const hit = checkCollision();
    if (hit) {
      die(hit);
    }
  }

  function gameLoop(timestamp) {
    if (gameState.status === 'dead') {
      render();
      return;
    }
    update();
    render();
    gameState.frameId = requestAnimationFrame(gameLoop);
  }

  /* ── Actions ───────────────────────────── */
  function flap() {
    if (gameState.status === 'ready') {
      gameState.status = 'playing';
      DOM.hide(DOM.element('flappy-start-overlay'));
    }
    if (gameState.status === 'playing') {
      gameState.bird.vel = FLAP_FORCE;
    }
  }

  function die(reason) {
    gameState.status = 'dead';
    gameState.deathReason = reason;
    cancelAnimationFrame(gameState.frameId);

    // Update best score
    const stored = parseInt(localStorage.getItem('flappy-best-' + gameState.difficulty) || '0', 10);
    if (gameState.score > stored) {
      localStorage.setItem('flappy-best-' + gameState.difficulty, gameState.score);
      gameState.bestScore = gameState.score;
    }

    // Show game-over overlay briefly, then results
    const overlay = DOM.element('flappy-gameover-overlay');
    DOM.element('flappy-gameover-title').textContent = 'Game Over!';
    DOM.element('flappy-gameover-reason').textContent = reason;
    DOM.element('flappy-gameover-score-val').textContent = gameState.score;
    overlay.style.display = 'flex';

    setTimeout(() => {
      overlay.style.display = 'none';
      showResults();
    }, 2000);
  }

  function showResults() {
    const { baseReward } = cfg();
    const credits = Math.floor(gameState.score * (baseReward / 10));

    DOM.element('flappy-results-status').textContent =
      gameState.score >= 10 ? '🏆 Amazing Run!' :
      gameState.score >= 5 ? '🎉 Great Job!' : '💪 Keep Trying!';

    DOM.element('flappy-result-score').textContent = gameState.score;
    DOM.element('flappy-result-dodged').textContent = gameState.score;
    DOM.element('flappy-result-credits').textContent = credits;

    // Award credits
    const currentUser = Accounts.getCurrent();
    if (currentUser) {
      const accounts = Accounts.getAll();
      if (accounts[currentUser]) {
        accounts[currentUser].credits = (accounts[currentUser].credits || 0) + credits;
        accounts[currentUser].gamesPlayed = (accounts[currentUser].gamesPlayed || 0) + 1;
        Accounts.saveAll(accounts);
      }
    }

    showScreen('results');
  }

  function updateScoreDisplay() {
    const el = DOM.element('flappy-score');
    if (el) el.textContent = gameState.score;
  }

  /* ── Init / Reset ──────────────────────── */
  function resetGame() {
    if (gameState.frameId) cancelAnimationFrame(gameState.frameId);

    const best = parseInt(
      localStorage.getItem('flappy-best-' + gameState.difficulty) || '0', 10
    );

    gameState.status = 'ready';
    gameState.bird = { y: CANVAS_H / 2 - BIRD_H / 2, vel: 0, rotation: 0 };
    gameState.obstacles = [];
    gameState.worldOffset = 0;
    gameState.nextSpawnX = CANVAS_W - 30; // first obstacle appears near right edge
    gameState.score = 0;
    gameState.bestScore = best;
    gameState.flapAnim = 0;
    gameState.deathReason = '';

    // Spawn first obstacle
    spawnObstacle();

    updateScoreDisplay();
    DOM.element('flappy-best').textContent = best;
    DOM.element('flappy-difficulty-display').textContent =
      gameState.difficulty.charAt(0).toUpperCase() + gameState.difficulty.slice(1);

    DOM.element('flappy-start-overlay').style.display = 'flex';
    DOM.element('flappy-gameover-overlay').style.display = 'none';

    render();
    gameState.frameId = requestAnimationFrame(gameLoop);
  }

  function startWithDifficulty(diff) {
    gameState.difficulty = diff;
    showScreen('playing');
    initCanvas();
    resetGame();
  }

  function initCanvas() {
    canvas = DOM.element('flappy-canvas');
    ctx = canvas.getContext('2d');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
  }

  /* ── Input Handling ────────────────────── */
  function handleCanvasClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (gameState.status === 'dead') return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top) * scaleY;

    // Check if click landed on an ad obstacle
    if (gameState.status === 'playing' && isClickOnAd(cx, cy)) {
      die('You clicked on an ad! Stay away from ads!');
      return;
    }

    flap();
  }

  function handleCanvasTouch(e) {
    e.preventDefault();
    if (gameState.status === 'dead') return;

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const cx = (touch.clientX - rect.left) * scaleX;
    const cy = (touch.clientY - rect.top) * scaleY;

    if (gameState.status === 'playing' && isClickOnAd(cx, cy)) {
      die('You tapped on an ad! Avoid the ads!');
      return;
    }

    flap();
  }

  function handleKeydown(e) {
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      if (gameState.status === 'dead') return;
      flap();
    }
  }

  /* ── Bootstrap ─────────────────────────── */
  function init() {
    // Difficulty buttons
    document.querySelectorAll('#flappy-instructions .difficulty-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const diff = btn.getAttribute('data-difficulty');
        startWithDifficulty(diff);
      });
    });

    // Quit button
    const quitBtn = DOM.element('flappy-quit-btn');
    if (quitBtn) {
      quitBtn.addEventListener('click', () => {
        if (gameState.frameId) cancelAnimationFrame(gameState.frameId);
        gameState.status = 'idle';
        showScreen('instructions');
      });
    }

    // Play again (from results)
    const playAgainBtn = DOM.element('flappy-play-again-btn');
    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', () => {
        showScreen('playing');
        resetGame();
      });
    }

    // Retry (from game-over overlay)
    const retryBtn = DOM.element('flappy-retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        resetGame();
      });
    }

    // Canvas input (deferred until canvas exists)
    const observer = new MutationObserver(() => {
      const c = DOM.element('flappy-canvas');
      if (c && !c._flappyBound) {
        c._flappyBound = true;
        c.addEventListener('click', handleCanvasClick);
        c.addEventListener('touchstart', handleCanvasTouch, { passive: false });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Also try binding immediately
    const c = DOM.element('flappy-canvas');
    if (c && !c._flappyBound) {
      c._flappyBound = true;
      c.addEventListener('click', handleCanvasClick);
      c.addEventListener('touchstart', handleCanvasTouch, { passive: false });
    }

    // Keyboard
    document.addEventListener('keydown', handleKeydown);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ─── Export ───
  window.AdSense = window.AdSense || {};
  window.AdSense.FlappyAd = { init, resetGame };

})(window);
