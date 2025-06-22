import { spriteImages } from './sprites.js';

export let boss = null;

export function createBoss(level, canvasWidth, offsetTop = 50) {
    boss = {
        x: canvasWidth / 2 - 50,
        y: offsetTop,
        width: 100,
        height: 80,
        hp: 15 * level,
        maxHp: 15 * level,
        dx: 2 + level,
        shootCooldown: 2000,
        lastShot: Date.now()
    };
}

export function updateBoss(enemyProjectiles, canvasWidth, level, sounds) {
    if (!boss) return;

    boss.x += boss.dx;
    if (boss.x <= 0 || boss.x + boss.width >= canvasWidth) {
        boss.dx *= -1;
    }

    if (Date.now() - boss.lastShot > boss.shootCooldown - level * 100) {
        for (let i = -1; i <= 1; i++) {
            enemyProjectiles.push({
                x: boss.x + boss.width / 2 + (i * 20),
                y: boss.y + boss.height,
                width: 8,
                height: 20,
                color: '#f0f'
            });
        }
        if (sounds?.shoot_boss) {
            sounds.shoot_boss.currentTime = 0;
            sounds.shoot_boss.play();
        }
        boss.lastShot = Date.now();
    }
}

export function drawBoss(ctx) {
    if (!boss) return;

    ctx.drawImage(spriteImages.boss, boss.x, boss.y, boss.width, boss.height);

    const healthBarWidth = boss.width;
    const healthBarHeight = 10;
    const healthPercentage = boss.hp / boss.maxHp;

    ctx.fillStyle = '#ff0000';
    ctx.fillRect(boss.x, boss.y - 20, healthBarWidth, healthBarHeight);

    ctx.fillStyle = '#00ff00';
    ctx.fillRect(boss.x, boss.y - 20, healthBarWidth * healthPercentage, healthBarHeight);
}

export function damageBoss(amount) {
    if (!boss) return false;
    boss.hp -= amount;
    return boss.hp <= 0;
}

export function clearBoss() {
    boss = null;
}
