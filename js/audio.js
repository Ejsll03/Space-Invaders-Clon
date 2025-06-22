export const sounds = {
    // Background music
    home: new Audio('assets/audio/Home_Song.mp4'),

    // Player sounds
    shoot_player: new Audio('assets/audio/shoot.wav'), // disparo jugador
    explosion: new Audio('assets/audio/explosion.wav'), // explosión
    hit_player: new Audio('assets/audio/Less_Heart.wav'), // daño jugador

    // Enemy sounds
    shoot_enemy: new Audio('assets/audio/shoot2.wav'), // disparo enemigo
    shoot_boss: new Audio('assets/audio/shoot1.wav'), // disparo jefe
    kill_enemy: new Audio('assets/audio/invaderkilled.wav'), // enemigo destruido
    boss: new Audio('assets/audio/shoot1.wav'), // sonido jefe (puedes cambiar el archivo si tienes uno específico)

    // Game sounds
    gameover: new Audio('assets/audio/Game_over.wav')
};

export function setupAudio() {
    for (let key in sounds) {
        sounds[key].volume = 0.7;
    }
}
