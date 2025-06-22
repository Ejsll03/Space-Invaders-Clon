import { spriteImages } from './sprites.js';

export let player = {
    x: 375, y: 530,
    width: 60, height: 60,
    speed: 5,
    lives: 3
};

export function initPlayer() {
    player.x = 375;
    player.y = 530;
    player.lives = 3;
}

export function updatePlayer(keys, canvas) {
    if (keys['KeyA'] && player.x > 0) player.x -= player.speed;
    if (keys['KeyD'] && player.x < canvas.width - player.width) player.x += player.speed;
    if (keys['KeyW'] && player.y > canvas.height * 0.65) player.y -= player.speed;
    if (keys['KeyS'] && player.y < canvas.height - player.height) player.y += player.speed;
}

export function drawPlayer(ctx) {
    ctx.drawImage(spriteImages.player, player.x, player.y, player.width, player.height);
}
