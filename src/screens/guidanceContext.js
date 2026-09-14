import { budgetSummary } from './budgetModel.js'
import { comfortableRoute } from './routeModel.js'

const introductions = {
  lists: 'Mis listas. Aquí puedes abrir una lista guardada, crear una nueva o iniciar una compra.',
  'new-list': 'Nueva lista. Agrega los productos que necesitas y guarda tu lista cuando termines.',
  search: 'Buscar producto. Escribe el producto que necesitas para consultar precio, disponibilidad y ubicación.',
  help: 'Solicitar asistencia. Selecciona el tipo de ayuda que necesitas.',
}
const amount = value => new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 }).format(value)

// One snapshot on entry, never a subscription to every small cart or field change.
export function guidanceContext(screen, { products = [], routeIndex = 1, accessibleRoute = false, items = [], budget = 0 } = {}) {
  if (screen === 'route') {
    if (!products.length) return 'Mi ruta. Selecciona una lista con productos para comenzar el recorrido.'
    const route = comfortableRoute(products, accessibleRoute)
    const product = route[Math.max(0, Math.min(routeIndex - 1, route.length))]
    return product
      ? `Mi ruta. Siguiente producto: ${product.name}, ${product.unit}. Zona ${product.category}. Pasillo ${product.aisle}.`
      : 'Mi ruta. Llegaste a caja. Revisa tu carrito y los productos pendientes antes de terminar.'
  }
  if (screen === 'budget' || screen === 'cart') {
    const summary = budgetSummary(budget, items)
    if (screen === 'budget') return `Presupuesto. Has gastado ${amount(summary.total)} pesos. ${summary.remaining < 0 ? `Has superado tu presupuesto por ${amount(-summary.remaining)} pesos.` : `Te quedan ${amount(summary.remaining)} pesos.`}`
    const count = summary.rows.length
    const units = summary.rows.reduce((sum, item) => sum + item.quantity, 0)
    return count ? `Mi carrito. Tienes ${count} ${count === 1 ? 'producto' : 'productos'}, ${units} ${units === 1 ? 'unidad' : 'unidades'}. Total: ${amount(summary.total)} pesos.` : 'Mi carrito. Tu carrito está vacío. Agrega productos para comenzar tu compra.'
  }
  return introductions[screen] || ''
}
