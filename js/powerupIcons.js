// ============================================================
//  powerupIcons.js  –  Iconos dibujados en canvas (sin emojis)
//  Cada función recibe (ctx, x, y, size) y dibuja el ícono
//  centrado en (x + size/2, y + size/2).
// ============================================================

// ── Helpers ──────────────────────────────────────────────────
function px(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

// Dibuja una cuadrícula de píxeles escalada al tamaño dado.
// grid: array de strings de misma longitud, '.' = vacío, cualquier otra letra = color mapeado en palette
function drawPixelGrid(ctx, ox, oy, size, grid, palette) {
    const rows = grid.length;
    const cols = grid[0].length;
    const pw   = size / cols;
    const ph   = size / rows;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const ch = grid[r][c];
            if (ch === '.') continue;
            const color = palette[ch] || '#fff';
            ctx.fillStyle = color;
            ctx.fillRect(
                Math.floor(ox + c * pw),
                Math.floor(oy + r * ph),
                Math.ceil(pw),
                Math.ceil(ph)
            );
        }
    }
}

// ══════════════════════════════════════════════════════════════
//  POWERUPS
// ══════════════════════════════════════════════════════════════

/** Corazón rojo – Vida extra */
export function drawIconHeart(ctx, ox, oy, size) {
    const g = [
        '..AA.AA..',
        '.AAAAAA..',
        '.AAAAAAA.',
        '.AAAAAAA.',
        '..AAAAAA.',
        '...AAAAA.',
        '....AAA..',
        '.....A...',
    ];
    drawPixelGrid(ctx, ox, oy, size, g, { A: '#ff4f8b' });
}

/** Tres líneas verticales con flechas – Triple disparo */
export function drawIconTripleShot(ctx, ox, oy, size) {
    const g = [
        '.A.A.A.',
        '.A.A.A.',
        '.A.A.A.',
        'AAAAAAA',
        '.AAAAA.',
        '..AAA..',
        '...A...',
    ];
    drawPixelGrid(ctx, ox, oy, size, g, { A: '#00e5ff' });
}

/** Hexágono / escudo – Shield */
export function drawIconShield(ctx, ox, oy, size) {
    const g = [
        '..AAAA..',
        '.AAAAAA.',
        'AAAAAAAA',
        'AAAAAAAA',
        'AAAAAAAA',
        '.AAAAAA.',
        '..AAAA..',
        '...AA...',
    ];
    // Borde exterior más claro
    const g2 = [
        '..BBBB..',
        '.B....B.',
        'B......B',
        'B..AA..B',
        'B.AAAA.B',
        '.BAAAAB.',
        '..BAAB..',
        '...BB...',
    ];
    drawPixelGrid(ctx, ox, oy, size, g, { A: '#ffe60055' });
    drawPixelGrid(ctx, ox, oy, size, g2, { B: '#ffe600', A: '#fff8' });
}

/** Rayo – Turbo/Velocidad */
export function drawIconSpeedBoost(ctx, ox, oy, size) {
    const g = [
        '....AAA.',
        '...AAA..',
        '..AAA...',
        '.AAAAAA.',
        'AAAAAAA.',
        '..AAA...',
        '.AAA....',
        'AAA.....',
    ];
    drawPixelGrid(ctx, ox, oy, size, g, { A: '#76ff03' });
}

/** Llamas – Fuego rápido */
export function drawIconRapidFire(ctx, ox, oy, size) {
    const g = [
        '...A....',
        '..AAA...',
        '.AAAAB..',
        '.AAAAAB.',
        'AAAAAAB.',
        'AAAAAAA.',
        '.AAAAA..',
        '..AAA...',
    ];
    drawPixelGrid(ctx, ox, oy, size, g, { A: '#ff9100', B: '#ffdd00' });
}

/** Bomba clásica – Bomba */
export function drawIconBomb(ctx, ox, oy, size) {
    const g = [
        '....AA..',
        '...AAAB.',
        '..AAAAB.',
        '.AAAAAA.',
        '.AAAAAA.',
        '.AAAAAA.',
        '..AAAA..',
        '...AA...',
    ];
    drawPixelGrid(ctx, ox, oy, size, g, { A: '#555', B: '#ffdd00' });
    // Cruz brillante encima
    const g2 = [
        '........',
        '........',
        '........',
        '...CC...',
        '..CCCC..',
        '...CC...',
        '........',
        '........',
    ];
    drawPixelGrid(ctx, ox, oy, size, g2, { C: '#ff6600' });
}

// ══════════════════════════════════════════════════════════════
//  DEBUFFS
// ══════════════════════════════════════════════════════════════

/** Flechas cruzadas – Controles invertidos */
export function drawIconInvertedControls(ctx, ox, oy, size) {
    const g = [
        '.A....A.',
        'AAA..AAA',
        '.A....A.',
        '........',
        '........',
        '.A....A.',
        'AAA..AAA',
        '.A....A.',
    ];
    // Segunda capa: cruza las flechas
    const g2 = [
        '........',
        '........',
        '..BBBB..',
        '...BB...',
        '...BB...',
        '..BBBB..',
        '........',
        '........',
    ];
    drawPixelGrid(ctx, ox, oy, size, g,  { A: '#e040fb' });
    drawPixelGrid(ctx, ox, oy, size, g2, { B: '#fff4' });
}

/** Ondas / vibración – Pantalla temblando */
export function drawIconScreenShake(ctx, ox, oy, size) {
    const g = [
        'A.A.A.A.',
        '.A.A.A.A',
        'A.A.A.A.',
        '.A.A.A.A',
        'A.A.A.A.',
        '.A.A.A.A',
        'A.A.A.A.',
        '.A.A.A.A',
    ];
    drawPixelGrid(ctx, ox, oy, size, g, { A: '#ff1744' });
}

/** Caracol / trazo lento – Muy lento */
export function drawIconSlowPlayer(ctx, ox, oy, size) {
    // Flecha hacia abajo con X encima
    const g = [
        '.AAAAAA.',
        'AAAAAAAA',
        '.AAAAAA.',
        '..AAAA..',
        '...AA...',
        '..B..B..',
        '.BB..BB.',
        'BB....BB',
    ];
    drawPixelGrid(ctx, ox, oy, size, g, { A: '#8d6e63', B: '#8d6e63' });
    // Tres rayas horizontales a la derecha del cuerpo
    const g2 = [
        '........',
        '........',
        '........',
        '........',
        '........',
        'CC......',
        '.CC.....',
        '..CC....',
    ];
    drawPixelGrid(ctx, ox, oy, size, g2, { C: '#ffcc8055' });
}

/** Cañón tachado – Sin disparos */
export function drawIconBlockedShot(ctx, ox, oy, size) {
    // Cañón
    const g = [
        '...AA...',
        '...AA...',
        '..AAAA..',
        '.AAAAAA.',
        'AAAAAAAA',
        '.AAAAAA.',
        '........',
        '........',
    ];
    // Cruz roja encima
    const g2 = [
        'B......B',
        '.B....B.',
        '..B..B..',
        '...BB...',
        '...BB...',
        '..B..B..',
        '.B....B.',
        'B......B',
    ];
    drawPixelGrid(ctx, ox, oy, size, g,  { A: '#aaa' });
    drawPixelGrid(ctx, ox, oy, size, g2, { B: '#d50000' });
}

/** Nave pequeña – Mini nave */
export function drawIconTinyPlayer(ctx, ox, oy, size) {
    // Nave grande tachada
    const g = [
        '...AA...',
        '..AAAA..',
        '.AAAAAA.',
        'AAAAAAAA',
        '.AAAAAA.',
        '..A..A..',
        '........',
        '........',
    ];
    // Nave pequeña abajo a la derecha
    const g2 = [
        '........',
        '........',
        '........',
        '........',
        '.....B..',
        '....BBB.',
        '.....B..',
        '........',
    ];
    drawPixelGrid(ctx, ox, oy, size, g,  { A: '#ff6d0066' });
    drawPixelGrid(ctx, ox, oy, size, g2, { B: '#ff6d00' });
}

/** Luna / eclipse – Pantalla oscura */
export function drawIconDarkScreen(ctx, ox, oy, size) {
    const g = [
        '..AAAA..',
        '.AAAAAA.',
        'AA....AA',
        'A......A',
        'A......A',
        'AA....AA',
        '.AAAAAA.',
        '..AAAA..',
    ];
    const g2 = [
        '........',
        '...BBBB.',
        '..BBBBBB',
        '..BBBBBB',
        '..BBBBBB',
        '...BBBBB',
        '....BBB.',
        '........',
    ];
    drawPixelGrid(ctx, ox, oy, size, g,  { A: '#9e9e9e' });
    drawPixelGrid(ctx, ox, oy, size, g2, { B: '#212121' });
}

// ══════════════════════════════════════════════════════════════
//  MAPA: effectId → función de dibujo
// ══════════════════════════════════════════════════════════════
export const ICON_DRAW_FN = {
    extra_life:         drawIconHeart,
    triple_shot:        drawIconTripleShot,
    shield:             drawIconShield,
    speed_boost:        drawIconSpeedBoost,
    rapid_fire:         drawIconRapidFire,
    bomb:               drawIconBomb,
    inverted_controls:  drawIconInvertedControls,
    screen_shake:       drawIconScreenShake,
    slow_player:        drawIconSlowPlayer,
    blocked_shot:       drawIconBlockedShot,
    tiny_player:        drawIconTinyPlayer,
    dark_screen:        drawIconDarkScreen,
};
