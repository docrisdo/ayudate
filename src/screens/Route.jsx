import { useAnnounce } from '../components/accessibilityContext.js'
import ResponsiveHeader from '../components/ResponsiveHeader.jsx'
import { useVoiceScope } from '../components/voiceCommandContext.js'
import { productSpeech } from './searchProducts.js'
import { useRef, useState } from 'react'
import assets from '../../asset-manifest.json'
import { missingProductPhotos } from './searchProducts.js'
import { comfortableRoute, locateZone, nextZones, requiredQuantity, routeProgress } from './routeModel.js'
import RouteMap from './RouteMap.jsx'
import './Lists.css'
import './Route.css'

const navigation = [['home', 'Inicio'], ['lists', 'Mis listas'], ['search', 'Buscar producto'], ['route', 'Mi ruta'], ['budget', 'Presupuesto'], ['cart', 'Mi carrito']]
const photos = { 1: 'leche', 5: 'manzanas', 6: 'bananas', 7: 'arroz', 9: 'detergente', 10: 'papel-higienico', 11: 'pan', 12: 'huevos' }
function Icon({ name }) { return <img className="lists-icon" src={`/assets/icons/svg/${name}.svg`} alt="" aria-hidden="true" /> }

export default function Route({ list, products: originalProducts, accessibleRoute = false, pictograms = true, index, onIndex, cart, onFound, onRestore, onNavigate, onRead, voiceSupported }) {
  const products = comfortableRoute(originalProducts, accessibleRoute)
  const announce = useAnnounce()
  const [undo, setUndo] = useState(null)
  const [expandedProduct, setExpandedProduct] = useState(null)
  const detailRef = useRef(null)
  const progress = routeProgress(products, list, cart)
  const position = Math.max(1, Math.min(index, products.length + 1))
  const product = products[position - 1]
  const currentZone = product?.category || 'Caja'
  const found = product && progress.foundIds.includes(product.id)
  const pending = products.filter(item => !progress.foundIds.includes(item.id))
  const upcoming = nextZones(products, position)
  const image = product && (product.image || missingProductPhotos[product.id] || assets.products[photos[product.id]])
  const instruction = (accessibleRoute ? 'Ruta accesible: completa los productos de cada zona antes de continuar. Usa los pasillos principales y solicita asistencia si encuentras obstáculos. ' : '') + (product
    ? `Dirígete al pasillo ${product.aisle}, ${product.shelf.toLowerCase()}. El siguiente producto es ${product.name.toLowerCase()}.${!product.available ? ' Actualmente está agotado; puedes continuar a la siguiente parada.' : ''}`
    : pending.length ? `Llegaste a caja. Aún tienes ${pending.length} productos pendientes; puedes volver a revisarlos.` : 'Has localizado todos los productos. Dirígete a caja para revisar tu carrito.')

  function selectZone(zone) {
    onIndex(zone === 'Caja' ? products.length + 1 : locateZone(products, zone, progress.foundIds))
    requestAnimationFrame(() => {
      detailRef.current?.focus({ preventScroll: true })
      if (window.matchMedia('(max-width: 960px)').matches) detailRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
    })
  }
  function markFound() {
    if (!product || found || !product.available) return
    setUndo({ id: product.id, quantity: cart[product.id] || 0 })
    onFound(product.id, requiredQuantity(list, product.id))
    const next = products.slice(position).find(item => !progress.foundIds.includes(item.id))
    announce(`${product.name} marcado como encontrado. ${next ? `Siguiente producto del recorrido: ${next.name}, pasillo ${next.aisle}.` : 'No quedan paradas posteriores; puedes revisar los pendientes o ir a caja.'}`)
  }
  useVoiceScope('route', command => {
    if (!['readProduct', 'location', 'addCart'].includes(command.type)) return null
    if (!product) return { message: 'Primero selecciona un producto.' }
    if (command.type === 'readProduct') return { read: productSpeech(product) }
    if (command.type === 'location') { setExpandedProduct(product.id); return { read: instruction } }
    if (!product.available) return { message: 'Este producto está agotado.' }
    if (found) return { message: 'Este producto ya está localizado en tu carrito.' }
    markFound()
    return { message: 'Producto localizado y añadido al carrito.' }
  })
  return <div className="lists-screen rt-screen">
    <ResponsiveHeader active="route" onNavigate={onNavigate} onRead={() => onRead(`Tu ruta. ${progress.count} de ${progress.total} productos encontrados. ${products.map(item => `${item.name}, pasillo ${item.aisle}`).join('. ')}`)} voiceSupported={voiceSupported}><header className="lists-header"><div className="lists-header-inner">
      <button className="lists-brand" onClick={() => onNavigate('home')} aria-label="Ir al inicio de AYÚDATE"><img src={assets.branding.logo} alt="AYÚDATE" /></button>
      <nav className="lists-nav" aria-label="Navegación principal">{navigation.map(([id, label]) => <button key={id} aria-current={id === 'route' ? 'page' : undefined} onClick={() => onNavigate(id)}>{label}</button>)}</nav>
      <div className="lists-header-actions"><button disabled={!voiceSupported} onClick={() => onRead(`Tu ruta. ${progress.count} de ${progress.total} productos encontrados. ${products.map(item => `${item.name}, pasillo ${item.aisle}`).join('. ')}`)}><Icon name="nav-leer" />Leer</button><button onClick={() => onNavigate('accessibility')}><Icon name="nav-accesibilidad" />Accesibilidad</button><button className="lists-button" onClick={() => onNavigate('help')}><Icon name="nav-asistencia" />Solicitar asistencia</button></div>
    </div></header></ResponsiveHeader>
    <main className="rt-content" id="contenido-principal" tabIndex={-1}>
      <section className="rt-hero" aria-labelledby="rt-title"><div><h1 id="rt-title"><span className="a11y-sr-only">Mi ruta. </span>Tu <span>ruta</span></h1><p>{accessibleRoute ? 'Ruta accesible: paradas agrupadas por zona.' : 'Hemos organizado tu lista para reducir recorridos innecesarios.'}</p></div><div className="rt-banner" aria-hidden="true"><p>Compras más<br />simples, días<br />más fáciles ♡</p><img src={assets.illustrations.productos_frescos} alt="" /></div></section>
      {!products.length ? <section className="rt-panel rt-empty"><Icon name="icon-ruta" /><h2>Prepara tu recorrido</h2><p>Selecciona una lista con productos para organizar tu ruta de compra.</p><button className="lists-button" onClick={() => onNavigate('lists')}>Ir a Mis listas</button></section> : <div className="rt-columns"><section className="a11y-sr-only" aria-label="Recorrido en texto"><h2>Recorrido de compra</h2><p role="status" aria-atomic="true">Zona actual: {currentZone}. {instruction} Siguiente zona: {upcoming[0] || 'Caja'}.</p><p>{pending.length} productos pendientes. Después: {upcoming.length ? upcoming.join(', ') : 'Caja'}.</p><h3>Recorrido completo</h3><ol>{products.map((item, step) => <li key={item.id} aria-current={step + 1 === position ? 'step' : undefined}>{item.name}, {item.unit}. Zona: {item.category}. Pasillo {item.aisle}, {item.shelf}. {progress.foundIds.includes(item.id) ? 'Encontrado.' : 'Pendiente.'} {!item.available && 'Agotado.'}</li>)}<li aria-current={!product ? 'step' : undefined}>Caja. Revisa tu carrito y completa la compra.</li></ol></section>
        <section className="rt-panel rt-map-panel" aria-labelledby="rt-map-title"><div className="rt-heading"><Icon name="icon-mapa" /><div><h2 id="rt-map-title">Mapa del supermercado</h2><p>Sigue la ruta para encontrar tus productos.</p></div></div>
          <RouteMap pictograms={pictograms} products={products} currentZone={currentZone} foundIds={progress.foundIds} onZone={selectZone} />
          <div className="rt-legend"><span><Icon name="icon-check" />Zona completada</span><span><i className="rt-current-dot" />Zona actual</span><span><i />Próximas zonas</span><span><b />Tu ruta</span></div>
        </section>
        <aside className="rt-sidebar">
          <section className="rt-panel rt-progress" aria-labelledby="rt-progress-title"><Icon name="icon-carrito" /><div><h2 id="rt-progress-title">Tu progreso</h2><p><strong>{progress.count} de {progress.total}</strong> productos</p><div className="rt-meter"><progress aria-label="Productos encontrados" value={progress.count} max={progress.total} /><span>{progress.percent}%</span></div></div></section>
          <section className="rt-panel rt-stop" ref={detailRef} tabIndex={-1} aria-labelledby="rt-stop-title">
            <div className="rt-stop-heading"><Icon name="icon-navegacion" /><div><p>Próxima parada</p><h2 id="rt-stop-title">{product ? `${product.category} · Pasillo ${product.aisle}` : 'Caja'}</h2></div><span className="rt-stop-count">{product ? `Parada ${position} de ${products.length}` : 'Fin del recorrido'}</span></div>
            {product && <button className="rt-product" type="button" onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)} aria-expanded={expandedProduct === product.id} aria-controls="rt-product-information" aria-label={`Ver información de ${product.name}`}>
              {image && <img src={image} alt="" />}<span><small>Producto:</small><strong>{product.name}</strong><small>{requiredQuantity(list, product.id) > 1 ? `${requiredQuantity(list, product.id)} × ` : ''}{product.unit}{!product.available && ' · Agotado'}</small></span>
            </button>}
            {product && <details id="rt-product-information" className="rt-product-info" open={expandedProduct === product.id} onToggle={event => { if (event.currentTarget.open !== (expandedProduct === product.id)) setExpandedProduct(event.currentTarget.open ? product.id : null) }}><summary>Ubicación y detalles</summary><p>{product.brand ? `${product.brand} · ` : ''}{product.unit} · ${product.price.toFixed(2)} · {product.available ? 'Disponible' : 'Agotado'}</p><p>Pasillo {product.aisle}, {product.shelf}.</p></details>}
            <div className="rt-actions"><button className="rt-listen" disabled={!voiceSupported} onClick={() => onRead(instruction)}><Icon name="nav-leer" />Escuchar indicación</button><button className="lists-button" disabled={!product || found || !product.available} onClick={markFound}><Icon name="icon-check" />{found ? 'Producto localizado' : 'Producto encontrado'}</button><button className="lists-button lists-button--blue rt-next" onClick={() => product ? onIndex(position + 1) : onNavigate('cart')}>{product ? 'Siguiente' : 'Ver mi carrito'}<Icon name="icon-flecha-derecha" /></button></div>
            <div className="rt-instruction"><Icon name="nav-leer" /><div><strong>Indicación en voz alta <span>(vista previa)</span></strong><p>“{instruction}”</p></div></div>
            {undo && <div className="rt-found-note"><span>Producto localizado y añadido al carrito.</span><button onClick={() => { onRestore(undo.id, undo.quantity); setUndo(null) }}>Deshacer</button></div>}
            {!product && pending.length > 0 && <button className="rt-pending" onClick={() => onIndex(products.findIndex(item => !progress.foundIds.includes(item.id)) + 1)}>Volver a los {pending.length} productos pendientes</button>}
          </section>
          <section className="rt-panel rt-after"><Icon name="icon-ruta" /><div><h2>Después</h2><button onClick={() => selectZone(upcoming[0] || 'Caja')} disabled={!product}>{upcoming.length ? upcoming.join(' → ') : product ? 'Caja' : pending.length ? `${pending.length} productos pendientes` : 'Recorrido completado'}<Icon name="icon-flecha-derecha" /></button></div></section>
        </aside>
      </div>}
      <footer className="lists-footer"><p>Pequeñas compras, grandes momentos <span aria-hidden="true">♡</span></p><span className="lists-footer-line" /><small><strong>AYÚDATE</strong> Tu supermercado, más fácil para todos.</small></footer>
    </main>
  </div>
}
