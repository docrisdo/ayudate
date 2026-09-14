export function requiredQuantity(list, productId) {
  return Math.max(1, Number(list?.quantities?.[productId]) || 1)
}

export function routeProgress(products, list, cart) {
  const found = products.filter(product => (cart[product.id] || 0) >= requiredQuantity(list, product.id))
  return { foundIds: found.map(product => product.id), count: found.length, total: products.length, percent: products.length ? Math.round(found.length / products.length * 100) : 0 }
}

export function locateZone(products, zone, foundIds) {
  const pending = products.findIndex(product => product.category === zone && !foundIds.includes(product.id))
  return (pending >= 0 ? pending : products.findIndex(product => product.category === zone)) + 1
}

export function nextZones(products, index) {
  const current = products[index - 1]?.category
  return [...new Set(products.slice(index).map(product => product.category))].filter(zone => zone !== current).slice(0, 2)
}

export const mapZones = [
  { id: 'Frutas', icon: 'icon-frutas', x: 13, y: 5, width: 22, height: 21, tone: 'fruit' },
  { id: 'Lácteos', icon: 'icon-botella-lacteos', x: 40, y: 5, width: 27, height: 21, tone: 'dairy' },
  { id: 'Cereales', pictogram: 'pictograma-cereales', x: 70, y: 5, width: 25, height: 21, tone: 'cereal' },
  { id: 'Panadería', icon: 'icon-pan', x: 13, y: 32, width: 22, height: 17, tone: 'cereal', optional: true },
  { id: 'Abarrotes', pictogram: 'pictograma-abarrotes', x: 76, y: 36, width: 19, height: 23, tone: 'grocery' },
  { id: 'Limpieza', icon: 'icon-limpieza', x: 40, y: 41, width: 23, height: 22, tone: 'clean' },
  { id: 'Carnes', icon: 'icon-carne', x: 72, y: 66, width: 23, height: 16, tone: 'clean', optional: true },
  { id: 'Bebidas', icon: 'icon-bebidas', x: 40, y: 67, width: 25, height: 15, tone: 'dairy', optional: true },
  { id: 'Higiene personal', icon: 'icon-higiene', x: 13, y: 52, width: 22, height: 15, tone: 'grocery', optional: true },
  { id: 'Caja', icon: 'icon-carrito', x: 12, y: 71, width: 23, height: 21, tone: 'fruit' },
]

export function zonePath(zoneNames) {
  const centers = zoneNames.map(name => mapZones.find(zone => zone.id === name)).filter(Boolean).map(zone => [zone.x + zone.width / 2, zone.y + zone.height / 2])
  return centers.map(([x, y], index) => {
    if (!index) return `M ${x} ${y}`
    const [, prevY] = centers[index - 1]
    return Math.abs(prevY - y) < 3 ? `L ${x} ${y}` : `L ${x} ${prevY} L ${x} ${y}`
  }).join(' ')
}

// Distance along the exterior corridor from Entrada: bottom-right, right,
// top, then left. Geometry, rather than category names, determines stop order.
const corridor = { left: 5, right: 98, top: 2, bottom: 95, entranceX: 53.5 }
const firstCorner = corridor.right - corridor.entranceX
const sideLength = corridor.bottom - corridor.top
function corridorPoint(distance) {
  if (distance <= firstCorner) return [corridor.entranceX + distance, corridor.bottom]
  if (distance <= firstCorner + sideLength) return [corridor.right, corridor.bottom - (distance - firstCorner)]
  if (distance <= firstCorner + 2 * sideLength) return [corridor.right - (distance - firstCorner - sideLength), corridor.top]
  return [corridor.left, corridor.top + distance - firstCorner - 2 * sideLength]
}
function zoneAccess(zone) {
  const x = zone.x + zone.width / 2, y = zone.y + zone.height / 2
  const candidates = [
    { distance: x - corridor.left, at: firstCorner + 2 * sideLength + y - corridor.top, span: zone.height / 3, start: firstCorner + 2 * sideLength, end: firstCorner + 3 * sideLength },
    { distance: corridor.right - x, at: firstCorner + corridor.bottom - y, span: zone.height / 3, start: firstCorner, end: firstCorner + sideLength },
    { distance: y - corridor.top, at: firstCorner + sideLength + corridor.right - x, span: zone.width / 3, start: firstCorner + sideLength, end: firstCorner + 2 * sideLength },
  ]
  const access = candidates.sort((a,b) => a.distance - b.distance)[0]
  return { ...access, center: [x,y] }
}
export function physicalStops(products) {
  return [...new Set(products.map(product => product.category))].filter(zone => zone !== 'Caja')
    .map(zone => ({ zone, products: products.filter(product => product.category === zone) }))
    .concat({ zone: 'Caja', products: [] })
}
export function comfortableRoute(products, enabled) {
  if (!enabled) return products
  const zones = physicalStops(products).filter(stop => stop.products.length)
  zones.sort((a,b) => {
    const first = mapZones.find(zone => zone.id === a.zone), second = mapZones.find(zone => zone.id === b.zone)
    return (first ? zoneAccess(first).at : Infinity) - (second ? zoneAccess(second).at : Infinity)
  })
  return zones.flatMap(stop => stop.products)
}
// Each stop has separate arrival/departure ports. No retraced access spur,
// wrap-around loop, or unused final side of a rectangle is drawn.
export function accessibleZonePath(zoneNames) {
  const zones = [...new Set(zoneNames)].filter(name => name !== 'Caja')
    .map(name => mapZones.find(zone => zone.id === name)).filter(Boolean)
    .sort((a,b) => zoneAccess(a).at - zoneAccess(b).at)
  if (!zoneNames.length) return ''
  const accesses = [...zones, mapZones.find(zone => zone.id === 'Caja')].map(zoneAccess)
  const points = [corridorPoint(0)]
  let position = 0
  const corners = [firstCorner, firstCorner + sideLength, firstCorner + 2 * sideLength]
  accesses.forEach((access,index) => {
    const previous = accesses[index - 1]?.at ?? 0
    const next = accesses[index + 1]?.at ?? access.end
    const span = Math.max(0, Math.min(access.span, (access.at - previous) / 3, (next - access.at) / 3, access.at - access.start, access.end - access.at))
    const arrival = access.at - span, departure = access.at + span
    corners.filter(corner => corner > position && corner < arrival).forEach(corner => points.push(corridorPoint(corner)))
    points.push(corridorPoint(arrival), access.center)
    if (index < accesses.length - 1) points.push(corridorPoint(departure))
    position = departure
  })
  return points.map(([x,y],index) => `${index ? 'L' : 'M'} ${x} ${y}`).join(' ')
}

export function routeStepContext(products, index) {
  if (!products.length) return 'Selecciona una lista con productos para comenzar el recorrido.'
  const product = products[Math.max(0, Math.min(index - 1, products.length))]
  if (!product) return 'Llegaste al final de las paradas. Continúa a caja y revisa los productos pendientes.'
  return `Siguiente producto: ${product.name}${product.unit ? `, ${product.unit}` : ''}. Zona ${product.category}. Pasillo ${product.aisle}.${product.available === false ? ' Actualmente está agotado.' : ''}`
}
