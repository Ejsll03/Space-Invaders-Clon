import { setupAudio, sounds }                                         from './js/audio.js';
import { loadSprites }                                                 from './js/sprites.js';
import { initPlayer, updatePlayer, drawPlayer, player }               from './js/player.js';
import { initInvaders, updateInvaders, drawInvaders,
         invaders, invaderRows }                                       from './js/invaders.js';
import { createBoss, updateBoss, drawBoss, boss, clearBoss }          from './js/boss.js';
import { shoot, updateProjectiles, drawProjectiles,
         playerProjectiles, enemyProjectiles }                         from './js/projectiles.js';
import { checkCollisions, getScore, resetScore }                       from './js/collisions.js';
import { drawUI, drawPauseMenu, drawStartScreen,
         drawGameOverScreen, drawScorePopups }                         from './js/ui.js';
import { gameState as gameStateModule, setGameState, keys,
         pauseMenuOptions, selectedPauseOption,
         handleInput, handlePauseMenuSelection, setupGameLoop,
         gameOverMenuOptions, selectedGameOverOption,
         registerGameOverCallbacks }                                    from './js/gameState.js';
import { updatePowerups, drawPowerups, drawNotifications,
         drawActiveEffectsHUD, drawDarkOverlay,
         resetPowerups, activeEffects }                                 from './js/powerups.js';

// ══════════════════════════════════════════════════════════════
//  CANVAS RESPONSIVO
// ══════════════════════════════════════════════════════════════
const canvas  = document.getElementById('gameCanvas');
const ctx     = canvas.getContext('2d');
const BASE_W  = 800;
const BASE_H  = 600;

function resizeCanvas() {
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    const controlsEl    = document.getElementById('touch-controls');
    if (controlsEl) controlsEl.style.display = isTouchDevice ? 'flex' : 'none';

    const titleEl   = document.querySelector('h1');
    const titleH    = titleEl ? titleEl.getBoundingClientRect().height + 8 : 36;
    const controlsH = isTouchDevice ? (controlsEl?.offsetHeight ?? 160) : 0;

    const availW = window.innerWidth  - 8;
    const availH = window.innerHeight - titleH - controlsH - 16;

    const scale = Math.min(availW / BASE_W, availH / BASE_H, 1.35);
    canvas.width  = BASE_W;
    canvas.height = BASE_H;
    canvas.style.width  = Math.floor(BASE_W * scale) + 'px';
    canvas.style.height = Math.floor(BASE_H * scale) + 'px';
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 250));

// ══════════════════════════════════════════════════════════════
//  INICIALIZACIÓN
// ══════════════════════════════════════════════════════════════
let level = 1;

setupAudio();
loadSprites();
initPlayer(BASE_W, BASE_H);
initInvaders(BASE_W);
resetScore();
resetPowerups();

function enableHomeMusicOnce() {
    if (sounds.home.paused) {
        sounds.home.currentTime = 0;
        sounds.home.loop = true;
        sounds.home.play().catch(() => {});
    }
    window.removeEventListener('keydown',    enableHomeMusicOnce);
    window.removeEventListener('mousedown',  enableHomeMusicOnce);
    window.removeEventListener('touchstart', enableHomeMusicOnce);
}
window.addEventListener('keydown',    enableHomeMusicOnce);
window.addEventListener('mousedown',  enableHomeMusicOnce);
window.addEventListener('touchstart', enableHomeMusicOnce);

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameStateModule === 'playing') {
        e.preventDefault();
        shoot(player, sounds);
    }
    if (gameStateModule === 'gameOver' && e.code === 'Enter') {
        selectedGameOverOption === 0 ? exitGame() : startGame();
    }
});

// ══════════════════════════════════════════════════════════════
//  FUNCIONES DE JUEGO
// ══════════════════════════════════════════════════════════════
function startGame() {
    level = 1;
    initPlayer(BASE_W, BASE_H);
    initInvaders(BASE_W);
    clearBoss();
    resetScore();
    resetPowerups();
    playerProjectiles.length = 0;
    enemyProjectiles.length  = 0;
    setGameState('playing');
}

function advanceLevel() {
    level++;
    clearBoss();
    initInvaders(BASE_W);
    resetPowerups();
    playerProjectiles.length = 0;
    enemyProjectiles.length  = 0;
}

function onPlayerDeath() {
    player.lives--;
    player.x = BASE_W / 2 - player.width / 2;
    player.y = BASE_H - 70;
    if (player.lives <= 0) {
        sounds.gameover.play();
        setGameState('gameOver', getScore());
    }
}

function onBossDefeated() { advanceLevel(); }

function exitGame() {
    alert('¡Gracias por jugar!');
    location.reload();
}

// Screen shake
function applyShake() {
    if (!activeEffects.screen_shake) return;
    ctx.translate(
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5
    );
}

// ══════════════════════════════════════════════════════════════
//  BUCLE PRINCIPAL
// ══════════════════════════════════════════════════════════════
let lastTime = performance.now();

function drawGame(timestamp) {
    const deltaMs = Math.min(timestamp - lastTime, 50);
    lastTime = timestamp;

    ctx.save();
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    switch (gameStateModule) {

        case 'start':
            if (sounds.home.paused) {
                sounds.home.currentTime = 0;
                sounds.home.loop = true;
                sounds.home.play().catch(() => {});
            }
            drawStartScreen(ctx, canvas.width, canvas.height);
            break;

        case 'playing':
            if (!sounds.home.paused) sounds.home.pause();

            applyShake();

            // Updates
            updatePlayer(keys, canvas);
            updateProjectiles(canvas.height);
            updatePowerups(canvas.height, deltaMs);

            if (boss) {
                updateBoss(enemyProjectiles, canvas.width, level, sounds, deltaMs);
            } else {
                updateInvaders(enemyProjectiles, level, canvas.width, sounds);
            }

            checkCollisions(level, canvas.height * 0.65, invaderRows, sounds, onPlayerDeath, onBossDefeated);

            if (invaders.length === 0 && !boss) {
                createBoss(level, canvas.width);
                if (sounds.boss) sounds.boss.play();
            }

            // Draws
            drawInvaders(ctx);
            drawBoss(ctx);
            drawPowerups(ctx);
            drawProjectiles(ctx);
            drawPlayer(ctx);
            drawDarkOverlay(ctx, canvas.width, canvas.height);  // debuff oscuridad (encima de todo)
            drawUI(ctx, level, canvas.width);
            drawScorePopups(ctx);
            drawActiveEffectsHUD(ctx, canvas.width);
            drawNotifications(ctx, canvas.width, canvas.height);
            break;

        case 'paused':
            drawInvaders(ctx);
            drawBoss(ctx);
            drawPowerups(ctx);
            drawProjectiles(ctx);
            drawPlayer(ctx);
            drawUI(ctx, level, canvas.width);
            drawPauseMenu(ctx, canvas.width, canvas.height, pauseMenuOptions, selectedPauseOption);
            break;

        case 'gameOver':
            if (!sounds.home.paused) sounds.home.pause();
            drawGameOverScreen(ctx, canvas.width, canvas.height, gameOverMenuOptions, selectedGameOverOption);
            break;
    }

    ctx.restore();
}

handleInput(canvas, startGame, () => handlePauseMenuSelection(startGame, exitGame), () => shoot(player, sounds));
registerGameOverCallbacks(exitGame, startGame);
setupGameLoop(drawGame);
