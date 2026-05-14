import { spriteImages } from './sprites.js';

export let invaders = [];
export const invaderCols = 10;
export const invaderRows = 5;
export const invaderOffsetTop = 50;

// Dimensiones base (se escalan con canvas)
export let invaderWidth = 40;
export let invaderHeight = 40;
export let invaderPadding = 15;
export let invaderOffsetLeft = 60;

let invaderSpeed = 0.5;
let invaderDirection = 1;
const invaderShootChance = 0.0015;

// ── Patrones de movimiento dinámico ──────────────────────────────────────────
// Cada patrón tiene: nombre, función que modifica el estado de los invaders en update
const MOVEMENT_PATTERNS = [
    {
        name: 'classic',       // movimiento clásico horizontal
        update: null           // null = usa lógica por defecto
    },
    {
        name: 'wave',          // movimiento ondulado vertical
        update: (inv, tick) => {
            inv.x += invaderSpeed * invaderDirection;
            inv.y = inv.baseY + Math.sin((tick * 0.05) + inv.waveOffset) * 18;
        }
    },
    {
        name: 'zigzag',        // zigzag más pronunciado que classic
        update: (inv, tick) => {
            inv.x += invaderSpeed * invaderDirection * 1.3;
            inv.y = inv.baseY + Math.sin((tick * 0.08) + inv.waveOffset) * 28;
        }
    },
    {
        name: 'dive',          // columnas se adelantan ciclicamente
        update: (inv, tick) => {
            inv.x += invaderSpeed * invaderDirection;
            const colPhase = (inv.col * 0.6 + tick * 0.04) % (Math.PI * 2);
            inv.y = inv.baseY + Math.max(0, Math.sin(colPhase)) * 40;
        }
    },
    {
        name: 'orbit',         // rotación lenta alrededor del centro de la formación
        update: (inv, tick, centerX, centerY) => {
            const angle = tick * 0.02 + inv.orbitOffset;
            const rx = inv.orbitRadiusX;
            const ry = inv.orbitRadiusY;
            inv.x = centerX + rx * Math.cos(angle) - invaderWidth / 2;
            inv.y = centerY + ry * Math.sin(angle) - invaderHeight / 2;
        }
    }
];

let currentPattern = 0;
let patternTick = 0;
let patternTimer = 0;
const PATTERN_DURATION = 7000; // ms entre cambios de patrón

export function initInvaders(canvasWidth) {
    invaders = [];
    invaderSpeed = 0.5;
    invaderDirection = 1;
    currentPattern = 0;
    patternTick = 0;
    patternTimer = Date.now();

    // Escalar tamaño según canvas
    if (canvasWidth) {
        const scale = Math.min(1, canvasWidth / 800);
        invaderWidth  = Math.floor(40 * scale);
        invaderHeight = Math.floor(40 * scale);
        invaderPadding = Math.floor(15 * scale);
        invaderOffsetLeft = Math.floor(60 * scale);
    }

    const totalWidth = invaderCols * (invaderWidth + invaderPadding) - invaderPadding;
    const startX = canvasWidth ? (canvasWidth - totalWidth) / 2 : invaderOffsetLeft;

    for (let c = 0; c < invaderCols; c++) {
        for (let r = 0; r < invaderRows; r++) {
            const baseX = startX + c * (invaderWidth + invaderPadding);
            const baseY = r * (invaderHeight + invaderPadding) + invaderOffsetTop;
            invaders.push({
                x: baseX,
                y: baseY,
                baseX,
                baseY,
                width: invaderWidth,
                height: invaderHeight,
                row: r,
                col: c,
                waveOffset: c * 0.5 + r * 0.3,
                orbitOffset: (c / invaderCols) * Math.PI * 2 + (r / invaderRows) * 0.5,
                orbitRadiusX: 0,
                orbitRadiusY: 0
            });
        }
    }

    // Precalcular radios de órbita para el patrón orbit
    _recalcOrbitRadii(canvasWidth);
}

function _recalcOrbitRadii(canvasWidth) {
    if (!invaders.length) return;
    const cx = (canvasWidth || 800) / 2;
    const cy = invaderOffsetTop + (invaderRows * (invaderHeight + invaderPadding)) / 2;
    invaders.forEach(inv => {
        inv.orbitRadiusX = Math.abs(inv.baseX - cx) + invaderWidth / 2;
        inv.orbitRadiusY = Math.abs(inv.baseY - cy) + invaderHeight / 2;
        inv._orbitCX = cx;
        inv._orbitCY = cy;
    });
}

function selectNextPattern() {
    // Evita repetir el mismo patrón dos veces seguidas
    let next;
    do { next = Math.floor(Math.random() * MOVEMENT_PATTERNS.length); }
    while (next === currentPattern);
    currentPattern = next;
    patternTick = 0;

    // Restablece baseY a la Y actual para que las ondas partan de ahí
    if (MOVEMENT_PATTERNS[currentPattern].name !== 'orbit') {
        invaders.forEach(inv => { inv.baseY = inv.y; });
    }
}

export function updateInvaders(enemyProjectiles, level, canvasWidth, sounds) {
    // ── Cambio de patrón cada PATTERN_DURATION ms ──
    if (Date.now() - patternTimer > PATTERN_DURATION) {
        selectNextPattern();
        patternTimer = Date.now();
    }

    patternTick++;
    const pattern = MOVEMENT_PATTERNS[currentPattern];
    const speed = invaderSpeed * (1 + (level - 1) * 0.15);

    let moveDown = false;

    // Centro de la formación (para orbit)
    const fmtCX = invaders.length ? invaders[0]._orbitCX || canvasWidth / 2 : canvasWidth / 2;
    const fmtCY = invaders.length ? invaders[0]._orbitCY || invaderOffsetTop + 100 : invaderOffsetTop + 100;

    for (const inv of invaders) {
        const prevX = inv.x;

        if (pattern.update) {
            // Override temporal de speed para patrones
            const savedSpeed = invaderSpeed;
            invaderSpeed = speed;
            pattern.update(inv, patternTick, fmtCX, fmtCY);
            invaderSpeed = savedSpeed;
        } else {
            // Patrón classic
            inv.x += speed * invaderDirection;
        }

        // Verificar bordes solo en patrones horizontales
        if (pattern.name !== 'orbit') {
            if (inv.x + inv.width > canvasWidth || inv.x < 0) {
                moveDown = true;
                inv.x = prevX; // revertir para no salirse
            }
        }

        // Disparos de invasores (solo nivel > 1)
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

    if (moveDown && pattern.name === 'classic') {
        invaderDirection *= -1;
        for (const inv of invaders) {
            inv.y += invaderHeight;
            inv.baseY = inv.y;
        }
    } else if (moveDown && pattern.name !== 'classic' && pattern.name !== 'orbit') {
        invaderDirection *= -1;
    }
}

export function drawInvaders(ctx) {
    invaders.forEach(inv => {
        const sprite = spriteImages[`invader${inv.row + 1}`];
        if (sprite) {
            ctx.drawImage(sprite, inv.x, inv.y, inv.width, inv.height);
        }
    });
}

export function getCurrentPatternName() {
    return MOVEMENT_PATTERNS[currentPattern].name;
}

export function getInvaderSpeed() { return invaderSpeed; }

export function increaseInvaderSpeed(factor) { invaderSpeed *= factor; }
