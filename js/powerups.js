// ============================================================
//  powerups.js  –  Sistema de PowerUps y Debuffs
//  Iconos: dibujados en canvas via powerupIcons.js (sin emojis)
// ============================================================
import { player }              from './player.js';
import { rectCollision }       from './collisions.js';
import { ICON_DRAW_FN }        from './powerupIcons.js';

// ── Estado global de efectos activos ────────────────────────
export const activeEffects = {
    triple_shot:       false,
    shield:            false,
    speed_boost:       false,
    rapid_fire:        false,
    bomb:              false,
    inverted_controls: false,
    screen_shake:      false,
    slow_player:       false,
    blocked_shot:      false,
    tiny_player:       false,
    dark_screen:       false,
};

// ── Definición de todos los efectos ─────────────────────────
export const EFFECT_DEFS = {
    // ══ POWERUPS ══
    extra_life: {
        type: 'powerup', label: '¡VIDA EXTRA!',
        color: '#ff4f8b', duration: 0,
        apply:  () => { player.lives = Math.min(player.lives + 1, 5); },
        remove: () => {},
    },
    triple_shot: {
        type: 'powerup', label: 'TRIPLE DISPARO',
        color: '#00e5ff', duration: 8000,
        apply:  () => { activeEffects.triple_shot = true; },
        remove: () => { activeEffects.triple_shot = false; },
    },
    shield: {
        type: 'powerup', label: 'ESCUDO',
        color: '#ffe600', duration: 7000,
        apply:  () => { activeEffects.shield = true; },
        remove: () => { activeEffects.shield = false; },
    },
    speed_boost: {
        type: 'powerup', label: 'TURBO',
        color: '#76ff03', duration: 7000,
        apply:  () => { player.speed = Math.min(player.speed + 4, 14); activeEffects.speed_boost = true; },
        remove: () => { player.speed = Math.max(player.speed - 4, 5);  activeEffects.speed_boost = false; },
    },
    rapid_fire: {
        type: 'powerup', label: 'FUEGO RAPIDO',
        color: '#ff9100', duration: 7000,
        apply:  () => { activeEffects.rapid_fire = true; },
        remove: () => { activeEffects.rapid_fire = false; },
    },
    bomb: {
        type: 'powerup', label: '!BOMBA!',
        color: '#ff6600', duration: 0,
        apply:  () => { activeEffects.bomb = true; },
        remove: () => { activeEffects.bomb = false; },
    },
    // ══ DEBUFFS ══
    inverted_controls: {
        type: 'debuff', label: '!CONTROLES INVERTIDOS!',
        color: '#e040fb', duration: 5000,
        apply:  () => { activeEffects.inverted_controls = true; },
        remove: () => { activeEffects.inverted_controls = false; },
    },
    screen_shake: {
        type: 'debuff', label: '!PANTALLA TEMBLANDO!',
        color: '#ff1744', duration: 4000,
        apply:  () => { activeEffects.screen_shake = true; },
        remove: () => { activeEffects.screen_shake = false; },
    },
    slow_player: {
        type: 'debuff', label: '!MUY LENTO!',
        color: '#8d6e63', duration: 5000,
        apply:  () => { player.speed = Math.max(player.speed - 3, 1); activeEffects.slow_player = true; },
        remove: () => { player.speed = Math.min(player.speed + 3, 5); activeEffects.slow_player = false; },
    },
    blocked_shot: {
        type: 'debuff', label: '!SIN DISPAROS!',
        color: '#d50000', duration: 4000,
        apply:  () => { activeEffects.blocked_shot = true; },
        remove: () => { activeEffects.blocked_shot = false; },
    },
    tiny_player: {
        type: 'debuff', label: '!MINI NAVE!',
        color: '#ff6d00', duration: 6000,
        apply:  () => {
            player._origW  = player.width;
            player._origH  = player.height;
            player.width   = 28;
            player.height  = 28;
            activeEffects.tiny_player = true;
        },
        remove: () => {
            player.width   = player._origW ?? 60;
            player.height  = player._origH ?? 60;
            activeEffects.tiny_player = false;
        },
    },
    dark_screen: {
        type: 'debuff', label: '!PANTALLA OSCURA!',
        color: '#9e9e9e', duration: 5000,
        apply:  () => { activeEffects.dark_screen = true; },
        remove: () => { activeEffects.dark_screen = false; },
    },
};

// ── Timers activos ───────────────────────────────────────────
const effectTimers = {};

// ── Ítems cayendo ────────────────────────────────────────────
export let droppingItems = [];

// ── Notificaciones en pantalla ───────────────────────────────
export let notifications = [];

// ── HUD: efectos activos con barra de tiempo ─────────────────
export let activeTimers = [];

// ============================================================
//  API PÚBLICA
// ============================================================

export function spawnPowerup(x, y, forcedType = null) {
    const allKeys    = Object.keys(EFFECT_DEFS);
    const puKeys     = allKeys.filter(k => EFFECT_DEFS[k].type === 'powerup');
    const debuffKeys = allKeys.filter(k => EFFECT_DEFS[k].type === 'debuff');

    let pool;
    if (forcedType === 'powerup')  pool = puKeys;
    else if (forcedType === 'debuff') pool = debuffKeys;
    else pool = Math.random() < 0.55 ? puKeys : debuffKeys;

    const effectId = pool[Math.floor(Math.random() * pool.length)];
    const def      = EFFECT_DEFS[effectId];

    droppingItems.push({
        x:        x - 18,
        y,
        width:    36,
        height:   36,
        effectId,
        color:    def.color,
        type:     def.type,
        glowAng:  Math.random() * Math.PI * 2,
        vy:       1.8 + Math.random() * 0.6,
    });
}

export function spawnBossDebuff(x, y) {
    spawnPowerup(x, y, 'debuff');
}

function applyEffect(effectId) {
    const def = EFFECT_DEFS[effectId];
    if (!def) return;

    if (effectTimers[effectId]) {
        clearTimeout(effectTimers[effectId]);
        def.remove();
        delete effectTimers[effectId];
        const idx = activeTimers.findIndex(t => t.id === effectId);
        if (idx !== -1) activeTimers.splice(idx, 1);
    }

    def.apply();

    notifications.push({
        label:    def.label,
        color:    def.color,
        type:     def.type,
        effectId,
        timer:    0,
        maxTimer: 1400,
    });

    if (def.duration > 0) {
        activeTimers.push({
            id:       effectId,
            timeLeft: def.duration,
            maxTime:  def.duration,
            color:    def.color,
            type:     def.type,
        });
        effectTimers[effectId] = setTimeout(() => {
            def.remove();
            delete effectTimers[effectId];
            const idx = activeTimers.findIndex(t => t.id === effectId);
            if (idx !== -1) activeTimers.splice(idx, 1);
        }, def.duration);
    }
}

export function resetPowerups() {
    droppingItems.length = 0;
    notifications.length = 0;
    activeTimers.length  = 0;
    for (const id of Object.keys(effectTimers)) {
        clearTimeout(effectTimers[id]);
        EFFECT_DEFS[id]?.remove();
        delete effectTimers[id];
    }
    for (const k of Object.keys(activeEffects)) activeEffects[k] = false;
    player.speed  = 5;
    player.width  = 60;
    player.height = 60;
}

// ============================================================
//  UPDATE & DRAW
// ============================================================

export function updatePowerups(canvasHeight, deltaMs) {
    for (let i = droppingItems.length - 1; i >= 0; i--) {
        const item = droppingItems[i];
        item.y      += item.vy;
        item.glowAng += 0.06;

        if (rectCollision(item, player)) {
            applyEffect(item.effectId);
            droppingItems.splice(i, 1);
            continue;
        }
        if (item.y > canvasHeight + 10) droppingItems.splice(i, 1);
    }

    for (let i = notifications.length - 1; i >= 0; i--) {
        notifications[i].timer += deltaMs;
        if (notifications[i].timer >= notifications[i].maxTimer) notifications.splice(i, 1);
    }

    for (let i = activeTimers.length - 1; i >= 0; i--) {
        activeTimers[i].timeLeft -= deltaMs;
        if (activeTimers[i].timeLeft <= 0) activeTimers.splice(i, 1);
    }
}

// ── Dibuja los ítems cayendo ─────────────────────────────────
export function drawPowerups(ctx) {
    for (const item of droppingItems) {
        const pulse  = 0.55 + 0.45 * Math.sin(item.glowAng);
        const isGood = item.type === 'powerup';

        ctx.save();

        // Halo exterior pulsante
        ctx.shadowBlur  = 18 * pulse;
        ctx.shadowColor = item.color;

        // Fondo de la cápsula
        ctx.fillStyle   = isGood
            ? `rgba(0,200,100,${0.18 * pulse})`
            : `rgba(220,20,20,${0.22 * pulse})`;
        ctx.strokeStyle = item.color;
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.roundRect(item.x, item.y, item.width, item.height, 7);
        ctx.fill();
        ctx.stroke();

        // Ícono dibujado en canvas
        ctx.shadowBlur = 0;
        const pad = Math.floor(item.width * 0.1);
        const drawFn = ICON_DRAW_FN[item.effectId];
        if (drawFn) {
            drawFn(ctx, item.x + pad, item.y + pad, item.width - pad * 2);
        }

        ctx.restore();
    }
}

// ── Toasts de notificación (esquina inferior izquierda) ──────
// Pequeños, rápidos, no bloquean el juego.
// Animación: entran desde la izquierda → se quedan → se desvanecen.
export function drawNotifications(ctx, canvasWidth, canvasHeight) {
    const toastH   = 32;
    const iconSize = 20;
    const padX     = 10;
    const padY     = 8;
    const maxW     = Math.min(230, canvasWidth * 0.38);
    const baseY    = canvasHeight - 40;   // encima del borde inferior
    const SLIDE_MS = 180;                 // duración del slide-in (ms)
    const FADE_MS  = 200;                 // duración del fade-out (ms)

    for (let i = 0; i < notifications.length; i++) {
        const notif    = notifications[i];
        const progress = notif.timer / notif.maxTimer;

        // Slide-in: los primeros SLIDE_MS el toast llega desde la izquierda
        const slideRatio = Math.min(1, notif.timer / SLIDE_MS);
        const slideX     = (slideRatio - 1) * (maxW + 20);  // 0 cuando slideRatio=1

        // Fade-out: los últimos FADE_MS desaparece
        const fadeStart = 1 - FADE_MS / notif.maxTimer;
        const opacity   = progress < fadeStart
            ? 1
            : 1 - (progress - fadeStart) / (FADE_MS / notif.maxTimer);

        // Posición: apilados de abajo hacia arriba
        const y = baseY - i * (toastH + 4);
        const x = 8 + slideX;

        ctx.save();
        ctx.globalAlpha = Math.max(0, opacity);

        // Fondo compacto
        ctx.fillStyle   = 'rgba(0,0,0,0.78)';
        ctx.strokeStyle = notif.color;
        ctx.lineWidth   = 1.5;
        ctx.shadowBlur  = 8;
        ctx.shadowColor = notif.color;
        ctx.beginPath();
        ctx.roundRect(x, y, maxW, toastH, 6);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Ícono
        const drawFn = ICON_DRAW_FN[notif.effectId];
        if (drawFn) drawFn(ctx, x + padX, y + (toastH - iconSize) / 2, iconSize);

        // Texto
        ctx.fillStyle    = notif.color;
        ctx.font         = `bold 11px "Courier New", monospace`;
        ctx.textAlign    = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(notif.label, x + padX + iconSize + 6, y + toastH / 2);

        ctx.restore();
    }
}

// ── HUD de efectos activos (esquina superior derecha) ────────
export function drawActiveEffectsHUD(ctx, canvasWidth) {
    if (activeTimers.length === 0) return;

    const iconSize = 24;
    const barW     = 80;
    const barH     = 6;
    const itemW    = iconSize + barW + 8;
    const padRight = 14;
    const y        = 50;

    let x = canvasWidth - padRight;

    for (const t of activeTimers) {
        const ratio = Math.max(0, t.timeLeft / t.maxTime);
        const bx    = x - barW;
        const ix    = bx - iconSize - 4;

        ctx.save();

        // Ícono
        const drawFn = ICON_DRAW_FN[t.id];
        if (drawFn) {
            ctx.shadowBlur  = 6;
            ctx.shadowColor = t.color;
            drawFn(ctx, ix, y - iconSize / 2, iconSize);
            ctx.shadowBlur  = 0;
        }

        // Barra de fondo
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(bx, y + iconSize / 2 - barH / 2 - 4, barW, barH);

        // Barra rellena
        const barColor = t.type === 'debuff'
            ? `rgba(255,${Math.floor(30 + 120 * (1 - ratio))},30,0.9)`
            : t.color;
        ctx.fillStyle = barColor;
        ctx.fillRect(bx, y + iconSize / 2 - barH / 2 - 4, barW * ratio, barH);

        ctx.restore();
        x -= itemW + padRight;
    }
}

// ── Overlay oscuro para debuff dark_screen ───────────────────
export function drawDarkOverlay(ctx, canvasWidth, canvasHeight) {
    if (!activeEffects.dark_screen) return;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.74)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
}
