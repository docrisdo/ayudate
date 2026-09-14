import { useId } from 'react'
import { mapZones, zonePath, accessibleZonePath, physicalStops } from './routeModel.js'

// Presentation only: round the existing polyline without moving its stops.
function polishedTrace(path) {
  const points = [...path.matchAll(/[ML] ([\d.]+) ([\d.]+)/g)].map(match => [Number(match[1]), Number(match[2])])
  const centers = mapZones.map(zone => [zone.x + zone.width / 2, zone.y + zone.height / 2])
  const distance = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1])
  const towards = (a, b, amount) => a.map((value, axis) => value + (b[axis] - value) * amount / distance(a, b))
  const arrows = []
  if (!points.length) return { path, arrows }
  let rounded = `M ${points[0].join(' ')}`
  points.slice(1).forEach((point, offset) => {
    const index = offset + 1
    const previous = points[index - 1], next = points[index + 1]
    const isStop = centers.some(center => center.every((value, axis) => value === point[axis]))
    const radius = next && !isStop ? Math.min(2.5, distance(previous, point) / 3, distance(point, next) / 3) : 0
    if (radius) {
      rounded += ` L ${towards(point, previous, radius).join(' ')} Q ${point.join(' ')} ${towards(point, next, radius).join(' ')}`
    } else rounded += ` L ${point.join(' ')}`
    // Place a single direction arrow on long, exposed straight sections,
    // away from bends and the labels covering the physical stops.
    const length = distance(previous, point)
    const middle = previous.map((value, axis) => (value + point[axis]) / 2)
    const covered = mapZones.some(zone => middle[0] >= zone.x - 1 && middle[0] <= zone.x + zone.width + 1 && middle[1] >= zone.y - 1 && middle[1] <= zone.y + zone.height + 1)
    if (length >= 12 && !covered) arrows.push(`M ${towards(middle, previous, 0.6).join(' ')} L ${middle.join(' ')}`)
  })
  return { path: rounded, arrows }
}

export default function RouteMap({ accessibleRoute = false, pictograms = true, products, currentZone, foundIds, onZone }) {
  const zoneNames = physicalStops(products).map(stop => stop.zone)
  const arrowId = useId()
  const originalPath = accessibleRoute ? accessibleZonePath(zoneNames) : zonePath(zoneNames)
  const { path, arrows } = accessibleRoute ? polishedTrace(originalPath) : { path: originalPath, arrows: [] }
  return <div className="rt-map" aria-label="Mapa del supermercado; selecciona una zona para ver sus productos">
    <div className="rt-shelves" aria-hidden="true">{Array.from({ length: 36 }, (_, index) => <span key={index} />)}</div>
    <div className="rt-map-boundary" aria-hidden="true" />
    <svg className={`rt-map-path${accessibleRoute ? ' rt-map-path--accessible' : ''}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs><marker id={arrowId} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="2" markerHeight="2" markerUnits="userSpaceOnUse" orient="auto"><polygon points="0,0 10,5 0,10 3,5" fill="#07539a" /></marker></defs>
      <path className="rt-path-base" d={path} /><path d={path} />
      {arrows.map((arrow, index) => <path key={index} className="rt-path-arrow" d={arrow} markerEnd={`url(#${arrowId})`} />)}
    </svg>
    {mapZones.filter(zone => !zone.optional || zoneNames.includes(zone.id)).map(zone => {
      const members = products.filter(product => product.category === zone.id)
      const completed = members.length > 0 && members.every(product => foundIds.includes(product.id))
      const order = zoneNames.indexOf(zone.id)
      const current = zone.id === currentZone
      return <button type="button" key={zone.id} className={`rt-zone rt-zone--${zone.tone} ${completed ? 'is-complete' : ''} ${current ? 'is-current' : ''}`}
        style={{ '--zone-left': `${zone.x}%`, '--zone-top': `${zone.y}%`, '--zone-width': `${zone.width}%`, '--zone-height': `${zone.height}%` }}
        aria-label={`${zone.id}${current ? ', zona actual' : completed ? ', zona completada' : order >= 0 ? ', zona pendiente' : ', sin productos en tu lista'}`}
        aria-pressed={current} onClick={() => onZone(zone.id)} disabled={order < 0}>
        {pictograms && <img src={zone.pictogram ? `/assets/pictograms/svg/${zone.pictogram}.svg` : `/assets/icons/svg/${zone.icon}.svg`} alt="" />}
        <span>{order >= 0 && <b>{completed ? '✓' : order + 1}</b>}<strong>{zone.id}</strong></span>
      </button>
    })}
    <div className="rt-entrance"><img src="/assets/icons/svg/icon-flecha-derecha.svg" alt="" /><strong>Entrada</strong></div>
  </div>
}
