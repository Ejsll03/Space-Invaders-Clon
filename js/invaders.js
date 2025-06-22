import { spriteImages } from './sprites.js';

export let invaders = [];
export const invaderCols = 10;
export const invaderRows = 5;
export const invaderWidth = 40;
export const invaderHeight = 40;
export const invaderPadding = 15;
export const invaderOffsetTop = 50;
export const invaderOffsetLeft = 60;

let invaderSpeed = 0.5;
let invaderDirection = 1;
const invaderShootChance = 0.0015;

export function initInvaders() {
    invaders = [];
    invaderSpeed = 0.5;
    invaderDirection = 1;

    for (let c = 0; c < invaderCols; c++) {
        for (let r = 0; r < invaderRows; r++) {
            invaders.push({
                x: c * (invaderWidth + invaderPadding) + invaderOffsetLeft,
                y: r * (invaderHeight + invaderPadding) + invaderOffsetTop,
                width: invaderWidth,
                height: invaderHeight,
                row: r // para saber qué sprite usar
            });
        }
    }
}

export function updateInvaders(enemyProjectiles, level, canvasWidth, sounds) {
    let moveDown = false;

    for (const inv of invaders) {
        inv.x += invaderSpeed * invaderDirection;

        if (inv.x + inv.width > canvasWidth || inv.x < 0) {
            moveDown = true;
        }

        if (level > 1 && Math.random() < invaderShootChance) {
            enemyProjectiles.push({
                x: inv.x + inv.width / 2,
                y: inv.y + inv.height,
                width: 5, height: 15, color: '#ff4141'
            });
            if (sounds?.shoot_enemy) {
                sounds.shoot_enemy.currentTime = 0;
                sounds.shoot_enemy.play();
            }
        }
    }

    if (moveDown) {
        invaderDirection *= -1;
        for (const inv of invaders) {
            inv.y += invaderHeight;
        }
    }
}

export function drawInvaders(ctx) {
    invaders.forEach(inv => {
        const sprite = spriteImages[`invader${inv.row + 1}`]; // invader1 a invader5
        if (sprite) {
            ctx.drawImage(sprite, inv.x, inv.y, inv.width, inv.height);
        }
    });
}


export function getInvaderSpeed() {
    return invaderSpeed;
}

export function increaseInvaderSpeed(factor) {
    invaderSpeed *= factor;
}
