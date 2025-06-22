import { getScore, getScorePopups } from './collisions.js';
import { player } from './player.js';
import { spriteImages } from './sprites.js';

export function drawUI(ctx, level, canvasWidth) {
    ctx.fillStyle = '#fff';
    ctx.font = '24px "Courier New", Courier, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Puntuación: ${getScore()}`, 20, 30)

    ctx.textAlign = 'center';
    ctx.fillText(`Nivel: ${level}`, canvasWidth / 2, 30);

    ctx.textAlign = 'right';
    ctx.fillText(`Vidas: ${'❤️'.repeat(Math.max(0, player.lives))}`, canvasWidth - 20, 30);
}

export function drawScorePopups(ctx) {
    const popups = getScorePopups();
    ctx.font = '20px Courier New';
    ctx.textAlign = 'center';

    for (let i = popups.length - 1; i >= 0; i--) {
        const popup = popups[i];
        popup.y += popup.dy;
        popup.opacity -= 0.02;
        if (popup.opacity <= 0) {
            popups.splice(i, 1);
        } else {
            ctx.fillStyle = `rgba(255, 255, 0, ${popup.opacity})`;
            ctx.fillText(popup.value, popup.x, popup.y);
        }
    }
}

export function drawStartScreen(ctx, canvasWidth, canvasHeight) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Dibuja la imagen del título centrada
    const img = spriteImages.title;
    const imgWidth = 500;
    const imgHeight = 150;
    if (img.complete && img.naturalWidth !== 0) {
        ctx.drawImage(img, canvasWidth / 2 - imgWidth / 2, canvasHeight / 2 - 180, imgWidth, imgHeight);
    }

    ctx.fillStyle = '#3f3';
    ctx.font = '22px "Courier New", Courier, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Usa W/A/S/D para moverte', canvasWidth / 2, canvasHeight / 2);
    ctx.fillText('Usa [Espacio] para disparar', canvasWidth / 2, canvasHeight / 2 + 40);

    ctx.font = '30px "Courier New", Courier, monospace';
    ctx.fillText('Presiona ENTER o haz CLICK para empezar', canvasWidth / 2, canvasHeight / 2 + 120);
}

export function drawGameOverMenu(ctx, canvasWidth, canvasHeight, options, selectedIndex) {
    ctx.font = '28px "Courier New", Courier, monospace';
    const spacing = 50;
    const startY = canvasHeight / 2 + 80;
    options.forEach((option, i) => {
        ctx.fillStyle = i === selectedIndex ? '#fff' : '#aaa';
        ctx.fillText(option, canvasWidth / 2, startY + i * spacing);
    });
}

export function drawGameOverScreen(ctx, canvasWidth, canvasHeight, options, selectedIndex) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = '#ff4141';
    ctx.font = '70px "Courier New", Courier, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER', canvasWidth / 2, canvasHeight / 2 - 80);

    ctx.fillStyle = '#fff';
    ctx.font = '30px "Courier New", Courier, monospace';
    ctx.fillText(`Puntuación Final: ${getScore()}`, canvasWidth / 2, canvasHeight / 2);

    drawGameOverMenu(ctx, canvasWidth, canvasHeight, options, selectedIndex);
}

export function drawPauseMenu(ctx, canvasWidth, canvasHeight, options, selectedIndex) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = '#3f3';
    ctx.font = '50px "Courier New", Courier, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PAUSA', canvasWidth / 2, canvasHeight / 2 - 100);

    ctx.font = '30px "Courier New", Courier, monospace';
    const spacing = 50;
    const startY = canvasHeight / 2;

    options.forEach((option, i) => {
        ctx.fillStyle = i === selectedIndex ? '#fff' : '#aaa';
        ctx.fillText(option, canvasWidth / 2, startY + i * spacing);
    });
}
