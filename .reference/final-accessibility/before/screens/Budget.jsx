import { useAnnounce } from '../components/accessibilityContext.js'
import ResponsiveHeader from '../components/ResponsiveHeader.jsx'
import { useRef, useState } from 'react'
import assets from '../../asset-manifest.json'
import { missingProductPhotos } from './searchProducts.js'
import { budgetSummary, money } from './budgetModel.js'
import './Lists.css'
import './Budget.css'

const navigation = [['home', 'Inicio'], ['lists', 'Mis listas'], ['search', 'Buscar producto'], ['route', 'Mi ruta'], ['budget', 'Presupuesto'], ['cart', 'Mi carrito']]
const photos = { 1: 'leche', 5: 'manzanas', 6: 'bananas', 7: 'arroz', 9: 'detergente', 10: 'papel-higienico', 11: 'pan', 12: 'huevos' }
const tips = ['Revisa las ofertas y productos de temporada.', 'Prioriza los productos de tu lista.', 'Compara precios entre diferentes marcas.', 'Mantén un margen para imprevistos.']
function Icon({ name }) { return <img className="lists-icon" src={`/assets/icons/svg/${name}.svg`} alt="" aria-hidden="true" /> }

export default function Budget({ budget, items, onBudget, onNavigate, onRead, voiceSupported }) {
  const announce = useAnnounce()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(budget))
  const editButton = useRef(null)
  const { total, remaining, percent, progress, status, rows } = budgetSummary(budget, items)
  const messages = {
    ok: ['Tu compra está dentro del presupuesto.', total ? '¡Vas muy bien!' : 'Agrega productos para comenzar.'],
    near: ['Te acercas al límite de tu presupuesto.', `Te quedan ${money(remaining)} disponibles.`],
    limit: ['Has alcanzado tu presupuesto.', 'No queda dinero disponible.'],
    over: ['Tu compra supera el presupuesto.', `Te has excedido por ${money(Math.abs(remaining))}.`],
  }
  const [message, detail] = messages[status]
  function closeEditor() {
    setEditing(false)
    requestAnimationFrame(() => editButton.current?.focus())
  }
  function saveBudget(event) {
    event.preventDefault()
    const next = Number(draft)
    if (!draft.trim() || !Number.isFinite(next) || next < 0) return
    onBudget(Math.round(next * 100) / 100)
    announce(`Presupuesto actualizado: ${money(next)}. Gasto actual: ${money(total)}. Restante: ${money(next - total)}.`)
    closeEditor()
  }
  return <div className={`lists-screen bd-screen bd-${status}`}>
    <ResponsiveHeader active="budget" onNavigate={onNavigate} onRead={() => onRead(`Presupuesto ${money(budget)}. Compra actual ${money(total)}. Disponible ${money(remaining)}. ${message} ${detail}`)} voiceSupported={voiceSupported}><header className="lists-header"><div className="lists-header-inner">
      <button className="lists-brand" onClick={() => onNavigate('home')} aria-label="Ir al inicio de AYÚDATE"><img src={assets.branding.logo} alt="AYÚDATE" /></button>
      <nav className="lists-nav" aria-label="Navegación principal">{navigation.map(([id, label]) => <button key={id} aria-current={id === 'budget' ? 'page' : undefined} onClick={() => onNavigate(id)}>{label}</button>)}</nav>
      <div className="lists-header-actions"><button disabled={!voiceSupported} onClick={() => onRead(`Presupuesto ${money(budget)}. Compra actual ${money(total)}. Disponible ${money(remaining)}. ${message} ${detail}`)}><Icon name="nav-leer" />Leer</button><button onClick={() => onNavigate('accessibility')}><Icon name="nav-accesibilidad" />Accesibilidad</button><button className="lists-button" onClick={() => onNavigate('help')}><Icon name="nav-asistencia" />Solicitar asistencia</button></div>
    </div></header></ResponsiveHeader>
    <main className="bd-content" id="main-content" tabIndex={-1}>
      <section className="bd-hero" aria-labelledby="bd-title"><div><h1 id="bd-title">Presupue<span>sto</span></h1><p>Controla cuánto llevas y cuánto te queda disponible.</p></div><div className="bd-banner" aria-hidden="true"><p>Compras<br />más tranquilas,<br />para un mejor mañana ♡</p><img src={assets.illustrations.productos_frescos} alt="" /></div></section>
      <section className="bd-panel bd-overview" aria-labelledby="bd-summary-title">
        <div className="bd-heading"><Icon name="icon-wallet" /><h2 id="bd-summary-title">Resumen de tu presupuesto</h2><span className="bd-updated">Actualizado con tu carrito actual<Icon name="icon-info" /></span></div>
        <div className="bd-metrics">
          <button ref={editButton} className="bd-metric bd-budget" aria-label={`Editar presupuesto: ${money(budget)}`} aria-expanded={editing} aria-controls="bd-editor" onClick={() => { setDraft(String(budget)); setEditing(!editing) }}><Icon name="icon-monedas" /><span><span>Tu presupuesto</span><strong>{money(budget)}</strong></span><span className="bd-edit-icon"><Icon name="icon-editar" /></span></button>
          <div className="bd-metric bd-spent"><Icon name="icon-carrito" /><div><span>Compra actual</span><strong>{money(total)}</strong></div></div>
          <div className="bd-metric bd-remaining"><Icon name="icon-piggy" /><div><span>Disponible</span><strong>{money(remaining)}</strong></div></div>
        </div>
        {editing && <form id="bd-editor" className="bd-editor" onSubmit={saveBudget}><label htmlFor="bd-budget-input">Tu presupuesto en pesos<input id="bd-budget-input" type="number" inputMode="decimal" min="0" max="999999999" step="0.01" required autoFocus value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') closeEditor() }} /></label><button className="lists-button" type="submit">Guardar presupuesto</button><button type="button" onClick={closeEditor}>Cancelar</button></form>}
        <div className="bd-summary-bottom">
          <div className="bd-usage"><p>{percent === null ? 'Define un presupuesto para calcular el porcentaje de gasto.' : <>Has utilizado el <strong>{percent}%</strong> de tu presupuesto.</>}</p><div className="bd-progress" role="progressbar" aria-label="Gasto del presupuesto" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-valuetext={`${money(total)} gastados de ${money(budget)}${percent !== null ? `, ${percent}%` : ''}`}><span style={{ width: `${progress}%` }} /></div><div className="bd-progress-labels"><span>{money(total)} gastados</span><span>{money(budget)}</span></div></div>
          <div className="bd-status-wrap"><div className="bd-status" role="status"><Icon name={status === 'ok' ? 'icon-check' : 'icon-info'} /><div><strong>{message}</strong><p>{detail}</p></div></div></div>
        </div>
      </section>
      <div className="bd-columns">
        <section className="bd-panel bd-impact" aria-labelledby="bd-impact-title"><div className="bd-heading"><Icon name="icon-grafica" /><div><h2 id="bd-impact-title">Productos con mayor impacto</h2><p>Estos son los productos que más aportan a tu gasto actual.</p></div></div>
          {rows.length ? <table className="bd-table"><thead><tr><th scope="col">Producto</th><th scope="col">Categoría</th><th scope="col">Precio</th><th scope="col">Aporta al total</th><th scope="col"><span className="bd-sr-only">Acciones</span></th></tr></thead><tbody>{rows.map(item => <tr key={item.id}><th scope="row"><span className="bd-product"><img src={item.image || missingProductPhotos[item.id] || assets.products[photos[item.id]]} alt="" /><span>{item.name}{item.quantity > 1 && <small>{item.quantity} × {money(item.price)}</small>}</span></span></th><td data-label="Categoría">{item.category}</td><td data-label="Precio">{money(item.subtotal)}</td><td data-label="Aporta al total">{item.share}%</td><td><button aria-label={`Ver ${item.name} en mi carrito`} onClick={() => onNavigate('cart')}><Icon name="icon-flecha-derecha" /></button></td></tr>)}</tbody></table> : <div className="bd-empty"><p>Agrega productos al carrito para ver su impacto en tu presupuesto.</p><button className="lists-button" onClick={() => onNavigate('search')}>Buscar productos</button></div>}
        </section>
        <aside className="bd-panel bd-tips"><div><div className="bd-heading"><Icon name="icon-bombilla" /><h2>Consejos para tu presupuesto</h2></div><ul>{tips.map(tip => <li key={tip}><Icon name="icon-check" /><span>{tip}</span></li>)}</ul></div></aside>
      </div>
      <footer className="lists-footer"><p>Pequeñas compras, grandes momentos <span aria-hidden="true">♡</span></p><span className="lists-footer-line" /><small><strong>AYÚDATE</strong> Tu supermercado, más fácil para todos.</small></footer>
    </main>
  </div>
}
