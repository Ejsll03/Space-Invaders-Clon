import { getScore, getScorePopups } from './collisions.js';
import { player } from './player.js';
import { spriteImages } from './sprites.js';

// Dibuja un corazón pixel art de tamaño `s` en (x, y)
function drawHeart(ctx, x, y, s) {
    // Grid 8x8 escalada a s×s
    const g = [
        '..AA.AA.',
        '.AAAAAAA',
        '.AAAAAAA',
        '.AAAAAAA',
        '..AAAAA.',
        '...AAA..',
        '....A...',
        '........',
    ];
    const pw = s / g[0].length;
    const ph = s / g.length;
    ctx.fillStyle = '#ff4f8b';
    for (let r = 0; r < g.length; r++) {
        for (let c = 0; c < g[r].length; c++) {
            if (g[r][c] === 'A') {
                ctx.fillRect(
                    Math.floor(x + c * pw),
                    Math.floor(y + r * ph),
                    Math.ceil(pw), Math.ceil(ph)
                );
            }
        }
    }
}

export function drawUI(ctx, level, canvasWidth) {
    const fSize = Math.max(14, Math.min(22, canvasWidth * 0.027));
    ctx.fillStyle = '#fff';
    ctx.font = `${fSize}px "Courier New", Courier, monospace`;

    ctx.textAlign = 'left';
    ctx.fillText(`Puntos: ${getScore()}`, 10, fSize + 6);

    ctx.textAlign = 'center';
    ctx.fillText(`Nivel: ${level}`, canvasWidth / 2, fSize + 6);

    // Vidas: corazones pixel art
    const heartSize = Math.max(12, fSize * 0.9);
    const heartGap  = 4;
    const lives = Math.max(0, player.lives);
    const totalW = lives * (heartSize + heartGap);
    let hx = canvasWidth - 10 - totalW;
    const hy = 6;
    ctx.save();
    ctx.shadowBlur  = 6;
    ctx.shadowColor = '#ff4f8b';
    for (let i = 0; i < lives; i++) {
        drawHeart(ctx, hx, hy, heartSize);
        hx += heartSize + heartGap;
    }
    ctx.restore();
}

export function drawScorePopups(ctx) {
    const popups = getScorePopups();
    ctx.font = '18px Courier New';
    ctx.textAlign = 'center';
    for (let i = popups.length - 1; i >= 0; i--) {
        const p = popups[i];
        p.y += p.dy;
        p.opacity -= 0.02;
        if (p.opacity <= 0) { popups.splice(i, 1); continue; }
        ctx.fillStyle = `rgba(255,255,0,${p.opacity})`;
        ctx.fillText(p.value, p.x, p.y);
    }
}

export function drawStartScreen(ctx, canvasWidth, canvasHeight) {
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const img = spriteImages.title;
    const imgW = Math.min(500, canvasWidth * 0.85);
    const imgH = imgW * 0.3;
    if (img.complete && img.naturalWidth !== 0) {
        ctx.drawImage(img, canvasWidth / 2 - imgW / 2, canvasHeight / 2 - imgH - 60, imgW, imgH);
    }

    const isMobile = canvasWidth < 500;
    ctx.fillStyle = '#3f3';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (isMobile) {
        ctx.font = `${Math.max(13, canvasWidth * 0.04)}px "Courier New", monospace`;
        ctx.fillText('Usa el D-Pad para moverte', canvasWidth / 2, canvasHeight / 2 + 10);
        ctx.fillText('Toca FIRE para disparar', canvasWidth / 2, canvasHeight / 2 + 44);
        ctx.font = `${Math.max(15, canvasWidth * 0.05)}px "Courier New", monospace`;
        ctx.fillText('Toca la pantalla para empezar', canvasWidth / 2, canvasHeight / 2 + 100);
    } else {
        ctx.font = '20px "Courier New", monospace';
        ctx.fillText('W/A/S/D para moverte  ·  Espacio para disparar', canvasWidth / 2, canvasHeight / 2 + 20);
        ctx.font = '26px "Courier New", monospace';
        ctx.fillText('Presiona ENTER o haz CLICK para empezar', canvasWidth / 2, canvasHeight / 2 + 100);
    }
}

export function drawGameOverMenu(ctx, canvasWidth, canvasHeight, options, selectedIndex) {
    const fSize = Math.max(18, Math.min(28, canvasWidth * 0.035));
    ctx.font = `${fSize}px "Courier New", monospace`;
    const spacing = fSize * 1.8;
    const startY = canvasHeight / 2 + 80;
    options.forEach((opt, i) => {
        ctx.fillStyle = i === selectedIndex ? '#fff' : '#aaa';
        ctx.fillText(opt, canvasWidth / 2, startY + i * spacing);
    });
}

export function drawGameOverScreen(ctx, canvasWidth, canvasHeight, options, selectedIndex) {
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const titleSize = Math.max(32, Math.min(70, canvasWidth * 0.09));
    ctx.fillStyle = '#ff4141';
    ctx.font = `${titleSize}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER', canvasWidth / 2, canvasHeight / 2 - titleSize);

    const scoreSize = Math.max(18, Math.min(30, canvasWidth * 0.037));
    ctx.fillStyle = '#fff';
    ctx.font = `${scoreSize}px "Courier New", monospace`;
    ctx.fillText(`Puntuación: ${getScore()}`, canvasWidth / 2, canvasHeight / 2);

    drawGameOverMenu(ctx, canvasWidth, canvasHeight, options, selectedIndex);
}

export function drawPauseMenu(ctx, canvasWidth, canvasHeight, options, selectedIndex) {
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const titleSize = Math.max(28, Math.min(50, canvasWidth * 0.065));
    ctx.fillStyle = '#3f3';
    ctx.font = `${titleSize}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PAUSA', canvasWidth / 2, canvasHeight / 2 - titleSize * 1.5);

    const fSize = Math.max(16, Math.min(30, canvasWidth * 0.037));
    ctx.font = `${fSize}px "Courier New", monospace`;
    const spacing = fSize * 1.8;
    const startY = canvasHeight / 2;
    options.forEach((opt, i) => {
        ctx.fillStyle = i === selectedIndex ? '#fff' : '#aaa';
        ctx.fillText(opt, canvasWidth / 2, startY + i * spacing);
    });
}
