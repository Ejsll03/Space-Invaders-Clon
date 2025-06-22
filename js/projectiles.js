export let playerProjectiles = [];
export let enemyProjectiles = [];

const projectileSpeed = 7;
let canShoot = true;
const shootCooldown = 300;

export function shoot(player, sounds) {
    if (!canShoot) return;
    playerProjectiles.push({
        x: player.x + player.width / 2 - 2.5,
        y: player.y,
        width: 5,
        height: 20,
        color: '#3f3'
    });

    if (sounds?.shoot_player) {
        sounds.shoot_player.currentTime = 0;
        sounds.shoot_player.play();
    }

    canShoot = false;
    setTimeout(() => canShoot = true, shootCooldown);
}

export function updateProjectiles(canvasHeight) {
    for (let i = playerProjectiles.length - 1; i >= 0; i--) {
        playerProjectiles[i].y -= projectileSpeed;
        if (playerProjectiles[i].y < 0) {
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
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fillRect(p.x, p.y, p.width, p.height);
    });
    ctx.shadowBlur = 0;
}
