export const normalizeCommand = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[¿?¡!.,;:]/g, '').replace(/\s+/g, ' ').trim()

export function parseVoiceCommand(value) {
  const text = normalizeCommand(value)
  const commands = {
    'si': 'yes', 'si continuar': 'yes', 'confirmar': 'yes', 'no': 'no',
    'cancelar': 'cancel', 'detener escucha': 'cancel',
    'que puedo decir': 'help', 'que comandos hay': 'help', 'ayuda de voz': 'help',
    'leer': 'readScreen', 'leer pantalla': 'readScreen',
    'pausar lectura': 'pause', 'pausa la lectura': 'pause',
    'reanudar lectura': 'resume', 'reanuda la lectura': 'resume',
    'detener lectura': 'stop', 'deten la lectura': 'stop',
    'leer producto': 'readProduct', 'agregar al carrito': 'addCart',
    'agregar a mi carrito': 'addCart', 'agregar a mi lista': 'addList', 'agregar a lista': 'addList',
    'ver ubicacion': 'location', 'leer carrito': 'readCart', 'vaciar carrito': 'clearCart',
    'vaciar mi carrito': 'clearCart', 'notificar al personal': 'notify', 'volver': 'back',
  }
  if (commands[text]) return { type: commands[text] }
  const assistance = {
    'no encuentro un producto': 'find', 'necesito ayuda para desplazarme': 'move',
    'necesito ayuda en caja': 'cashier', 'quiero hablar con un empleado': 'talk',
    'otra ayuda': 'other',
  }
  if (assistance[text]) return { type: 'assistance', id: assistance[text] }
  const destination = text.replace(/^(?:abrir|abre|ir a|ir al|ir a la|muestrame|mostrar)\s+/, '').replace(/^(?:mi|mis|el|la|las)\s+/, '')
  const screens = { inicio: 'home', listas: 'lists', 'buscar producto': 'search', ruta: 'route', presupuesto: 'budget', carrito: 'cart', 'solicitar asistencia': 'help', 'necesito ayuda': 'help', accesibilidad: 'accessibility' }
  if (screens[destination]) return { type: 'navigate', screen: screens[destination] }
  const selection = text.match(/^selecciona(?:r)? (?:el )?(primer|segundo|tercer) producto$/)
  if (selection) return { type: 'selectProduct', index: ['primer', 'segundo', 'tercer'].indexOf(selection[1]) }
  const search = text.match(/^(?:buscar|busca)\s+(.+)$/)
  if (search) return { type: 'search', query: search[1] }
  return { type: 'unknown' }
}

export const voiceExamples = {
  Navegar: ['Ir a inicio', 'Abrir mis listas', 'Buscar producto', 'Abrir mi carrito', 'Volver'],
  Buscar: ['Buscar leche', 'Buscar arroz', 'Seleccionar primer producto', 'Agregar al carrito', 'Ver ubicación'],
  Lectura: ['Leer pantalla', 'Pausar lectura', 'Reanudar lectura', 'Detener lectura'],
  Asistencia: ['Necesito ayuda', 'Necesito ayuda en caja', 'Notificar al personal'],
}
