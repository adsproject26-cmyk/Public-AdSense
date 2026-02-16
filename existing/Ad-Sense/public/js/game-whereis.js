/* ================================================
   AD-SENSE — Where Is It Game
   Symbol search game, block generation, scoring
   ================================================ */

(function (window) {
  'use strict';

  const { DOM, Utils, Accounts } = window.AdSense;

  let gameState = {
    isRunning: false,
    symbols: ['★', '●', '■', '◆', '✦', '△', '♠', '♣', '♥', '♦'],
    currentSymbol: '★',
    blocks: [],
    correctBlockId: null,
    wrongClicks: 0,
    startTime: 0,
    gameTime: 0,
    difficulty: 'easy',
    timerInterval: null,
    suspiciousActivity: false,
  };

  const DIFFICULTY_CONFIG = {
    easy: { timeLimit: 180, blockCount: 30, baseReward: 30, penalty: 2, minBlockSize: 96 },
    medium: { timeLimit: 120, blockCount: 48, baseReward: 70, penalty: 3, minBlockSize: 78 },
    hard: { timeLimit: 90, blockCount: 72, baseReward: 120, penalty: 5, minBlockSize: 64 },
  };

  const BLOCK_SYMBOLS = ['★', '●', '■', '◆', '✦', '△', '♠', '♣', '♥', '♦', '✓', '✗'];
  const DEFAULT_CANVAS_SIZE = { width: 960, height: 640 };

  // ─── Game Screen Navigation ───
  function showScreen(screen) {
    const instructions = DOM.element('whereis-instructions');
    const playing = DOM.element('whereis-game-play');
    const results = DOM.element('whereis-results');

    DOM.hide(instructions);
    DOM.hide(playing);
    DOM.hide(results);

    if (screen === 'instructions') DOM.show(instructions);
    else if (screen === 'playing') DOM.show(playing);
    else if (screen === 'results') DOM.show(results);
  }

  // ─── Start New Game ───
  function startNewGame() {
    const config = DIFFICULTY_CONFIG[gameState.difficulty];

    gameState.isRunning = true;
    gameState.wrongClicks = 0;
    gameState.startTime = Date.now();
    gameState.gameTime = 0;
    gameState.suspiciousActivity = false;

    // Select target symbol
    gameState.currentSymbol = gameState.symbols[Math.floor(Math.random() * gameState.symbols.length)];

    // Generate blocks
    gameState.blocks = generateBlocks(config.blockCount, gameState.currentSymbol);
    gameState.correctBlockId = Math.floor(Math.random() * gameState.blocks.length);
    gameState.blocks[gameState.correctBlockId].symbol = gameState.currentSymbol;

    showScreen('playing');
    renderCanvas();
    startTimer(config.timeLimit);
  }

  // ─── Generate Blocks ───
  function generateBlocks(count, targetSymbol) {
    const symbols = BLOCK_SYMBOLS.filter((symbol) => symbol !== targetSymbol);
    const blocks = [];

    for (let i = 0; i < count; i++) {
      blocks.push({
        id: i,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
      });
    }

    return blocks;
  }

  function randBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function getCanvasMetrics() {
    const container = DOM.element('whereis-canvas-container');
    if (!container) return DEFAULT_CANVAS_SIZE;

    const rect = container.getBoundingClientRect();
    const width = Math.max(320, Math.floor(rect.width));
    const height = Math.max(320, Math.floor(rect.height * 1.4));

    return { width, height };
  }

  function buildPackedLayout(count, width, height, minSize) {
    let rects = [{ x: 0, y: 0, w: width, h: height }];
    let currentMin = minSize;
    let safety = 0;

    while (rects.length < count && safety < 10000) {
      safety += 1;

      rects.sort((a, b) => (b.w * b.h) - (a.w * a.h));
      const rect = rects.shift();
      if (!rect) break;

      const canSplitW = rect.w >= currentMin * 2;
      const canSplitH = rect.h >= currentMin * 2;

      if (!canSplitW && !canSplitH) {
        rects.push(rect);
        currentMin = Math.max(40, currentMin - 4);
        continue;
      }

      const splitVertical = canSplitW && (!canSplitH || Math.random() > 0.45);
      if (splitVertical) {
        const splitX = Math.floor(randBetween(rect.x + currentMin, rect.x + rect.w - currentMin));
        rects.push({ x: rect.x, y: rect.y, w: splitX - rect.x, h: rect.h });
        rects.push({ x: splitX, y: rect.y, w: rect.x + rect.w - splitX, h: rect.h });
      } else {
        const splitY = Math.floor(randBetween(rect.y + currentMin, rect.y + rect.h - currentMin));
        rects.push({ x: rect.x, y: rect.y, w: rect.w, h: splitY - rect.y });
        rects.push({ x: rect.x, y: splitY, w: rect.w, h: rect.y + rect.h - splitY });
      }
    }

    return rects.slice(0, count);
  }

  // ─── Render Game Canvas ───
  function renderCanvas() {
    const canvas = DOM.element('whereis-canvas');
    const canvasContainer = DOM.element('whereis-canvas-container');
    const targetEl = DOM.element('whereis-target-symbol');
    const answerInput = DOM.element('whereis-answer-input');

    const config = DIFFICULTY_CONFIG[gameState.difficulty];

    if (!canvas || !canvasContainer) return;

    canvas.innerHTML = '';
    targetEl.textContent = gameState.currentSymbol;

    const { width, height } = getCanvasMetrics();
    canvas.style.height = `${height}px`;
    canvas.style.width = `${width}px`;

    const layout = buildPackedLayout(gameState.blocks.length, width, height, config.minBlockSize);

    if (answerInput) {
      answerInput.max = String(gameState.blocks.length);
    }

    gameState.blocks.forEach((block) => {
      const rect = layout[block.id];
      if (!rect) return;

      const maxInset = 8;
      const inset = Math.min(Math.floor(randBetween(0, maxInset)), Math.floor(Math.min(rect.w, rect.h) / 6));
      const blockWidth = Math.max(44, rect.w - inset * 2);
      const blockHeight = Math.max(44, rect.h - inset * 2);

      const blockEl = document.createElement('div');
      blockEl.className = 'whereis-ad-block';
      blockEl.id = `block-${block.id}`;
      blockEl.dataset.blockId = block.id;
      blockEl.style.left = `${rect.x + inset}px`;
      blockEl.style.top = `${rect.y + inset}px`;
      blockEl.style.width = `${blockWidth}px`;
      blockEl.style.height = `${blockHeight}px`;

      blockEl.innerHTML = `
        <div class="whereis-ad-block-content">
          <div class="whereis-ad-img">📢</div>
          <div>${block.symbol}</div>
        </div>
        <div class="whereis-ad-block-number">${block.id + 1}</div>
      `;

      canvas.appendChild(blockEl);
    });
  }

  // ─── Handle Answer Submission ───
  function handleSubmit() {
    if (!gameState.isRunning) return;

    const inputEl = DOM.element('whereis-answer-input');
    const answer = parseInt(inputEl.value, 10);

    if (isNaN(answer) || answer < 1) {
      inputEl.value = '';
      return;
    }

    const correctBlockNumber = gameState.correctBlockId + 1;

    if (answer === correctBlockNumber) {
      // Correct!
      const blockEl = DOM.element(`block-${gameState.correctBlockId}`);
      if (blockEl) blockEl.classList.add('correct');
      endGame(true);
    } else {
      // Wrong
      gameState.wrongClicks++;
      inputEl.value = '';
      inputEl.focus();
      DOM.element('whereis-wrong-clicks').textContent = gameState.wrongClicks;

      // Flash red
      inputEl.style.borderColor = '#ff6b6b';
      setTimeout(() => {
        inputEl.style.borderColor = '';
      }, 300);
    }
  }

  // ─── Timer Management ───
  function startTimer(timeLimit) {
    let timeRemaining = timeLimit;
    DOM.element('whereis-timer').textContent = `${timeRemaining}s`;

    gameState.timerInterval = setInterval(() => {
      timeRemaining--;
      gameState.gameTime = timeLimit - timeRemaining;

      DOM.element('whereis-timer').textContent = `${timeRemaining}s`;

      if (timeRemaining <= 0) {
        endGame(false);
      } else if (timeRemaining <= 10) {
        DOM.element('whereis-timer').style.color = '#ff6b6b';
      }
    }, 1000);
  }

  function stopTimer() {
    if (gameState.timerInterval) {
      clearInterval(gameState.timerInterval);
      gameState.timerInterval = null;
    }
    gameState.isRunning = false;
  }

  // ─── Game End & Scoring ───
  function endGame(found) {
    stopTimer();
    gameState.isRunning = false;

    const config = DIFFICULTY_CONFIG[gameState.difficulty];
    let creditsEarned = 0;

    if (found) {
      // Anti-fraud detection
      const averageClickTime = (gameState.gameTime * 1000) / Math.max(gameState.wrongClicks + 1, 1);
      const suspiciouslyFast = averageClickTime < 100;
      const tooManyClicks = gameState.wrongClicks > 50;

      if (suspiciouslyFast || tooManyClicks) {
        gameState.suspiciousActivity = true;
      } else {
        const timeBonus = Math.max(0, config.timeLimit - gameState.gameTime);
        const wrongClickPenalty = gameState.wrongClicks * config.penalty;
        creditsEarned = Math.max(0, config.baseReward + Math.floor(timeBonus / 4) - wrongClickPenalty);
      }
    }

    // Update user profile
    const user = Accounts.getCurrent();
    if (user) {
      user.credits += creditsEarned;
      user.gamesPlayed = (user.gamesPlayed || 0) + 1;
      user.level = Utils.calculateLevel(user.credits);
      Accounts.saveCurrent(user);
      window.AdSense.Profile.load();
    }

    showResults(found, creditsEarned);
  }

  // ─── Display Results ───
  function showResults(found, creditsEarned) {
    const statusEl = DOM.element('whereis-results-status');
    const creditsEl = DOM.element('whereis-result-credits');

    if (gameState.suspiciousActivity) {
      statusEl.textContent = '⚠️ Activity Detected';
      creditsEl.textContent = '0';
      creditsEl.style.color = '#ff6b6b';
      console.warn('Suspicious where-is-it activity detected');
    } else {
      statusEl.textContent = found ? '🎉 Found It!' : '⏱ Time\'s Up!';
      creditsEl.textContent = found ? `+${creditsEarned}` : '0';
      creditsEl.style.color = found ? 'var(--accent-green)' : 'var(--text-muted)';
    }

    DOM.element('whereis-result-time').textContent = `${gameState.gameTime}s`;
    DOM.element('whereis-result-wrong').textContent = gameState.wrongClicks;

    showScreen('results');
  }

  // ─── Initialize Game ───
  function init() {
    // Difficulty selection (works for both modal and standalone pages)
    const difficultyBtns = DOM.queryAll('.whereis-difficulty-btn');
    if (difficultyBtns && difficultyBtns.length > 0) {
      difficultyBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          gameState.difficulty = btn.dataset.difficulty;
          startNewGame();
        });
      });
    }

    const startBtn = DOM.element('start-whereis-game');
    const modal = DOM.element('whereis-game-modal');
    const closeBtn = DOM.element('whereis-game-close');
    const overlay = DOM.element('whereis-game-overlay');

    // Only setup modal controls if modal exists (on index.html)
    if (!startBtn || !modal) {
      // Standalone game page - just setup game controls
      setupGameControls(null);
      return;
    }

    // Open game
    startBtn.addEventListener('click', () => {
      modal.classList.add('show');
      showScreen('instructions');
    });

    // Close game
    const closeModal = () => {
      modal.classList.remove('show');
      stopTimer();
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);

    // Setup game controls for modal version
    setupGameControls(closeModal);
  }

  function setupGameControls(closeModal) {
    // Game controls
    const quitBtn = DOM.element('whereis-quit-btn');
    const playAgainBtn = DOM.element('whereis-play-again-btn');
    const backBtn = DOM.element('whereis-back-btn');
    const submitBtn = DOM.element('whereis-submit-btn');
    const answerInput = DOM.element('whereis-answer-input');

    if (quitBtn) {
      quitBtn.addEventListener('click', () => {
        stopTimer();
        showScreen('instructions');
      });
    }

    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', startNewGame);
    }

    if (backBtn && closeModal) {
      backBtn.addEventListener('click', closeModal);
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', handleSubmit);
    }

    if (answerInput) {
      answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSubmit();
      });
    }
  }

  // ─── Export ───
  window.AdSense = window.AdSense || {};
  window.AdSense.WhereIsItGame = { init };

  // ─── Auto-Initialize on DOM Ready ───
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
