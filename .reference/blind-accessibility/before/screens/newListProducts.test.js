import { test } from 'node:test'
import assert from 'node:assert/strict'
import { addQuantities, findProducts, recognizeProducts } from './newListProducts.js'

const catalog = [{ id: 1, name: 'Leche deslactosada', category: 'Lácteos', brand: 'Selecta' }, { id: 9, name: 'Jabón para ropa', category: 'Limpieza', brand: 'Brillo' }]
test('reconoce acentos, cantidades y conserva las líneas desconocidas', () => {
  assert.deepEqual(recognizeProducts(catalog, '2 x leche\r\njabon\nProducto desconocido'), {
    recognized: [{ id: 1, quantity: 2 }, { id: 9, quantity: 1 }], unresolved: ['Producto desconocido'], error: '',
  })
})
test('no selecciona automáticamente coincidencias ambiguas', () => {
  const more = [...catalog, { id: 2, name: 'Leche entera', category: 'Lácteos', brand: 'Otra' }]
  assert.equal(findProducts(more, 'LECHE').length, 2)
  assert.deepEqual(recognizeProducts(more, 'leche').unresolved, ['leche'])
})
test('agrupa duplicados sin mutar cantidades y limita a 99', () => {
  const previous = { 1: 2 }
  assert.deepEqual(addQuantities(previous, [{ id: 1, quantity: 3 }, { id: 9, quantity: 100 }]), { 1: 5, 9: 99 })
  assert.deepEqual(previous, { 1: 2 })
})
test('rechaza exceso de líneas y cantidades fuera de rango', () => {
  assert.ok(recognizeProducts(catalog, Array(51).fill('leche').join('\n')).error)
  assert.deepEqual(recognizeProducts(catalog, '0 x leche\n100 x jabon').unresolved, ['0 x leche', '100 x jabon'])
})
