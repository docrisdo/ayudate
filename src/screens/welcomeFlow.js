import { routeProgress } from './routeModel.js'

export function visualPreferences(stored) {
  return { largeText: stored?.largeText === true, highContrast: stored?.highContrast === true }
}

export function homeContext(list, products, cart) {
  if (!list) return 'No tienes una lista activa. Selecciona una para comenzar tu compra.'
  if (!products.length) return `Tu lista ${list.name} está vacía. Agrega productos para comenzar tu compra.`
  const { count, total } = routeProgress(products, list, cart)
  const pending = total - count
  return `Tu lista ${list.name} tiene ${total} ${total === 1 ? 'producto' : 'productos'}. ${pending ? `Te ${pending === 1 ? 'queda' : 'quedan'} ${pending} por recoger.` : 'Has recogido todos los productos de tu lista.'}`
}
