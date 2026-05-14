export let gameState = 'start';
export let keys = {};

export const pauseMenuOptions = ['Continuar', 'Reiniciar Nivel', 'Salir'];
export let selectedPauseOption = 0;

export const gameOverMenuOptions = ['Volver al inicio', 'Volver a jugar'];
export let selectedGameOverOption = 0;

export function handleInput(canvas, startGame, onPauseMenuSelect, shootFn) {
    // ── Teclado ──
    document.addEventListener('keydown', (e) => {
        keys[e.code] = true;

        if (e.code === 'Escape') {
            if (gameState === 'playing') gameState = 'paused';
            else if (gameState === 'paused') gameState = 'playing';
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

    // ── Touch: D-Pad ──
    const dpadBtns = document.querySelectorAll('.dpad-btn');
    dpadBtns.forEach(btn => {
        const key = btn.dataset.key;
        const press = (e) => { e.preventDefault(); keys[key] = true; btn.classList.add('pressed'); };
        const release = (e) => { e.preventDefault(); keys[key] = false; btn.classList.remove('pressed'); };
        btn.addEventListener('touchstart', press, { passive: false });
        btn.addEventListener('touchend',   release, { passive: false });
        btn.addEventListener('touchcancel',release, { passive: false });
    });

    // ── Touch: Shoot ──
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

    // ── Touch: Pause ──
    const btnPause = document.getElementById('btn-pause');
    if (btnPause) {
        btnPause.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (gameState === 'playing') gameState = 'paused';
            else if (gameState === 'paused') gameState = 'playing';
        }, { passive: false });
    }

    // Touch en pantalla de start / gameOver
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameState === 'start') startGame();
        else if (gameState === 'gameOver') {
            selectedGameOverOption = 1; // Volver a jugar
        }
    }, { passive: false });
}

export function setupGameLoop(drawCallback) {
    function gameLoop() {
        drawCallback();
        requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);
}

export function handlePauseMenuSelection(startGame, exitGame) {
    switch (selectedPauseOption) {
        case 0: gameState = 'playing'; break;
        case 1: startGame(); break;
        case 2: exitGame(); break;
    }
}

export function setGameState(newState) { gameState = newState; }
