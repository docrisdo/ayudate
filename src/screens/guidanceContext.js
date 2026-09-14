import { homeContext } from './welcomeFlow.js'
import { budgetSummary } from './budgetModel.js'
import { comfortableRoute, routeStepContext } from './routeModel.js'

const introductions = {
  lists: 'Mis listas. Aquí puedes abrir una lista guardada, crear una nueva o iniciar una compra.',
  'new-list': 'Nueva lista. Agrega los productos que necesitas y guarda tu lista cuando termines.',
  search: 'Buscar producto. Escribe el producto que necesitas para consultar precio, disponibilidad y ubicación.',
  help: 'Solicitar asistencia. Selecciona el tipo de ayuda que necesitas.',
}
const amount = value => new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 }).format(value)

// One snapshot on entry, never a subscription to every small cart or field change.
export function guidanceContext(screen, { list, lists = [], cart = {}, products = [], routeIndex = 1, accessibleRoute = false, items = [], budget = 0 } = {}) {
  if (screen === 'home') return list
    ? `Inicio. ${homeContext(list, products, cart)}`
    : 'Inicio. Desde aquí puedes organizar tus listas, buscar productos, consultar tu ruta, presupuesto, carrito o solicitar asistencia.'
  if (screen === 'lists' && lists.length) return `Mis listas. Tienes ${lists.length} ${lists.length === 1 ? 'lista guardada' : 'listas guardadas'}.`
  if (screen === 'route') return `Mi ruta. ${accessibleRoute ? 'Ruta accesible activada. ' : ''}${routeStepContext(comfortableRoute(products, accessibleRoute), routeIndex)}`
  if (screen === 'budget' || screen === 'cart') {
    const summary = budgetSummary(budget, items)
    if (screen === 'budget') return `Presupuesto. Has gastado ${amount(summary.total)} pesos. ${summary.remaining < 0 ? `Has superado tu presupuesto por ${amount(-summary.remaining)} pesos.` : `Te quedan ${amount(summary.remaining)} pesos.`}`
    const count = summary.rows.length
    const units = summary.rows.reduce((sum, item) => sum + item.quantity, 0)
    return count ? `Mi carrito. Tienes ${count} ${count === 1 ? 'producto' : 'productos'}, ${units} ${units === 1 ? 'unidad' : 'unidades'}. Total: ${amount(summary.total)} pesos.` : 'Mi carrito. Tu carrito está vacío. Agrega productos para comenzar tu compra.'
  }
  return introductions[screen] || ''
}
