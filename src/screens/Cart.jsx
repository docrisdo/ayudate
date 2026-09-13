import { useAnnounce, focusAfterRemoval } from '../components/accessibilityContext.js'
import ResponsiveHeader from '../components/ResponsiveHeader.jsx'
import { useRef, useState } from 'react'
import assets from '../../asset-manifest.json'
import { missingProductPhotos } from './searchProducts.js'
import { budgetSummary } from './budgetModel.js'
import './Lists.css'
import './Cart.css'

const navigation = [['home', 'Inicio'], ['lists', 'Mis listas'], ['search', 'Buscar producto'], ['route', 'Mi ruta'], ['budget', 'Presupuesto'], ['cart', 'Mi carrito']]
const photos = { 1: 'leche', 5: 'manzanas', 6: 'bananas', 7: 'arroz', 9: 'detergente', 10: 'papel-higienico', 11: 'pan', 12: 'huevos' }
const money = value => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
const productName = item => [item.name, item.brand].filter(Boolean).join(' ')
function Icon({ name }) { return <img className="lists-icon" src={`/assets/icons/svg/${name}.svg`} alt="" aria-hidden="true" /> }

export default function Cart({ items, budget, onIncrease, onDecrease, onRemove, onRestore, onNavigate, onRead, voiceSupported }) {
  const announce = useAnnounce()
  const [removed, setRemoved] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const dialog = useRef(null)
  const { total, remaining } = budgetSummary(budget, items)
  const units = items.reduce((sum, item) => sum + item.quantity, 0)
  const count = `${items.length} ${items.length === 1 ? 'producto' : 'productos'}`
  function remove(item) { focusAfterRemoval(document.activeElement, 'tr', 'button', '.ct-continue'); setRemoved(item); onRemove(item.id) }
  return <div className="lists-screen ct-screen">
    <ResponsiveHeader active="cart" onNavigate={onNavigate} onRead={() => onRead(`Mi carrito. ${count}, ${units} unidades. ${items.map(item => `${item.name}, cantidad ${item.quantity}, subtotal ${money(Math.round(item.price * 100) * item.quantity / 100)}`).join('. ')}. Total ${money(total)}.`)} voiceSupported={voiceSupported}><header className="lists-header"><div className="lists-header-inner">
      <button className="lists-brand" onClick={() => onNavigate('home')} aria-label="Ir al inicio de AYÚDATE"><img src={assets.branding.logo} alt="AYÚDATE" /></button>
      <nav className="lists-nav" aria-label="Navegación principal">{navigation.map(([id, label]) => <button key={id} aria-current={id === 'cart' ? 'page' : undefined} onClick={() => onNavigate(id)}>{label}</button>)}</nav>
      <div className="lists-header-actions"><button disabled={!voiceSupported} onClick={() => onRead(`Mi carrito. ${count}, ${units} unidades. ${items.map(item => `${item.name}, cantidad ${item.quantity}, subtotal ${money(Math.round(item.price * 100) * item.quantity / 100)}`).join('. ')}. Total ${money(total)}.`)}><Icon name="nav-leer" />Leer</button><button onClick={() => onNavigate('accessibility')}><Icon name="nav-accesibilidad" />Accesibilidad</button><button className="lists-button" onClick={() => onNavigate('help')}><Icon name="nav-asistencia" />Solicitar asistencia</button></div>
    </div></header></ResponsiveHeader>
    <main className="ct-content" id="contenido-principal" tabIndex={-1}>
      <section className="ct-hero" aria-labelledby="ct-title"><div><h1 id="ct-title">Mi <span>carrito</span></h1><p>Revisa los productos seleccionados antes de finalizar tu compra.</p></div><div className="ct-banner" aria-hidden="true"><p>Productos<br />esenciales para<br />tu hogar ♡</p><img src={assets.illustrations.productos_frescos} alt="" /></div></section>
      <div className="ct-columns">
        <section className="ct-panel ct-products" aria-label="Productos seleccionados">
          {items.length ? <table className="ct-table"><thead><tr><th scope="col">Producto</th><th scope="col">Cantidad</th><th scope="col"><span className="ct-sr-only">Precio unitario</span></th><th scope="col">Precio</th><th scope="col"><span className="ct-sr-only">Eliminar</span></th></tr></thead><tbody>{items.map(item => <tr key={item.id}>
            <th scope="row"><div className="ct-product"><img src={item.image || missingProductPhotos[item.id] || assets.products[photos[item.id]]} alt="" /><div><strong>{item.name}</strong><small>{item.unit} · {item.category}{item.brand && ` · ${item.brand}`}</small></div></div></th>
            <td><div className="ct-quantity"><button aria-label={`Quitar una unidad de ${productName(item)}`} onClick={() => { if (item.quantity === 1) remove(item); else { onDecrease(item.id); announce(`${productName(item)}. Cantidad ${item.quantity - 1}.`) } }}>−</button><output aria-label={`Cantidad de ${productName(item)}: ${item.quantity}`}>{item.quantity}</output><button aria-label={`Agregar una unidad de ${productName(item)}`} onClick={() => { onIncrease(item.id); announce(`${productName(item)}. Cantidad ${item.quantity + 1}.`) }}>+</button></div></td>
            <td className="ct-unit-price"><span className="ct-mobile-label">Unidad: </span>{money(item.price)}</td><td className="ct-subtotal"><span className="ct-mobile-label">Subtotal: </span><strong>{money(Math.round(item.price * 100) * item.quantity / 100)}</strong></td>
            <td><button className="ct-remove" aria-label={`Eliminar ${productName(item)} del carrito`} onClick={() => remove(item)}><Icon name="icon-basura" /></button></td>
          </tr>)}</tbody></table> : <div className="ct-empty"><Icon name="icon-carrito" /><h2>Tu carrito está vacío</h2><p>Busca productos y agrégalos para comenzar tu compra.</p></div>}
          {removed && <div className="ct-undo" role="status"><span>{removed.name} se eliminó del carrito.</span><button onClick={() => { onRestore(removed.id, removed.quantity); announce(`${removed.name} restaurado al carrito.`); setRemoved(null); requestAnimationFrame(() => document.querySelector('.ct-quantity button')?.focus()) }}>Deshacer</button></div>}
          <button className="ct-continue" onClick={() => onNavigate('search')}><Icon name="icon-flecha-derecha" />Seguir comprando</button>
        </section>
        <aside className="ct-panel ct-summary" aria-labelledby="ct-summary-title">
          <div className="ct-summary-heading"><Icon name="icon-bolsa" /><div><h2 id="ct-summary-title">Resumen</h2><p>{count} en tu carrito</p></div></div>
          <div className="ct-summary-subtotal"><span>Subtotal ({count})</span><strong>{money(total)}</strong></div>
          <div className="ct-total" aria-live="polite" aria-atomic="true"><span>Total:</span><strong>{money(total)}</strong></div>
          <button className="lists-button lists-button--blue ct-checkout" disabled={!items.length} onClick={() => { setConfirmed(false); dialog.current.showModal() }}>Finalizar compra<Icon name="icon-flecha-derecha" /></button>
          <button className={`ct-budget ${remaining < 0 ? 'ct-budget-over' : ''}`} onClick={() => onNavigate('budget')}><Icon name="icon-piggy" /><span><strong>Tu presupuesto</strong><span>{remaining >= 0 ? `Te ${remaining === 1 ? 'queda' : 'quedan'} ${money(remaining)}` : `Excedido por ${money(Math.abs(remaining))}`}</span></span><Icon name="icon-flecha-derecha" /></button>
          <div className="ct-note"><Icon name="icon-hoja" /><p>Una compra consciente<br />también ayuda al planeta ♡</p></div>
        </aside>
      </div>
      <footer className="lists-footer"><p>Pequeñas compras, grandes momentos <span aria-hidden="true">♡</span></p><span className="lists-footer-line" /><small><strong>AYÚDATE</strong> Tu supermercado, más fácil para todos.</small></footer>
    </main>
    <dialog ref={dialog} className="ct-dialog" aria-labelledby="ct-dialog-title"><h2 id="ct-dialog-title" tabIndex={-1}>{confirmed ? 'Tu carrito está listo para caja' : 'Revisa tu compra'}</h2>{confirmed ? <p>Acude a caja para completar el pago. Tus productos permanecen en el carrito.</p> : <><p>{count} · {units} {units === 1 ? 'unidad' : 'unidades'}</p><ul>{items.map(item => <li key={item.id}><span>{item.quantity} × {item.name}</span><strong>{money(Math.round(item.price * 100) * item.quantity / 100)}</strong></li>)}</ul></>}
      <div className="ct-total"><span>Total:</span><strong>{money(total)}</strong></div>{remaining < 0 && <p className="ct-checkout-warning">Tu compra supera el presupuesto por {money(Math.abs(remaining))}.</p>}
      <div className="ct-dialog-actions">{!confirmed && <button className="lists-button lists-button--blue" onClick={() => { setConfirmed(true); requestAnimationFrame(() => document.getElementById('ct-dialog-title')?.focus()) }}>Confirmar y continuar a caja</button>}<button onClick={() => dialog.current.close()}>{confirmed ? 'Volver al carrito' : 'Seguir revisando'}</button></div>
    </dialog>
  </div>
}

