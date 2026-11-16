/**
 * Columnas para repartir n elementos sin dejar uno solo en la última fila.
 * Prueba de `max` a 2 y, si ninguna sirve, `max + 1`; prefiere filas
 * completas. Con n ≤ max, una sola fila.
 */
export function columnas(n, max) {
    if (n <= max)
        return Math.max(1, n);
    const candidatas = [...Array.from({ length: max - 1 }, (_, i) => max - i), max + 1];
    return (candidatas.find((c) => n % c === 0) ??
        candidatas.find((c) => n % c !== 1) ??
        1);
}
