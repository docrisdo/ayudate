import { focusAfterRemoval } from '../components/accessibilityContext.js'
import ResponsiveHeader from '../components/ResponsiveHeader.jsx'
import { useRef, useState } from 'react'
import assets from '../../asset-manifest.json'
import { missingProductPhotos } from './searchProducts.js'
import { addQuantities, findProducts, recognizeProducts } from './newListProducts.js'
import './Lists.css'
import './NewList.css'

const navigation = [['home', 'Inicio'], ['lists', 'Mis listas'], ['search', 'Buscar producto'], ['route', 'Mi ruta'], ['budget', 'Presupuesto'], ['cart', 'Mi carrito']]
const images = { 1: 'leche', 5: 'manzanas', 6: 'bananas', 7: 'arroz', 9: 'detergente', 10: 'papel-higienico', 11: 'pan', 12: 'huevos' }
const money = value => `$${value.toFixed(2)}`
function Icon({ name }) { return <img className="lists-icon" src={`/assets/icons/svg/${name}.svg`} alt="" aria-hidden="true" /> }
function Photo({ product }) {
  const image = product.image || missingProductPhotos[product.id] || assets.products[images[product.id]]
  return image ? <img className="nl-photo" src={image} alt="" /> : <span className="nl-photo" aria-hidden="true" />
}

export default function NewList({ products, onNavigate, onSave, onRead, voiceSupported }) {
  const [name, setName] = useState('')
  const [query, setQuery] = useState('')
  const [bulk, setBulk] = useState('')
  const [quantities, setQuantities] = useState({})
  const [message, setMessage] = useState('')
  const [clearing, setClearing] = useState(false)
  const searchRef = useRef(null)
  const bulkRef = useRef(null)
  const nameRef = useRef(null)
  const selected = products.filter(product => quantities[product.id])
  const results = query.trim() ? findProducts(products, query) : []
  const lines = bulk.split(/\r?\n/).filter(line => line.trim()).length

  function add(product) {
    setQuantities(current => addQuantities(current, [{ id: product.id, quantity: 1 }]))
    setMessage(`${product.name} agregado a tu lista.`)
    setQuery('')
    searchRef.current?.focus()
  }
  function addBulk() {
    const { recognized, unresolved, error } = recognizeProducts(products, bulk)
    if (error) { setMessage(error); return }
    setQuantities(current => addQuantities(current, recognized))
    setBulk(unresolved.join('\n'))
    setMessage(`${recognized.length} líneas reconocidas.${unresolved.length ? ` No se reconocieron: ${unresolved.join(', ')}. Revisa los nombres o usa la búsqueda.` : ' Productos agregados a tu lista.'}`)
  }
  function changeQuantity(id, value) {
    setMessage(`${products.find(product => product.id === id)?.name}. Cantidad ${Math.max(1, Math.min(99, Number(value) || 1))}.`)
    setQuantities(current => ({ ...current, [id]: Math.max(1, Math.min(99, Number(value) || 1)) }))
  }
  function remove(id) {
    setMessage(`${products.find(product => product.id === id)?.name} eliminado de la lista.`)
    focusAfterRemoval(document.activeElement, 'li', 'input', '#nl-search')
    setQuantities(current => { const next = { ...current }; delete next[id]; return next })
  }
  function save(start) {
    if (!name.trim()) { setMessage('Escribe el nombre de la lista antes de guardar.'); nameRef.current?.focus(); return }
    if (!selected.length) { setMessage('Agrega al menos un producto antes de guardar.'); searchRef.current?.focus(); return }
    onSave({ name: name.trim(), items: selected.map(product => product.id), quantities }, start)
  }

  return <div className="lists-screen nl-screen">
    <ResponsiveHeader active="newlist" onNavigate={onNavigate} onRead={onRead} voiceSupported={voiceSupported}><header className="lists-header"><div className="lists-header-inner">
      <button className="lists-brand" onClick={() => onNavigate('home')} aria-label="Ir al inicio de AYÚDATE"><img src={assets.branding.logo} alt="AYÚDATE" /></button>
      <nav className="lists-nav" aria-label="Navegación principal">{navigation.map(([id, label]) => <button key={id} aria-current={id === 'lists' ? 'page' : undefined} onClick={() => onNavigate(id)}>{label}</button>)}</nav>
      <div className="lists-header-actions"><button onClick={onRead} disabled={!voiceSupported}><Icon name="nav-leer" />Leer</button><button onClick={() => onNavigate('accessibility')}><Icon name="nav-accesibilidad" />Accesibilidad</button><button className="lists-button" onClick={() => onNavigate('help')}><Icon name="nav-asistencia" />Solicitar asistencia</button></div>
    </div></header></ResponsiveHeader>
    <main className="nl-content" id="contenido-principal" tabIndex={-1}>
      <section className="nl-hero" aria-labelledby="nl-title">
        <div className="nl-hero-copy"><nav aria-label="Ubicación"><button onClick={() => onNavigate('lists')}>Mis listas</button><span aria-hidden="true">›</span><span>Nueva lista</span></nav><h1 id="nl-title">Nueva <span>lista</span></h1><p>Crea una lista de compras y agrega los productos que necesitas.</p></div>
        <div className="nl-banner" aria-hidden="true"><p>Pequeñas<br />compras, grandes<br />momentos ♡</p><img src={assets.illustrations.lista_compras} alt="" /></div>
      </section>
      <section className="nl-name nl-panel"><label htmlFor="nl-name">Nombre de la lista</label><input id="nl-name" aria-describedby="nl-status" aria-invalid={!name.trim() && message.startsWith('Escribe el nombre')} ref={nameRef} value={name} maxLength={80} onChange={event => setName(event.target.value)} placeholder="Ej. Compra semanal" required /></section>
      <section className="nl-add nl-panel" aria-labelledby="nl-add-title">
        <div className="nl-add-heading"><h2 id="nl-add-title"><Icon name="icon-plus" />Agrega tus productos</h2><button className="nl-method" onClick={() => searchRef.current?.focus()}><Icon name="icon-buscar" />Buscar productos</button><button className="nl-method nl-method--write" onClick={() => bulkRef.current?.focus()}><Icon name="icon-listas" />Escribir varios</button></div>
        <div className="nl-input-columns">
          <div className="nl-search"><label htmlFor="nl-search">Buscar producto</label><div className="nl-search-field"><Icon name="icon-buscar" /><input id="nl-search" aria-describedby="nl-status" type="search" ref={searchRef} value={query} onChange={event => setQuery(event.target.value)} placeholder="Escribe el nombre de un producto" autoComplete="off" aria-controls="nl-results" /></div>
            <div id="nl-results" className={query.trim() ? 'nl-results' : 'nl-search-hint'}>{query.trim() ? (results.length ? results.map(product => <button key={product.id} onClick={() => add(product)} aria-label={`Agregar ${product.name}`}><Photo product={product} /><span>{product.name} · {product.unit}<small>{product.category}{!product.available && ' · Agotado actualmente'}</small></span><Icon name="icon-plus" /></button>) : <p>No encontramos ese producto. Prueba con otro nombre.</p>) : <p>Busca en el catálogo y selecciona un producto para agregarlo.</p>}</div>
          </div>
          <span className="nl-or" aria-hidden="true">o</span>
          <div className="nl-bulk"><label htmlFor="nl-bulk">Escribe tus productos (uno por línea)</label><textarea id="nl-bulk" aria-describedby="nl-bulk-help" ref={bulkRef} value={bulk} onChange={event => setBulk(event.target.value)} placeholder={'Leche\nHuevos\nManzanas\nArroz\nJabón'} maxLength={5000} /><div className="nl-bulk-help" id="nl-bulk-help"><small>Un producto por línea. Puedes indicar «2 x Leche».</small><span>{lines}/50</span></div><button className="lists-button" disabled={!lines || lines > 50} onClick={addBulk}><Icon name="icon-plus" />Agregar productos</button></div>
        </div>
        <p className="nl-status" id="nl-status" role="status">{message}</p>
      </section>
      <section className="nl-products nl-panel" aria-labelledby="nl-products-title">
        <div className="nl-products-heading"><Icon name="icon-carrito" /><div><h2 id="nl-products-title">Productos en tu lista</h2><p>{selected.length} productos agregados</p></div><button disabled={!selected.length} onClick={() => { setClearing(true); requestAnimationFrame(() => document.querySelector('.nl-clear button')?.focus()) }}><Icon name="icon-basura" />Vaciar lista</button></div>
        {clearing && <div className="nl-clear" role="group" aria-label="Confirmar vaciado de la lista" onKeyDown={event => { if (event.key === 'Escape') { setClearing(false); document.querySelector('.nl-products-heading button')?.focus() } }}><span>¿Quitar todos los productos de esta lista?</span><button onClick={() => { setQuantities({}); setClearing(false); setMessage('Se vació la lista.'); searchRef.current?.focus() }}>Sí, vaciar</button><button onClick={() => { setClearing(false); document.querySelector('.nl-products-heading button')?.focus() }}>Cancelar</button></div>}
        <div className="nl-table-head" aria-hidden="true"><span>Producto</span><span>Categoría</span><span>Precio aprox.</span><span>Cantidad</span><span>Subtotal aprox.</span><span /></div>
        <ul className="nl-rows">{selected.map(product => <li key={product.id}>
          <div className="nl-product-name"><Photo product={product} /><span>{product.name} <small>({product.unit})</small></span></div>
          <span className={`nl-category nl-category--${product.id === 5 || product.id === 6 ? 'fruit' : product.id === 7 || product.id === 8 ? 'grocery' : product.id === 9 || product.id === 10 ? 'clean' : 'dairy'}`}>{product.category}</span>
          <span className="nl-price"><span className="a11y-sr-only">Precio aproximado: </span><span className="nl-mobile-label" aria-hidden="true">Precio: </span>{money(product.price)}</span>
          <div className="nl-quantity"><button aria-label={`Reducir cantidad de ${product.name}`} disabled={quantities[product.id] <= 1} onClick={() => changeQuantity(product.id, quantities[product.id] - 1)}>−</button><label className="a11y-sr-only" htmlFor={`nl-quantity-${product.id}`}>Cantidad de {product.name}</label><input id={`nl-quantity-${product.id}`} type="number" min="1" max="99" step="1" value={quantities[product.id]} onChange={event => changeQuantity(product.id, Math.round(Number(event.target.value)))} /><button aria-label={`Aumentar cantidad de ${product.name}`} disabled={quantities[product.id] >= 99} onClick={() => changeQuantity(product.id, quantities[product.id] + 1)}>+</button></div>
          <span className="nl-subtotal"><span className="a11y-sr-only">Subtotal aproximado: </span><span className="nl-mobile-label" aria-hidden="true">Subtotal: </span>{money(product.price * quantities[product.id])}</span>
          <button className="nl-remove" aria-label={`Eliminar ${product.name}`} onClick={() => remove(product.id)}><Icon name="icon-basura" /></button>
        </li>)}</ul>
        {!selected.length && <p className="nl-empty">Tu lista está vacía. Busca productos o escribe varios para empezar.</p>}
      </section>
      <div className="nl-save"><button className="nl-save-only" onClick={() => save(false)}><Icon name="icon-check" />Guardar lista</button><button className="lists-button lists-button--blue" onClick={() => save(true)}>Guardar e iniciar compra<Icon name="icon-flecha-derecha" /></button></div>
    </main>
  </div>
}

