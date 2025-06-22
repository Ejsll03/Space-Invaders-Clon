export let gameState = 'start'; // 'start', 'playing', 'paused', 'gameOver'
export let keys = {};

export const pauseMenuOptions = ['Continuar', 'Reiniciar Nivel', 'Salir'];
export let selectedPauseOption = 0;

export const gameOverMenuOptions = ['Volver al inicio', 'Volver a jugar'];
export let selectedGameOverOption = 0;

export function handleInput(canvas, startGame, onPauseMenuSelect) {
    document.addEventListener('keydown', (e) => {
        keys[e.code] = true;

        if (e.code === 'Space' && gameState === 'playing') {
            // El disparo real se controla en main.js
        }

        if (e.code === 'Escape') {
            if (gameState === 'playing') {
                gameState = 'paused';
            } else if (gameState === 'paused') {
                gameState = 'playing';
            }
        }

        if (gameState === 'paused') {
            if (e.code === 'ArrowUp') {
                selectedPauseOption = (selectedPauseOption - 1 + pauseMenuOptions.length) % pauseMenuOptions.length;
            } else if (e.code === 'ArrowDown') {
                selectedPauseOption = (selectedPauseOption + 1) % pauseMenuOptions.length;
            } else if (e.code === 'Enter') {
                onPauseMenuSelect();
            }
        } else if (gameState === 'gameOver') {
            if (e.code === 'ArrowUp') {
                selectedGameOverOption = (selectedGameOverOption - 1 + gameOverMenuOptions.length) % gameOverMenuOptions.length;
            } else if (e.code === 'ArrowDown') {
                selectedGameOverOption = (selectedGameOverOption + 1) % gameOverMenuOptions.length;
            } else if (e.code === 'Enter') {
                // La acción se maneja en main.js
            }
        } else if (e.code === 'Enter' && gameState === 'start') {
            startGame();
        }
    });

    document.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    canvas.addEventListener('click', () => {
        if (gameState === 'start') {
            startGame();
        }
    });
}

export function setupGameLoop(drawCallback) {
    function gameLoop() {
        drawCallback(); // main.js proporciona qué hacer según el estado
        requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);
}

export function handlePauseMenuSelection(startGame, exitGame) {
    switch (selectedPauseOption) {
        case 0: // Continuar
            gameState = 'playing';
            break;
        case 1: // Reiniciar
            startGame();
            break;
        case 2: // Salir
            exitGame();
            break;
    }
}

export function setGameState(newState) {
    gameState = newState;
}
