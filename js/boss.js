import { spriteImages } from './sprites.js';

export let boss = null;

// ── Fases / comportamientos del jefe ─────────────────────────────────────────
const BOSS_PHASES = [
    {
        name: 'linear',         // izq-der clásico
        update: (boss, canvasWidth, tick) => {
            boss.x += boss.dx;
            if (boss.x <= 0 || boss.x + boss.width >= canvasWidth) boss.dx *= -1;
        },
        shootPattern: 'triple'
    },
    {
        name: 'sineWave',       // ondulado
        update: (boss, canvasWidth, tick) => {
            boss.x += boss.dx;
            if (boss.x <= 0 || boss.x + boss.width >= canvasWidth) boss.dx *= -1;
            boss.y = boss.baseY + Math.sin(tick * 0.04) * 40;
        },
        shootPattern: 'spread'
    },
    {
        name: 'figure8',        // figura de 8 horizontal
        update: (boss, canvasWidth, tick) => {
            const t = tick * 0.025;
            const cx = canvasWidth / 2 - boss.width / 2;
            const rx = canvasWidth * 0.35;
            const ry = 55;
            boss.x = cx + rx * Math.sin(t);
            boss.y = boss.baseY + ry * Math.sin(t * 2);
        },
        shootPattern: 'aimed'
    },
    {
        name: 'dash',           // se queda quieto, luego hace dash
        _dashTimer: 0,
        _dashing: false,
        _dashDir: 1,
        update: (boss, canvasWidth, tick, dt) => {
            const ph = BOSS_PHASES[3];
            ph._dashTimer += dt || 16;
            if (!ph._dashing) {
                // Pausa antes del dash
                if (ph._dashTimer > 1800) {
                    ph._dashing = true;
                    ph._dashDir = Math.random() < 0.5 ? -1 : 1;
                    ph._dashTimer = 0;
                }
            } else {
                boss.x += boss.dx * 3.5 * ph._dashDir;
                if (boss.x <= 0 || boss.x + boss.width >= canvasWidth) {
                    ph._dashing = false;
                    ph._dashDir *= -1;
                    ph._dashTimer = 0;
                    boss.x = Math.max(0, Math.min(boss.x, canvasWidth - boss.width));
                }
                if (ph._dashTimer > 400) {
                    ph._dashing = false;
                    ph._dashTimer = 0;
                }
            }
        },
        shootPattern: 'burst'
    }
];

let bossPhase = 0;
let bossTick = 0;
let bossPhaseTimer = 0;
const PHASE_DURATION = 8000; // ms entre cambios de fase
let lastDt = 16;

export function createBoss(level, canvasWidth) {
    const w = Math.min(100, canvasWidth * 0.13);
    const h = Math.floor(w * 0.8);
    bossPhase = 0;
    bossTick = 0;
    bossPhaseTimer = Date.now();
    // Reset dash state
    BOSS_PHASES[3]._dashTimer = 0;
    BOSS_PHASES[3]._dashing = false;

    // Nivel 1: 900ms. Cada nivel baja 80ms (mínimo 400ms)
    const baseCooldown = Math.max(400, 900 - (level - 1) * 80);

    boss = {
        x: canvasWidth / 2 - w / 2,
        y: 50,
        baseY: 50,
        width: w,
        height: h,
        hp: 15 * level,
        maxHp: 15 * level,
        dx: 2 + level * 0.8,
        shootCooldown: baseCooldown,
        lastShot: Date.now(),
        playerX: canvasWidth / 2,
        playerY: 500
    };
}

export function updateBoss(enemyProjectiles, canvasWidth, level, sounds, playerRef) {
    if (!boss) return;

    // ── Cambio de fase ──
    if (Date.now() - bossPhaseTimer > PHASE_DURATION) {
        let next;
        do { next = Math.floor(Math.random() * BOSS_PHASES.length); }
        while (next === bossPhase);
        bossPhase = next;
        bossTick = 0;
        bossPhaseTimer = Date.now();
        boss.baseY = boss.y; // ancla la Y actual como base para la nueva fase
        BOSS_PHASES[3]._dashTimer = 0;
        BOSS_PHASES[3]._dashing = false;
    }

    bossTick++;
    if (playerRef) {
        boss.playerX = playerRef.x + playerRef.width / 2;
        boss.playerY = playerRef.y;
    }

    const phase = BOSS_PHASES[bossPhase];
    phase.update(boss, canvasWidth, bossTick, lastDt);

    // ── Disparo según patrón de la fase ──
    // Cooldown ya calculado en createBoss según nivel
    if (Date.now() - boss.lastShot > boss.shootCooldown) {
        _bossShoot(phase.shootPattern, enemyProjectiles, canvasWidth, level);
        if (sounds?.shoot_boss) {
            sounds.shoot_boss.currentTime = 0;
            sounds.shoot_boss.play();
        }
        boss.lastShot = Date.now();
    }
}

function _bossShoot(pattern, enemyProjectiles, canvasWidth, level) {
    if (!boss) return;
    const bx = boss.x + boss.width / 2;
    const by = boss.y + boss.height;
    const speed = 3 + level * 0.3;

    // Vector dirigido al jugador (usado en todos los patrones)
    const dx   = boss.playerX - bx;
    const dy   = boss.playerY - by;
    const dist = Math.hypot(dx, dy) || 1;
    const ax   = (dx / dist) * speed * 1.15;
    const ay   = (dy / dist) * speed * 1.15;

    switch (pattern) {
        case 'triple':
            // 1 dirigido al jugador + 2 rectos ligeramente desplazados
            enemyProjectiles.push({ x: bx,      y: by, width: 7, height: 18, color: '#f0f', vy: ay,    vx: ax });
            enemyProjectiles.push({ x: bx - 22, y: by, width: 6, height: 16, color: '#f0f', vy: speed, vx: 0  });
            enemyProjectiles.push({ x: bx + 22, y: by, width: 6, height: 16, color: '#f0f', vy: speed, vx: 0  });
            break;

        case 'spread':
            // Central dirigido + abanico simétrico
            enemyProjectiles.push({ x: bx, y: by, width: 7, height: 18, color: '#ff0', vy: ay, vx: ax });
            for (let i = -2; i <= 2; i++) {
                if (i === 0) continue;
                const angle = (i / 2) * 0.38;
                enemyProjectiles.push({ x: bx, y: by, width: 5, height: 14, color: '#f8f', vy: speed * Math.cos(angle), vx: speed * Math.sin(angle) });
            }
            break;

        case 'aimed':
            // Tres disparos dirigidos en abanico estrecho hacia el jugador
            for (let i = -1; i <= 1; i++) {
                const spread = i * 0.18;
                const nx = Math.cos(spread) * ax - Math.sin(spread) * ay;
                const ny = Math.sin(spread) * ax + Math.cos(spread) * ay;
                enemyProjectiles.push({ x: bx + i * 14, y: by, width: 7, height: 18, color: '#ff0', vy: ny, vx: nx });
            }
            break;

        case 'burst':
            // 1 dirigido + ráfaga en abanico
            enemyProjectiles.push({ x: bx, y: by, width: 8, height: 20, color: '#ff0', vy: ay, vx: ax });
            for (let i = 0; i < 5; i++) {
                const angle = ((i / 4) - 0.5) * Math.PI * 0.65;
                enemyProjectiles.push({ x: bx, y: by, width: 5, height: 13, color: '#f44', vy: speed * Math.cos(angle), vx: speed * Math.sin(angle) });
            }
            break;
    }
}

export function drawBoss(ctx) {
    if (!boss) return;

    ctx.drawImage(spriteImages.boss, boss.x, boss.y, boss.width, boss.height);

    // Barra de vida
    const bw = boss.width;
    const bh = 10;
    const pct = boss.hp / boss.maxHp;

    ctx.fillStyle = '#ff0000';
    ctx.fillRect(boss.x, boss.y - 18, bw, bh);
    ctx.fillStyle = pct > 0.5 ? '#00ff00' : pct > 0.25 ? '#ffaa00' : '#ff3300';
    ctx.fillRect(boss.x, boss.y - 18, bw * pct, bh);

    // Indicador de fase (pequeño)
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '10px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(BOSS_PHASES[bossPhase].name, boss.x + boss.width / 2, boss.y - 22);
}

export function damageBoss(amount) {
    if (!boss) return false;
    boss.hp -= amount;
    return boss.hp <= 0;
}

export function clearBoss() { boss = null; }

export function getBossPhaseName() {
    return BOSS_PHASES[bossPhase]?.name || '';
}
