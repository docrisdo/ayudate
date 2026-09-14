import { test } from 'node:test'
import assert from 'node:assert/strict'
import { guidanceContext } from './guidanceContext.js'

test('only stage two screens receive entry guidance', () => {
  for (const screen of ['lists', 'new-list', 'search', 'route', 'budget', 'cart', 'help']) assert.ok(guidanceContext(screen))
  for (const screen of ['welcome', 'accessibility', 'home', 'unknown']) assert.equal(guidanceContext(screen), '')
})
test('route context follows the displayed order and handles empty and final stops', () => {
  const products = [{name:'Leche',unit:'1 L',category:'Lácteos',aisle:3}, {name:'Pan',category:'Panadería'}, {name:'Huevos',unit:'12 piezas',category:'Lácteos',aisle:3}]
  assert.match(guidanceContext('route', {products,routeIndex:2,accessibleRoute:true}), /Huevos, 12 piezas.*Lácteos.*3/)
  assert.match(guidanceContext('route', {products,routeIndex:4}), /Llegaste a caja/)
  assert.match(guidanceContext('route'), /Selecciona una lista/)
})
test('budget and cart use shared cent calculations and distinguish products from units', () => {
  const data = {items:[{price:10.15,quantity:3},{price:5,quantity:2}], budget:50}
  assert.match(guidanceContext('budget',data), /40.45 pesos.*9.55 pesos/)
  assert.match(guidanceContext('cart',data), /2 productos, 5 unidades.*40.45 pesos/)
  assert.match(guidanceContext('budget',{...data,budget:30}), /superado.*10.45 pesos/)
  assert.match(guidanceContext('cart'), /vacío/)
})
