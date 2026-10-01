/**
 * Calcula un tablero rectangular lleno (sin huecos) adaptado al contenedor.
 *
 * Dado el tamaño disponible (W×H), un rango de pares y el aspecto de carta,
 * elige el número de pares y las dimensiones (filas × columnas) que menos
 * distorsionan la carta. El total de cartas siempre es par y forma un
 * rectángulo exacto: filas * columnas === pares * 2.
 *
 * @param {number} containerW Ancho disponible en px
 * @param {number} containerH Alto disponible en px
 * @param {number} paresMin Pares mínimos (dificultad)
 * @param {number} paresMax Pares máximos (dificultad)
 * @param {number} cardAspect Aspecto w/h de la carta (por defecto 4/5 = 0.8)
 * @returns {{filas:number, columnas:number, pares:number}}
 */
export function calcularTablero(containerW, containerH, paresMin, paresMax, cardAspect = 0.8) {
  const W = Math.max(1, containerW);
  const H = Math.max(1, containerH);
  const vertical = H > W;

  let mejor = null;

  for (let pares = paresMin; pares <= paresMax; pares++) {
    const total = pares * 2;
    for (let r = 1; r <= total; r++) {
      if (total % r !== 0) continue;
      const c = total / r;
      // Filas<=columnas en apaisado; al revés en vertical.
      const filas = vertical ? Math.max(r, c) : Math.min(r, c);
      const columnas = vertical ? Math.min(r, c) : Math.max(r, c);
      const celdaAspect = (W / columnas) / (H / filas);
      // Distorsión logarítmica (simétrica al estirar/encoger) + penalización
      // leve a tableros de 1 fila/columna (poco jugables).
      let coste = Math.abs(Math.log(celdaAspect / cardAspect));
      if (filas === 1 || columnas === 1) coste += 1.5;
      if (mejor === null || coste < mejor.coste) {
        mejor = { filas, columnas, pares, coste };
      }
    }
  }

  // Fallback imposible en la práctica (rango con al menos 1 par siempre
  // factoriza: 1×2). Protege contra rangos inválidos.
  if (mejor === null) return { filas: 2, columnas: 2, pares: 2 };
  return { filas: mejor.filas, columnas: mejor.columnas, pares: mejor.pares };
}

/** Niveles de dificultad: rango de pares por nivel. */
export const DIFICULTAD = {
  facil: { paresMin: 5, paresMax: 6, etiqueta: 'Fácil (10-12)' },
  normal: { paresMin: 8, paresMax: 10, etiqueta: 'Normal (16-20)' },
  dificil: { paresMin: 12, paresMax: 15, etiqueta: 'Difícil (24-30)' },
};
