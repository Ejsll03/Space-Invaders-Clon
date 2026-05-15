export let gameState = 'start';
export let keys = {};

export const pauseMenuOptions = ['Continuar', 'Reiniciar Nivel', 'Salir'];
export let selectedPauseOption = 0;

export const gameOverMenuOptions = ['Volver al inicio', 'Volver a jugar'];
export let selectedGameOverOption = 0;

// ── Overlay HTML de pausa ─────────────────────────────────────
const pauseOverlay = document.getElementById('pause-overlay');
function showPauseOverlay() { if (pauseOverlay) pauseOverlay.classList.add('visible'); }
function hidePauseOverlay() { if (pauseOverlay) pauseOverlay.classList.remove('visible'); }

export function setGameState(newState) {
    gameState = newState;
    if (newState === 'paused') showPauseOverlay();
    else hidePauseOverlay();
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
        } else if (gameState === 'gameOver') {
            if (e.code === 'ArrowUp')   selectedGameOverOption = (selectedGameOverOption - 1 + gameOverMenuOptions.length) % gameOverMenuOptions.length;
            if (e.code === 'ArrowDown') selectedGameOverOption = (selectedGameOverOption + 1) % gameOverMenuOptions.length;
        } else if (e.code === 'Enter' && gameState === 'start') {
            startGame();
        }
    });

    document.addEventListener('keyup', (e) => { keys[e.code] = false; });

    canvas.addEventListener('click', () => {
        if (gameState === 'start') startGame();
    });

    // ── Botones HTML del overlay de pausa ────────────────────
    // Funcionan tanto en desktop (click) como en móvil (touchend)
    function bindPauseBtn(id, optionIndex) {
        const el = document.getElementById(id);
        if (!el) return;
        function activate(e) {
            e.preventDefault();
            e.stopPropagation();
            selectedPauseOption = optionIndex;
            onPauseMenuSelect();
        }
        el.addEventListener('click',    activate);
        el.addEventListener('touchend', activate, { passive: false });
    }

    bindPauseBtn('pause-continue', 0);
    bindPauseBtn('pause-restart',  1);
    bindPauseBtn('pause-exit',     2);

    // ── Touch: D-Pad ─────────────────────────────────────────
    const dpadBtns = document.querySelectorAll('.dpad-btn');
    dpadBtns.forEach(btn => {
        const key = btn.dataset.key;
        const press   = (e) => { e.preventDefault(); keys[key] = true;  btn.classList.add('pressed'); };
        const release = (e) => { e.preventDefault(); keys[key] = false; btn.classList.remove('pressed'); };
        btn.addEventListener('touchstart',  press,   { passive: false });
        btn.addEventListener('touchend',    release, { passive: false });
        btn.addEventListener('touchcancel', release, { passive: false });
    });

    // ── Touch: Botón FIRE ────────────────────────────────────
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

    // ── Touch: Botón PAUSA (abre overlay) ────────────────────
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

    // ── Touch: pantalla de inicio / game over ─────────────────
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameState === 'start') startGame();
        else if (gameState === 'gameOver') selectedGameOverOption = 1;
    }, { passive: false });
}

export function setupGameLoop(drawCallback) {
    let last = performance.now();
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
