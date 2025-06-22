import { player } from './player.js';
import { invaders, increaseInvaderSpeed } from './invaders.js';
import { boss, clearBoss, damageBoss } from './boss.js';
import { playerProjectiles, enemyProjectiles } from './projectiles.js';

export let score = 0;
export let scorePopups = [];

export function resetScore() {
    score = 0;
    scorePopups = [];
}

export function getScore() {
    return score;
}

export function getScorePopups() {
    return scorePopups;
}

function calculateScore(invaderY, topLimit, numRows) {
    const rowHeight = (topLimit - 50) / numRows;
    const rowIndex = Math.floor((invaderY - 50) / rowHeight);
    const points = (numRows - rowIndex) * 20;
    return points;
}

export function checkCollisions(level, topLimit, numRows, sounds, onPlayerDeath, onBossDefeated) {
    // Player projectiles vs invaders
    for (let i = playerProjectiles.length - 1; i >= 0; i--) {
        for (let j = invaders.length - 1; j >= 0; j--) {
            const p = playerProjectiles[i];
            const inv = invaders[j];
            if (p && inv && rectCollision(p, inv)) {
                const points = calculateScore(inv.y, topLimit, numRows);
                score += points;

                scorePopups.push({
                    x: inv.x + inv.width / 2,
                    y: inv.y,
                    value: `+${points}`,
                    opacity: 1,
                    dy: -0.5
                });

                invaders.splice(j, 1);
                playerProjectiles.splice(i, 1);

                if (invaders.length % 5 === 0 && invaders.length !== 0) {
                    increaseInvaderSpeed(1.05);
                }

                if (sounds?.kill_enemy) {
                    sounds.kill_enemy.currentTime = 0;
                    sounds.kill_enemy.play();
                }

                break;
            }
        }
    }

    // Player projectiles vs boss
    if (boss) {
        for (let i = playerProjectiles.length - 1; i >= 0; i--) {
            const p = playerProjectiles[i];
            if (rectCollision(p, boss)) {
                const dead = damageBoss(1);
                score += 50;
                playerProjectiles.splice(i, 1);

                if (dead) {
                    score += 1000 * level;
                    clearBoss();
                    if (sounds?.explosion) {
                        sounds.explosion.play();
                    }
                    onBossDefeated();
                }
                break;
            }
        }
    }

    // Enemy projectiles vs player
    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
        const p = enemyProjectiles[i];
        if (rectCollision(p, player)) {
            enemyProjectiles.splice(i, 1);
            if (sounds?.hit_player) sounds.hit_player.play();
            onPlayerDeath();
        }
    }

    // Invader or Boss touching player
    const threats = boss ? [boss, ...invaders] : invaders;
    for (let i = threats.length - 1; i >= 0; i--) {
        const e = threats[i];
        if (rectCollision(e, player)) {
            if (e !== boss) {
                invaders.splice(i, 1);
            }
            if (sounds?.hit_player) sounds.hit_player.play();
            onPlayerDeath();
            break;
        }
    }
}

export function rectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}
