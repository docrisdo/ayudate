import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseVoiceCommand } from './voiceCommandParser.js'

test('normaliza navegación natural y acentos sin aceptar frases destructivas ambiguas', () => {
  for (const text of ['Mi carrito', 'Abrir mi carrito', 'Ir al carrito', 'Muéstrame el carrito']) assert.deepEqual(parseVoiceCommand(text), { type:'navigate', screen:'cart' })
  assert.deepEqual(parseVoiceCommand('¿QUÉ PUEDO DECIR?'), { type:'help' })
  assert.deepEqual(parseVoiceCommand('Busca papel higiénico'), { type:'search', query:'papel higienico' })
  assert.deepEqual(parseVoiceCommand('No vaciar carrito'), { type:'unknown' })
  assert.deepEqual(parseVoiceCommand('Vaciar carrito'), { type:'clearCart' })
  assert.deepEqual(parseVoiceCommand('Sí'), { type:'yes' })
})
test('separa productos, lectura y asistencia de la búsqueda genérica', () => {
  assert.deepEqual(parseVoiceCommand('Buscar producto'), { type:'navigate', screen:'search' })
  assert.deepEqual(parseVoiceCommand('Buscar leche'), { type:'search', query:'leche' })
  assert.deepEqual(parseVoiceCommand('Seleccionar primer producto'), { type:'selectProduct', index:0 })
  assert.deepEqual(parseVoiceCommand('Necesito ayuda para desplazarme'), { type:'assistance', id:'move' })
  for (const [text,type] of [['Leer pantalla','readScreen'],['Pausar lectura','pause'],['Reanudar lectura','resume'],['Detener lectura','stop'],['Agregar al carrito','addCart'],['Notificar al personal','notify']]) assert.equal(parseVoiceCommand(text).type,type)
})
