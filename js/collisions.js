import { player }                              from './player.js';
import { invaders, increaseInvaderSpeed }      from './invaders.js';
import { boss, clearBoss, damageBoss }         from './boss.js';
import { playerProjectiles, enemyProjectiles } from './projectiles.js';
import { activeEffects, spawnPowerup,
         spawnBossDebuff }                     from './powerups.js';

export let score      = 0;
export let scorePopups = [];

export function resetScore()       { score = 0; scorePopups = []; }
export function getScore()         { return score; }
export function getScorePopups()   { return scorePopups; }

function calculateScore(invaderY, topLimit, numRows) {
    const rowHeight = (topLimit - 50) / numRows;
    const rowIndex  = Math.floor((invaderY - 50) / rowHeight);
    return (numRows - Math.max(0, rowIndex)) * 20;
}

export function checkCollisions(level, topLimit, numRows, sounds, onPlayerDeath, onBossDefeated) {

    // ── Bomba: destruye todos los enemigos en pantalla ──────
    if (activeEffects.bomb) {
        activeEffects.bomb = false;

        // Destruir todos los invasores
        while (invaders.length > 0) {
            const inv = invaders[invaders.length - 1];
            const pts = calculateScore(inv.y, topLimit, numRows);
            score += pts;
            scorePopups.push({ x: inv.x + inv.width / 2, y: inv.y, value: `+${pts}`, opacity: 1, dy: -0.8 });
            invaders.pop();
        }

        // Dañar boss si existe
        if (boss) {
            const halfHp = Math.floor(boss.maxHp / 2);
            for (let i = 0; i < halfHp; i++) damageBoss(1);
            score += 500 * level;
            scorePopups.push({ x: boss.x + boss.width / 2, y: boss.y, value: `BOMBA! +${500 * level}`, opacity: 1, dy: -1 });
        }

        if (sounds?.explosion) sounds.explosion.play();
        return;
    }

    // ── Proyectiles del jugador vs invasores ────────────────
    for (let i = playerProjectiles.length - 1; i >= 0; i--) {
        for (let j = invaders.length - 1; j >= 0; j--) {
            const p   = playerProjectiles[i];
            const inv = invaders[j];
            if (!p || !inv) continue;
            if (rectCollision(p, inv)) {
                const pts = calculateScore(inv.y, topLimit, numRows);
                score += pts;
                scorePopups.push({
                    x: inv.x + inv.width / 2, y: inv.y,
                    value: `+${pts}`, opacity: 1, dy: -0.5
                });

                // Drop: 25% powerup/debuff mezclado, 10% solo debuff
                const rand = Math.random();
                if (rand < 0.04) {
                    spawnPowerup(inv.x + inv.width / 2, inv.y + inv.height, 'debuff');
                } else if (rand < 0.10) {
                    spawnPowerup(inv.x + inv.width / 2, inv.y + inv.height);
                }

                invaders.splice(j, 1);
                playerProjectiles.splice(i, 1);

                if (invaders.length % 5 === 0 && invaders.length > 0) {
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

    // ── Proyectiles del jugador vs boss ─────────────────────
    if (boss) {
        for (let i = playerProjectiles.length - 1; i >= 0; i--) {
            const p = playerProjectiles[i];
            if (!p) continue;
            if (rectCollision(p, boss)) {
                const dead = damageBoss(1);
                score += 50;
                playerProjectiles.splice(i, 1);

                // Al 50% de vida del boss: lanza un debuff garantizado
                const hpRatio = boss.hp / boss.maxHp;
                const rand = Math.random();
                if (hpRatio < 0.5 && rand < 0.12) {
                    spawnBossDebuff(boss.x + boss.width / 2, boss.y + boss.height);
                } else if (rand < 0.15) {
                    spawnPowerup(boss.x + boss.width / 2, boss.y + boss.height);
                }

                if (dead) {
                    score += 1000 * level;
                    scorePopups.push({
                        x: boss.x + boss.width / 2, y: boss.y,
                        value: `BOSS! +${1000 * level}`, opacity: 1, dy: -1
                    });
                    clearBoss();
                    if (sounds?.explosion) sounds.explosion.play();
                    onBossDefeated();
                }
                break;
            }
        }
    }

    // ── Proyectiles enemigos vs jugador ─────────────────────
    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
        const p = enemyProjectiles[i];
        if (!rectCollision(p, player)) continue;

        if (activeEffects.shield) {
            enemyProjectiles.splice(i, 1);  // escudo absorbe
            continue;
        }
        enemyProjectiles.splice(i, 1);
        if (sounds?.hit_player) sounds.hit_player.play();
        onPlayerDeath();
    }

    // ── Invasor / Boss toca al jugador ───────────────────────
    const threats = boss ? [boss, ...invaders] : invaders;
    for (let i = threats.length - 1; i >= 0; i--) {
        const e = threats[i];
        if (!rectCollision(e, player)) continue;

        if (activeEffects.shield) break;

        if (e !== boss) invaders.splice(i, 1);
        if (sounds?.hit_player) sounds.hit_player.play();
        onPlayerDeath();
        break;
    }
}

export function rectCollision(a, b) {
    return a.x < b.x + b.width  &&
           a.x + a.width  > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}
