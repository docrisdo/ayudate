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

// Group each zone to avoid return visits; physical obstacles are not detected.
export function comfortableRoute(products, enabled) {
  if (!enabled) return products
  const zones = [...new Set(products.map(product => product.category))]
  return zones.flatMap(zone => products.filter(product => product.category === zone))
}
