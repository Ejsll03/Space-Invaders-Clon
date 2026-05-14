import { spriteImages } from './sprites.js';
import { activeEffects } from './powerups.js';

export let player = {
    x: 375, y: 530,
    width: 60, height: 60,
    speed: 5,
    lives: 3
};

export function initPlayer(canvasWidth = 800, canvasHeight = 600) {
    player.x = canvasWidth / 2 - player.width / 2;
    player.y = canvasHeight - 70;
    player.lives = 3;
    player.speed = 5;
    player.width  = 60;
    player.height = 60;
}

export function updatePlayer(keys, canvas, touchInput = null) {
    const inv = activeEffects.inverted_controls;   // DEBUFF: controles invertidos

    // Teclado (con inversión si aplica)
    if (keys['KeyA'] || keys['ArrowLeft'])  player.x += inv ? player.speed : -player.speed;
    if (keys['KeyD'] || keys['ArrowRight']) player.x += inv ? -player.speed : player.speed;
    if (keys['KeyW'] || keys['ArrowUp'])    player.y += inv ? player.speed : -player.speed;
    if (keys['KeyS'] || keys['ArrowDown'])  player.y += inv ? -player.speed : player.speed;

    // Joystick táctil (con inversión)
    if (touchInput) {
        const factor = inv ? -1 : 1;
        player.x += touchInput.dx * player.speed * factor;
        player.y += touchInput.dy * player.speed * factor;
    }

    // Clamp dentro del canvas
    player.x = Math.max(0, Math.min(canvas.width  - player.width,  player.x));
    player.y = Math.max(canvas.height * 0.65, Math.min(canvas.height - player.height, player.y));
}

export function drawPlayer(ctx) {
    ctx.save();

    // POWERUP: escudo — halo brillante alrededor de la nave
    if (activeEffects.shield) {
        const cx = player.x + player.width / 2;
        const cy = player.y + player.height / 2;
        const r  = player.width * 0.75;
        const grad = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r);
        grad.addColorStop(0,   'rgba(255,230,0,0.0)');
        grad.addColorStop(0.7, 'rgba(255,230,0,0.25)');
        grad.addColorStop(1,   'rgba(255,230,0,0.7)');
        ctx.fillStyle   = grad;
        ctx.shadowBlur  = 20;
        ctx.shadowColor = '#ffe600';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    // POWERUP: turbo — rastro de partículas verdes
    if (activeEffects.speed_boost) {
        ctx.shadowBlur  = 14;
        ctx.shadowColor = '#76ff03';
    }

    // DEBUFF: tiny_player — la nave ya está encogida (width/height cambiados),
    //   solo añadimos efecto visual de contorno rojo
    if (activeEffects.tiny_player) {
        ctx.strokeStyle = '#ff6d00';
        ctx.lineWidth   = 2;
        ctx.strokeRect(player.x - 2, player.y - 2, player.width + 4, player.height + 4);
    }

    // DEBUFF: controles invertidos — tinte morado sobre la nave
    if (activeEffects.inverted_controls) {
        ctx.filter = 'hue-rotate(200deg) saturate(2)';
    }

    ctx.drawImage(spriteImages.player, player.x, player.y, player.width, player.height);
    ctx.restore();
}
