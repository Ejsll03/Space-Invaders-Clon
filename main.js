import { setupAudio, sounds } from './js/audio.js';
import { loadSprites } from './js/sprites.js';
import { initPlayer, updatePlayer, drawPlayer, player } from './js/player.js';
import { initInvaders, updateInvaders, drawInvaders, invaders, invaderRows, invaderOffsetTop } from './js/invaders.js';
import { createBoss, updateBoss, drawBoss, boss, clearBoss } from './js/boss.js';
import { shoot, updateProjectiles, drawProjectiles, playerProjectiles, enemyProjectiles } from './js/projectiles.js';
import { checkCollisions, getScore, resetScore, getScorePopups } from './js/collisions.js';
import { drawUI, drawPauseMenu, drawStartScreen, drawGameOverScreen, drawScorePopups, drawGameOverMenu } from './js/ui.js';
import { gameState as gameStateModule, setGameState, keys, pauseMenuOptions, selectedPauseOption, handleInput, handlePauseMenuSelection, setupGameLoop, gameOverMenuOptions, selectedGameOverOption } from './js/gameState.js';

// === Configuración Inicial ===
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let level = 1;

// === Inicializar sistemas ===
setupAudio();
loadSprites();
initPlayer();
initInvaders();
resetScore();

// Reproducir la música de inicio tras la primera interacción del usuario
function enableHomeMusicOnce() {
    if (sounds.home.paused) {
        sounds.home.currentTime = 0;
        sounds.home.loop = true;
        sounds.home.play();
    }
    // Elimina el listener después de la primera interacción
    window.removeEventListener('keydown', enableHomeMusicOnce);
    window.removeEventListener('mousedown', enableHomeMusicOnce);
}

// Escucha la primera interacción del usuario
window.addEventListener('keydown', enableHomeMusicOnce);
window.addEventListener('mousedown', enableHomeMusicOnce);

// Permitir disparar con barra espaciadora cuando el juego está en 'playing'
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameStateModule === 'playing') {
        shoot(player, sounds);
    }
    if (gameStateModule === 'gameOver' && e.code === 'Enter') {
        if (selectedGameOverOption === 0) {
            exitGame(); // Cambiado para llamar a exitGame() directamente
        } else if (selectedGameOverOption === 1) {
            startGame();
        }
    }
});

// === Funciones de juego ===
function startGame() {
    level = 1;
    initPlayer();
    initInvaders();
    clearBoss();
    resetScore();
    playerProjectiles.length = 0;
    enemyProjectiles.length = 0;
    setGameState('playing');
}

function advanceLevel() {
    level++;
    clearBoss();
    initInvaders();
}

function onPlayerDeath() {
    player.lives--;
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 70;

    if (player.lives <= 0) {
        sounds.gameover.play();
        setGameState('gameOver');
    }
}

function onBossDefeated() {
    advanceLevel();
}

function exitGame() {
    alert('Has salido del juego. ¡Gracias por jugar!');
    location.reload();
}

// === Dibujo y actualización por estado ===
function drawGame() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    switch (gameStateModule) {
        case 'start':
            if (sounds.home.paused) {
                sounds.home.currentTime = 0;
                sounds.home.loop = true;
                sounds.home.play();
            }
            drawStartScreen(ctx, canvas.width, canvas.height);
            break;

        case 'playing':
            if (!sounds.home.paused) {
                sounds.home.pause();
            }
            updatePlayer(keys, canvas);
            updateProjectiles(canvas.height);

            if (boss) {
                updateBoss(enemyProjectiles, canvas.width, level, sounds);
            } else {
                updateInvaders(enemyProjectiles, level, canvas.width, sounds);
            }

            checkCollisions(level, canvas.height * 0.65, invaderRows, sounds, onPlayerDeath, onBossDefeated);

            if (invaders.length === 0 && !boss) {
                createBoss(level, canvas.width);
                if (sounds.boss) sounds.boss.play();
            }

            drawPlayer(ctx);
            drawProjectiles(ctx);
            drawInvaders(ctx);
            drawBoss(ctx);
            drawUI(ctx, level, canvas.width);
            drawScorePopups(ctx);
            break;

        case 'paused':
            drawPlayer(ctx);
            drawProjectiles(ctx);
            drawInvaders(ctx);
            drawBoss(ctx);
            drawUI(ctx, level, canvas.width);
            drawPauseMenu(ctx, canvas.width, canvas.height, pauseMenuOptions, selectedPauseOption);
            break;

        case 'gameOver':
            if (!sounds.home.paused) {
                sounds.home.pause();
            }
            drawGameOverScreen(ctx, canvas.width, canvas.height, gameOverMenuOptions, selectedGameOverOption);
            break;
    }
}

// === Iniciar ciclo principal ===
handleInput(canvas, startGame, () => handlePauseMenuSelection(startGame, exitGame));

setupGameLoop(drawGame);
