/* ================================================
   AD-SENSE — Puzzle Game (15-Tile)
   Game state, rendering, scoring, anti-fraud
   ================================================ */

(function (window) {
  'use strict';

  const { DOM, Utils, Accounts } = window.AdSense;

  let gameState = {
    isRunning: false,
    tiles: [],
    moves: 0,
    startTime: 0,
    gameTime: 0,
    difficulty: 'easy',
    timerInterval: null,
    gridSize: 4,
    emptyIndex: 15,
    suspiciousActivity: false,
  };

  const DIFFICULTY_CONFIG = {
    easy: { gridSize: 3, timeLimit: 120, baseReward: 25 },
    medium: { gridSize: 4, timeLimit: 90, baseReward: 50 },
    hard: { gridSize: 5, timeLimit: 60, baseReward: 100 },
  };

  // ─── Game Screen Navigation ───
  function showScreen(screen) {
    const instructions = DOM.element('puzzle-instructions');
    const playing = DOM.element('puzzle-game-play');
    const results = DOM.element('puzzle-results');

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
    gameState.moves = 0;
    gameState.startTime = Date.now();
    gameState.gameTime = 0;
    gameState.suspiciousActivity = false;
    gameState.gridSize = config.gridSize;
    gameState.tiles = generatePuzzle();
    gameState.emptyIndex = gameState.tiles.indexOf(null);

    showScreen('playing');
    renderPuzzle();
    startTimer();
  }

  // ─── Puzzle Generation ───
  function generatePuzzle() {
    const totalTiles = gameState.gridSize * gameState.gridSize;
    const tiles = Array.from({ length: totalTiles - 1 }, (_, i) => i + 1);
    tiles.push(null);

    // Shuffle with valid moves to keep puzzle solvable.
    for (let i = 0; i < totalTiles * 20; i++) {
      const emptyIndex = tiles.indexOf(null);
      const validMoves = getValidMoves(emptyIndex);
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      [tiles[emptyIndex], tiles[randomMove]] = [tiles[randomMove], tiles[emptyIndex]];
    }

    return tiles;
  }

  function getValidMoves(emptyIndex) {
    const moves = [];
    const gridSize = gameState.gridSize;
    const row = Math.floor(emptyIndex / gridSize);
    const col = emptyIndex % gridSize;

    if (row > 0) moves.push(emptyIndex - gridSize);
    if (row < gridSize - 1) moves.push(emptyIndex + gridSize);
    if (col > 0) moves.push(emptyIndex - 1);
    if (col < gridSize - 1) moves.push(emptyIndex + 1);

    return moves;
  }

  // ─── Render Puzzle Grid ───
  function renderPuzzle() {
    const grid = DOM.element('puzzle-grid');
    if (!grid) return;

    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${gameState.gridSize}, minmax(60px, 1fr))`;
    grid.style.gridTemplateRows = `repeat(${gameState.gridSize}, minmax(60px, 1fr))`;

    gameState.tiles.forEach((tile, index) => {
      const tileEl = document.createElement('div');
      tileEl.className = 'puzzle-tile';

      if (tile === null) {
        tileEl.classList.add('empty');
      } else {
        tileEl.textContent = tile;
        tileEl.classList.add('moveable');
        tileEl.addEventListener('click', () => handleTileClick(index));
      }

      grid.appendChild(tileEl);
    });

    // Update stats
    DOM.element('game-moves').textContent = gameState.moves;
    DOM.element('game-difficulty-display').textContent =
      gameState.difficulty.charAt(0).toUpperCase() + gameState.difficulty.slice(1);
  }

  // ─── Handle Tile Click ───
  function handleTileClick(index) {
    if (!gameState.isRunning) return;

    const emptyIndex = gameState.tiles.indexOf(null);
    const validMoves = getValidMoves(emptyIndex);

    if (validMoves.includes(index)) {
      [gameState.tiles[emptyIndex], gameState.tiles[index]] = [gameState.tiles[index], gameState.tiles[emptyIndex]];
      gameState.moves++;
      gameState.emptyIndex = index;
      renderPuzzle();

      if (isPuzzleSolved(gameState.tiles)) endGame(true);
    }
  }

  // ─── Check Win Condition ───
  function isPuzzleSolved(tiles = gameState.tiles) {
    for (let i = 0; i < tiles.length - 1; i++) {
      if (tiles[i] !== i + 1) return false;
    }
    return tiles[tiles.length - 1] === null;
  }

  // ─── Timer Management ───
  function startTimer() {
    const config = DIFFICULTY_CONFIG[gameState.difficulty];
    let timeRemaining = config.timeLimit;

    DOM.element('game-timer').textContent = `${timeRemaining}s`;

    gameState.timerInterval = setInterval(() => {
      timeRemaining--;
      gameState.gameTime = config.timeLimit - timeRemaining;

      DOM.element('game-timer').textContent = `${timeRemaining}s`;

      if (timeRemaining <= 0) {
        endGame(false);
      } else if (timeRemaining <= 10) {
        DOM.element('game-timer').style.color = '#ff6b6b';
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
  function endGame(won) {
    stopTimer();
    gameState.isRunning = false;

    const config = DIFFICULTY_CONFIG[gameState.difficulty];
    let creditsEarned = 0;

    if (won) {
      // Anti-fraud detection
      const averageMoveTime = (gameState.gameTime * 1000) / Math.max(gameState.moves, 1);
      const suspiciouslyFast = averageMoveTime < 50;
      const tooManyMoves = gameState.moves > 200;

      if (suspiciouslyFast || tooManyMoves) {
        gameState.suspiciousActivity = true;
      } else {
        const timeBonus = Math.max(0, config.timeLimit - gameState.gameTime);
        const movesPenalty = Math.max(0, gameState.moves - 15);
        creditsEarned = Math.max(0, config.baseReward + Math.floor(timeBonus / 2) - Math.floor(movesPenalty / 5));
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

    showResults(won, creditsEarned);
  }

  // ─── Display Results ───
  function showResults(won, creditsEarned) {
    const statusEl = DOM.element('results-status');
    const creditsEl = DOM.element('result-credits');

    if (gameState.suspiciousActivity) {
      statusEl.textContent = '⚠️ Activity Detected';
      creditsEl.textContent = '0';
      creditsEl.style.color = '#ff6b6b';
      console.warn('Suspicious puzzle activity detected');
    } else {
      statusEl.textContent = won ? '🎉 Puzzle Solved!' : '⏱ Time\'s Up!';
      creditsEl.textContent = won ? `+${creditsEarned}` : '0';
      creditsEl.style.color = won ? 'var(--accent-green)' : 'var(--text-muted)';
    }

    DOM.element('result-time').textContent = `${gameState.gameTime}s`;
    DOM.element('result-moves').textContent = gameState.moves;

    showScreen('results');
  }

  // ─── Initialize Game ───
  function init() {
    // Difficulty selection (works for both modal and standalone pages)
    const difficultyBtns = DOM.queryAll('.difficulty-btn');
    if (difficultyBtns && difficultyBtns.length > 0) {
      difficultyBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          gameState.difficulty = btn.dataset.difficulty;
          startNewGame();
        });
      });
    }

    const startBtn = DOM.element('start-puzzle-game');
    const modal = DOM.element('puzzle-game-modal');
    const closeBtn = DOM.element('puzzle-game-close');
    const overlay = DOM.element('puzzle-game-overlay');

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
    const quitBtn = DOM.element('puzzle-quit-btn');
    const playAgainBtn = DOM.element('puzzle-play-again-btn');
    const backBtn = DOM.element('puzzle-back-btn');

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
  }

  // ─── Export ───
  window.AdSense = window.AdSense || {};
  window.AdSense.PuzzleGame = { init };

  // ─── Auto-Initialize on DOM Ready ───
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
