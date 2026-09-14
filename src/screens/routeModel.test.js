import { test } from 'node:test'
import assert from 'node:assert/strict'
import { requiredQuantity, routeProgress, locateZone, nextZones, mapZones, zonePath } from './routeModel.js'

const products = [{ id: 5, category: 'Frutas' }, { id: 1, category: 'Lácteos' }, { id: 12, category: 'Lácteos' }, { id: 17, category: 'Carnes' }, { id: 19, category: 'Bebidas' }, { id: 21, category: 'Higiene personal' }]
test('el progreso cuenta productos completos y respeta las cantidades', () => {
  const list = { quantities: { 1: 2 } }
  assert.equal(requiredQuantity(list, 12), 1)
  assert.deepEqual(routeProgress(products, list, { 5: 1, 1: 1 }), { foundIds: [5], count: 1, total: 6, percent: 17 })
  assert.equal(routeProgress(products, list, { 5: 1, 1: 2 }).count, 2)
  assert.equal(routeProgress([], {}, {}).percent, 0)
})
test('seleccionar una zona encuentra su primer producto pendiente', () => {
  assert.equal(locateZone(products, 'Lácteos', [1]), 3)
  assert.equal(locateZone(products, 'Lácteos', [1, 12]), 2)
  assert.deepEqual(nextZones(products, 2), ['Carnes', 'Bebidas'])
})
test('el mapa contiene las categorías del catálogo ampliado y une las zonas', () => {
  for (const product of products) assert.ok(mapZones.some(zone => zone.id === product.category))
  const path = zonePath(['Frutas', 'Lácteos', 'Carnes', 'Caja'])
  assert.ok(path.startsWith('M '))
  assert.ok(!path.includes('NaN'))
  assert.equal(zonePath([]), '')
})

test('comfortable route groups zones without losing products or modifying the original list', async () => {
 const {comfortableRoute}=await import('./routeModel.js')
 const products=[{id:1,category:'A'},{id:2,category:'B'},{id:3,category:'A'}]
 assert.equal(comfortableRoute(products,false),products)
 assert.deepEqual(comfortableRoute(products,true).map(p=>p.id),[1,3,2])
 assert.deepEqual(products.map(p=>p.id),[1,2,3])
 assert.deepEqual(comfortableRoute([],true),[])
})

test('accessible perimeter strategy changes normal stops but preserves every product and state', async () => {
  const {comfortableRoute,routeStepContext}=await import('./routeModel.js')
  const products=[{id:5,name:'Manzanas',category:'Frutas',aisle:1},{id:11,name:'Pan',category:'Panadería',aisle:2},{id:1,name:'Leche',category:'Lácteos',aisle:3},{id:9,name:'Jabón',category:'Limpieza',aisle:7,available:false}]
  const route=comfortableRoute(products,true)
  assert.deepEqual(route.map(p=>p.id),[11,5,1,9])
  assert.deepEqual(comfortableRoute(products,false).map(p=>p.id),[5,11,1,9])
  assert.deepEqual([...route].sort((a,b)=>a.id-b.id),[...products].sort((a,b)=>a.id-b.id))
  assert.match(routeStepContext(route,4), /Jabón.*Limpieza.*7.*agotado/)
  assert.match(routeStepContext(route,5), /final.*caja.*pendientes/)
  assert.equal(routeProgress(route,{}, {11:1}).count,1)
})
