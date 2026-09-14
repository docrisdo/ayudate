import { test } from 'node:test'
import assert from 'node:assert/strict'
import { guidanceContext } from './guidanceContext.js'

test('only screens with contextual accompaniment receive entry guidance', () => {
  for (const screen of ['home', 'lists', 'new-list', 'search', 'route', 'budget', 'cart', 'help']) assert.ok(guidanceContext(screen))
  for (const screen of ['welcome', 'accessibility', 'unknown']) assert.equal(guidanceContext(screen), '')
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

test('every contextual introduction starts with its screen name exactly once', () => {
  const labels = {home:'Inicio',lists:'Mis listas','new-list':'Nueva lista',search:'Buscar producto',route:'Mi ruta',budget:'Presupuesto',cart:'Mi carrito',help:'Solicitar asistencia'}
  for (const [screen,label] of Object.entries(labels)) {
    const message = guidanceContext(screen)
    assert.ok(message.startsWith(`${label}. `), message)
    assert.equal(message.split(`${label}.`).length - 1, 1)
  }
})
test('home and lists introductions use actual lists and remaining quantities', () => {
  const list = {name:'Semanal',quantities:{1:2,2:1}}
  assert.equal(guidanceContext('home',{list,products:[{id:1},{id:2}],cart:{1:1,2:1}}), 'Inicio. Tu lista Semanal tiene 2 productos. Te queda 1 por recoger.')
  assert.match(guidanceContext('home'), /^Inicio\. Desde aquí puedes organizar/)
  assert.equal(guidanceContext('lists',{lists:[{},{}]}), 'Mis listas. Tienes 2 listas guardadas.')
  assert.equal(guidanceContext('lists',{lists:[{}]}), 'Mis listas. Tienes 1 lista guardada.')
  assert.match(guidanceContext('lists',{lists:[]}), /^Mis listas\. Aquí puedes/)
})
