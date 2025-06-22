// Limita un valor dentro de un rango
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Devuelve un número aleatorio entre min (inclusive) y max (exclusivo)
export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

// Devuelve un número entero aleatorio entre min y max (ambos incluidos)
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
