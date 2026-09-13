import { mapZones, zonePath } from './routeModel.js'

export default function RouteMap({ products, currentZone, foundIds, onZone }) {
  const zoneNames = [...new Set(products.map(product => product.category)), 'Caja']
  const path = zonePath(zoneNames)
  return <div className="rt-map" aria-label="Mapa del supermercado; selecciona una zona para ver sus productos">
    <div className="rt-shelves" aria-hidden="true">{Array.from({ length: 36 }, (_, index) => <span key={index} />)}</div>
    <div className="rt-map-boundary" aria-hidden="true" />
    <svg className="rt-map-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path className="rt-path-base" d={path} /><path d={path} /></svg>
    {mapZones.filter(zone => !zone.optional || zoneNames.includes(zone.id)).map(zone => {
      const members = products.filter(product => product.category === zone.id)
      const completed = members.length > 0 && members.every(product => foundIds.includes(product.id))
      const order = zoneNames.indexOf(zone.id)
      const current = zone.id === currentZone
      return <button type="button" key={zone.id} className={`rt-zone rt-zone--${zone.tone} ${completed ? 'is-complete' : ''} ${current ? 'is-current' : ''}`}
        style={{ '--zone-left': `${zone.x}%`, '--zone-top': `${zone.y}%`, '--zone-width': `${zone.width}%`, '--zone-height': `${zone.height}%` }}
        aria-label={`${zone.id}${current ? ', zona actual' : completed ? ', zona completada' : order >= 0 ? ', zona pendiente' : ', sin productos en tu lista'}`}
        aria-pressed={current} onClick={() => onZone(zone.id)} disabled={order < 0}>
        <img src={zone.pictogram ? `/assets/pictograms/svg/${zone.pictogram}.svg` : `/assets/icons/svg/${zone.icon}.svg`} alt="" />
        <span>{order >= 0 && <b>{completed ? '✓' : order + 1}</b>}<strong>{zone.id}</strong></span>
      </button>
    })}
    <div className="rt-entrance"><img src="/assets/icons/svg/icon-flecha-derecha.svg" alt="" /><strong>Entrada</strong></div>
  </div>
}
