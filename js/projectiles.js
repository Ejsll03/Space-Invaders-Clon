import { activeEffects } from './powerups.js';

export let playerProjectiles = [];
export let enemyProjectiles = [];

const projectileSpeed = 7;
let canShoot = true;
let shootCooldown = 300;
let rapidFireTimeout = null;

export function shoot(player, sounds) {
    if (!canShoot) return;
    if (activeEffects.blocked_shot) return;   // DEBUFF: sin disparos

    const rapid = activeEffects.rapid_fire;
    const triple = activeEffects.triple_shot;

    // Disparo central
    playerProjectiles.push({
        x: player.x + player.width / 2 - 2.5,
        y: player.y,
        width: 5, height: 20,
        color: triple ? '#00e5ff' : '#3f3'
    });

    // Triple disparo
    if (triple) {
        playerProjectiles.push({
            x: player.x + player.width / 2 - 16,
            y: player.y + 8,
            width: 4, height: 18,
            color: '#00e5ff',
            vx: -1.2   // ligera desviación izquierda
        });
        playerProjectiles.push({
            x: player.x + player.width / 2 + 10,
            y: player.y + 8,
            width: 4, height: 18,
            color: '#00e5ff',
            vx: 1.2    // ligera desviación derecha
        });
    }

    if (sounds?.shoot_player) {
        sounds.shoot_player.currentTime = 0;
        sounds.shoot_player.play();
    }

    canShoot = false;
    const cooldown = rapid ? 100 : shootCooldown;
    setTimeout(() => canShoot = true, cooldown);
}

export function updateProjectiles(canvasHeight) {
    for (let i = playerProjectiles.length - 1; i >= 0; i--) {
        const p = playerProjectiles[i];
        p.y -= projectileSpeed;
        if (p.vx) p.x += p.vx;   // desviación lateral (triple disparo)
        if (p.y < 0 || p.x < 0 || p.x > 900) {
            playerProjectiles.splice(i, 1);
        }
    }

    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
        enemyProjectiles[i].y += projectileSpeed / 2;
        if (enemyProjectiles[i].y > canvasHeight) {
            enemyProjectiles.splice(i, 1);
        }
    }
}

export function drawProjectiles(ctx) {
    const allProjectiles = [...playerProjectiles, ...enemyProjectiles];
    allProjectiles.forEach(p => {
        ctx.fillStyle  = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fillRect(p.x, p.y, p.width, p.height);
    });
    ctx.shadowBlur = 0;
}
