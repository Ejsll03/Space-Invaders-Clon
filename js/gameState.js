export let gameState = 'start';
export let keys = {};

export const pauseMenuOptions = ['Continuar', 'Reiniciar Nivel', 'Salir'];
export let selectedPauseOption = 0;

export const gameOverMenuOptions = ['Volver al inicio', 'Volver a jugar'];
export let selectedGameOverOption = 0;

// ── Overlays HTML ─────────────────────────────────────────────
const pauseOverlay    = document.getElementById('pause-overlay');
const gameoverOverlay = document.getElementById('gameover-overlay');
const gameoverScore   = document.getElementById('gameover-score');

function showPauseOverlay()    { pauseOverlay?.classList.add('visible'); }
function hidePauseOverlay()    { pauseOverlay?.classList.remove('visible'); }
function showGameoverOverlay(score) {
    if (gameoverScore) gameoverScore.textContent = `Puntuacion: ${score}`;
    gameoverOverlay?.classList.add('visible');
}
function hideGameoverOverlay() { gameoverOverlay?.classList.remove('visible'); }

export function setGameState(newState, score = 0) {
    gameState = newState;
    if (newState === 'paused')   showPauseOverlay();
    else                         hidePauseOverlay();
    if (newState === 'gameOver') showGameoverOverlay(score);
    else                         hideGameoverOverlay();
}

export function handleInput(canvas, startGame, onPauseMenuSelect, shootFn) {

    // ── Teclado ──────────────────────────────────────────────
    document.addEventListener('keydown', (e) => {
        keys[e.code] = true;

        if (e.code === 'Escape') {
            if (gameState === 'playing') setGameState('paused');
            else if (gameState === 'paused') setGameState('playing');
        }
        if (gameState === 'paused') {
            if (e.code === 'ArrowUp')   selectedPauseOption = (selectedPauseOption - 1 + pauseMenuOptions.length) % pauseMenuOptions.length;
            if (e.code === 'ArrowDown') selectedPauseOption = (selectedPauseOption + 1) % pauseMenuOptions.length;
            if (e.code === 'Enter')     onPauseMenuSelect();
        } else if (e.code === 'Enter' && gameState === 'start') {
            startGame();
        }
    });

    document.addEventListener('keyup', (e) => { keys[e.code] = false; });

    canvas.addEventListener('click', () => {
        if (gameState === 'start') startGame();
    });

    // ── Botones overlay de pausa ─────────────────────────────
    function bindBtn(id, action) {
        const el = document.getElementById(id);
        if (!el) return;
        function activate(e) { e.preventDefault(); e.stopPropagation(); action(); }
        el.addEventListener('click',    activate);
        el.addEventListener('touchend', activate, { passive: false });
    }

    bindBtn('pause-continue', () => { selectedPauseOption = 0; onPauseMenuSelect(); });
    bindBtn('pause-restart',  () => { selectedPauseOption = 1; onPauseMenuSelect(); });
    bindBtn('pause-exit',     () => { selectedPauseOption = 2; onPauseMenuSelect(); });

    // ── Botones overlay de game over ─────────────────────────
    bindBtn('gameover-home',  () => { hideGameoverOverlay(); selectedGameOverOption = 0; _gameOverCallbacks.exit?.(); });
    bindBtn('gameover-retry', () => { hideGameoverOverlay(); selectedGameOverOption = 1; _gameOverCallbacks.retry?.(); });

    // ── Touch: D-Pad ─────────────────────────────────────────
    document.querySelectorAll('.dpad-btn').forEach(btn => {
        const key = btn.dataset.key;
        const press   = (e) => { e.preventDefault(); keys[key] = true;  btn.classList.add('pressed'); };
        const release = (e) => { e.preventDefault(); keys[key] = false; btn.classList.remove('pressed'); };
        btn.addEventListener('touchstart',  press,   { passive: false });
        btn.addEventListener('touchend',    release, { passive: false });
        btn.addEventListener('touchcancel', release, { passive: false });
    });

    // ── Touch: FIRE ──────────────────────────────────────────
    const btnShoot = document.getElementById('btn-shoot');
    if (btnShoot) {
        btnShoot.addEventListener('touchstart', (e) => {
            e.preventDefault();
            btnShoot.classList.add('pressed');
            if (gameState === 'playing' && shootFn) shootFn();
            else if (gameState === 'start') startGame();
        }, { passive: false });
        btnShoot.addEventListener('touchend', (e) => {
            e.preventDefault();
            btnShoot.classList.remove('pressed');
        }, { passive: false });
    }

    // ── Touch: PAUSA ─────────────────────────────────────────
    const btnPause = document.getElementById('btn-pause');
    if (btnPause) {
        function togglePause(e) {
            e.preventDefault();
            if (gameState === 'playing') setGameState('paused');
            else if (gameState === 'paused') setGameState('playing');
        }
        btnPause.addEventListener('touchstart', togglePause, { passive: false });
        btnPause.addEventListener('click',      togglePause);
    }

    // ── Touch: pantalla de inicio ─────────────────────────────
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameState === 'start') startGame();
    }, { passive: false });
}

// Callbacks para los botones de game over (se registran desde main.js)
const _gameOverCallbacks = { exit: null, retry: null };
export function registerGameOverCallbacks(exit, retry) {
    _gameOverCallbacks.exit  = exit;
    _gameOverCallbacks.retry = retry;
}

export function setupGameLoop(drawCallback) {
    function loop(ts) {
        drawCallback(ts);
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}

export function handlePauseMenuSelection(startGame, exitGame) {
    switch (selectedPauseOption) {
        case 0: setGameState('playing'); break;
        case 1: startGame(); break;
        case 2: exitGame(); break;
    }
}
