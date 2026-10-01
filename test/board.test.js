import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularTablero } from '../js/board.js';

const viewports = {
  movil: [390, 700],
  tablet: [820, 1000],
  desktop: [1100, 700],
  ultrawide: [1600, 600],
};

for (const [nombre, [W, H]] of Object.entries(viewports)) {
  test(`${nombre} ${W}x${H}: rectángulo lleno, par y proporcionado`, () => {
    const t = calcularTablero(W, H, 5, 15);
    // Rectángulo exacto, total par.
    assert.equal(t.filas * t.columnas, t.pares * 2);
    assert.ok((t.filas * t.columnas) % 2 === 0);
    // Dentro del rango pedido.
    assert.ok(t.pares >= 5 && t.pares <= 15);
    // Sin filas/columnas unitarias (tablero degenerado).
    assert.ok(t.filas >= 2 && t.columnas >= 2);
    // La celda no se distorsiona más de 2.2x respecto a la carta 4/5.
    const celda = W / t.columnas / (H / t.filas);
    assert.ok(Math.abs(Math.log(celda / 0.8)) < Math.log(2.2), `celda ${celda}`);
  });
}

test('móvil vertical: grid alto (filas >= columnas)', () => {
  const t = calcularTablero(390, 700, 5, 6);
  assert.ok(t.filas >= t.columnas);
});

test('desktop apaisado: grid ancho (columnas >= filas)', () => {
  const t = calcularTablero(1100, 700, 8, 10);
  assert.ok(t.columnas >= t.filas);
});

test('casos conocidos: 8 pares en desktop dan 4x4', () => {
  const t = calcularTablero(1100, 700, 8, 8);
  assert.deepEqual([t.filas, t.columnas, t.pares], [4, 4, 8]);
});
