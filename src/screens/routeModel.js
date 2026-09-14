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

// Accessible geometry follows an outer corridor, with short access branches.
// Distances below are positions on the existing illustrative map, not real meters.
export function accessibleZonePath(zoneNames) {
  const zones = zoneNames.map(name => mapZones.find(zone => zone.id === name)).filter(Boolean)
  if (!zones.length) return ''
  const side = 93, perimeter = side * 4
  const pointAt = distance => {
    const d = ((distance % perimeter) + perimeter) % perimeter
    if (d < side) return [5, 95 - d]
    if (d < side * 2) return [5 + d - side, 2]
    if (d < side * 3) return [98, 2 + d - side * 2]
    return [98 - (d - side * 3), 95]
  }
  let distance = side * 3 + 98 - 53.5 // Entrance, along the bottom corridor.
  const points = [pointAt(distance)]
  for (const zone of zones) {
    const center = [zone.x + zone.width / 2, zone.y + zone.height / 2]
    const [x, y] = center
    const accessX = zone.id === 'Limpieza' ? 37 : x
    let target = x < 35 ? 95 - y : y < 30 ? side + x - 5 : x > 70 ? side * 2 + y - 2 : side * 3 + 98 - accessX
    while (target < distance) target += perimeter
    for (let corner = (Math.floor(distance / side) + 1) * side; corner < target; corner += side) points.push(pointAt(corner))
    const access = pointAt(target)
    points.push(access)
    if (zone.id === 'Limpieza') points.push([accessX, y])
    points.push(center)
    if (zone.id !== 'Caja') {
      if (zone.id === 'Limpieza') points.push([accessX, y])
      points.push(access)
    }
    distance = target
  }
  return points.map(([x,y], index) => `${index ? 'L' : 'M'} ${x} ${y}`).join(' ')
}

// Simulated broad-corridor itinerary: follow the perimeter before the central
// cleaning zone. Uses the existing supermarket map, not live obstacle detection.
const accessibleZoneOrder = ['Higiene personal', 'Panadería', 'Frutas', 'Lácteos', 'Cereales', 'Abarrotes', 'Carnes', 'Bebidas', 'Limpieza']
export function comfortableRoute(products, enabled) {
  if (!enabled) return products
  const zones = [...accessibleZoneOrder, ...new Set(products.map(product => product.category).filter(zone => !accessibleZoneOrder.includes(zone)))]
  return zones.flatMap(zone => products.filter(product => product.category === zone))
}

export function routeStepContext(products, index) {
  if (!products.length) return 'Selecciona una lista con productos para comenzar el recorrido.'
  const product = products[Math.max(0, Math.min(index - 1, products.length))]
  if (!product) return 'Llegaste al final de las paradas. Continúa a caja y revisa los productos pendientes.'
  return `Siguiente producto: ${product.name}${product.unit ? `, ${product.unit}` : ''}. Zona ${product.category}. Pasillo ${product.aisle}.${product.available === false ? ' Actualmente está agotado.' : ''}`
}
