import { test } from 'node:test'
import assert from 'node:assert/strict'
import { visualPreferences, homeContext } from './welcomeFlow.js'
test('migration retains only visual preferences, never voice authorization', () => {
  assert.deepEqual(visualPreferences({largeText:true,highContrast:true,voice:true,autoRead:true,voiceCommands:true,accompaniment:true,bigButtons:true}),{largeText:true,highContrast:true})
  for (const invalid of [null, [], 'invalid', {largeText:'false',highContrast:1}]) assert.deepEqual(visualPreferences(invalid),{largeText:false,highContrast:false})
})
test('home context derives pending products from required quantities and actual cart', () => {
  const list={name:'Fin de semana',quantities:{1:2,2:1}}, products=[{id:1},{id:2}]
  assert.equal(homeContext(list,products,{1:1,2:1}),'Tu lista Fin de semana tiene 2 productos. Te queda 1 por recoger.')
  assert.equal(homeContext(list,products,{1:2,2:1}),'Tu lista Fin de semana tiene 2 productos. Has recogido todos los productos de tu lista.')
  assert.match(homeContext(null,products,{}),/No tienes una lista activa/)
  assert.match(homeContext(list,[],{}),/está vacía/)
})
