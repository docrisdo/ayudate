import { test } from 'node:test'
import assert from 'node:assert/strict'
import { milkProducts, additionalProducts, searchCatalog, productSpeech, missingProductPhotos } from './searchProducts.js'
import { existsSync } from 'node:fs'

test('las categorías nuevas tienen dos productos localizables por nombre', () => {
  for (const category of ['Carnes', 'Bebidas', 'Higiene personal']) {
    assert.equal(searchCatalog(additionalProducts, '', category).length, 2)
  }
  for (const product of additionalProducts) {
    assert.ok(searchCatalog(additionalProducts, product.name, 'Todos').some(item => item.id === product.id))
    assert.ok(existsSync(`public${product.image}`))
  }
  for (const image of Object.values(missingProductPhotos)) assert.ok(existsSync(`public${image}`))
})

test('la lectura compartida incluye todos los datos principales y disponibilidad', () => {
  const product = additionalProducts[0]
  const speech = productSpeech(product)
  for (const value of [product.name, product.unit, product.category, String(product.aisle), product.price.toFixed(2), 'Disponible']) assert.ok(speech.includes(value))
  assert.ok(productSpeech({ ...product, available: false }).includes('Agotado'))
  assert.ok(productSpeech(milkProducts[0]).includes('LALA'))
})

test('encuentra las cuatro presentaciones y busca por marca y pasillo', () => {
  assert.equal(searchCatalog(milkProducts, 'LECHE', 'Todos').length, 4)
  assert.deepEqual(searchCatalog(milkProducts, 'santa clara', 'Todos').map(p => p.id), [14])
  assert.equal(searchCatalog(milkProducts, 'pasillo 3', 'Todos').length, 4)
  assert.equal(searchCatalog(milkProducts, 'lacteos', 'Todos').length, 4)
})
test('filtra por categoría y maneja resultados vacíos', () => {
  assert.equal(searchCatalog(milkProducts, 'leche', 'Frutas').length, 0)
  assert.equal(searchCatalog(milkProducts, 'inexistente', 'Todos').length, 0)
})
test('ordena precios sin alterar el catálogo', () => {
  assert.deepEqual(searchCatalog(milkProducts, '', 'Todos', 'price-up').map(p => p.price), [31, 32, 33.5, 89])
  assert.deepEqual(searchCatalog(milkProducts, '', 'Todos', 'price-down').map(p => p.price), [89, 33.5, 32, 31])
  assert.deepEqual(milkProducts.map(p => p.id), [13, 14, 15, 16])
})

test('los códigos de ejemplo son EAN-13 únicos con dígito de control válido', () => {
  const codes = milkProducts.map(product => product.barcode)
  assert.equal(new Set(codes).size, codes.length)
  for (const code of codes) {
    assert.match(code, /^[0-9]{13}$/)
    const sum = [...code.slice(0, 12)].reduce((total, digit, index) => total + Number(digit) * (index % 2 ? 3 : 1), 0)
    assert.equal(Number(code[12]), (10 - sum % 10) % 10)
  }
})
