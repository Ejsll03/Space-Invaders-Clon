export const spriteImages = {
    player: new Image(),
    invader1: new Image(),
    invader2: new Image(),
    invader3: new Image(),
    invader4: new Image(),
    invader5: new Image(),
    boss: new Image(),
    title: new Image()
};

export function loadSprites() {
    spriteImages.player.src = 'assets/sprites/Nave 2.png';
    spriteImages.invader1.src = 'assets/sprites/Invader1.png';
    spriteImages.invader2.src = 'assets/sprites/Invader2.png';
    spriteImages.invader3.src = 'assets/sprites/Invader3.png';
    spriteImages.invader4.src = 'assets/sprites/Invader4.png';
    spriteImages.invader5.src = 'assets/sprites/Invader5.png';
    spriteImages.boss.src = 'assets/sprites/Boss1.png';
    spriteImages.title.src = 'assets/sprites/Titlle.png';
}
