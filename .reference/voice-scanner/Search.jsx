import ResponsiveHeader from '../components/ResponsiveHeader.jsx'
import { useRef, useState } from 'react'
import assets from '../../asset-manifest.json'
import { searchCatalog, missingProductPhotos, productSpeech } from './searchProducts.js'
import './Lists.css'
import './Search.css'

const navigation = [['home', 'Inicio'], ['lists', 'Mis listas'], ['search', 'Buscar producto'], ['route', 'Mi ruta'], ['budget', 'Presupuesto'], ['cart', 'Mi carrito']]
const categories = [['Todos', null], ['Lácteos', 'icon-botella-lacteos'], ['Abarrotes', 'icon-bolsa'], ['Frutas', 'icon-frutas'], ['Carnes', 'icon-carne'], ['Panadería', 'icon-pan'], ['Limpieza', 'icon-limpieza'], ['Bebidas', 'icon-bebidas'], ['Higiene personal', 'icon-higiene']]
const photos = { 1: 'leche', 5: 'manzanas', 6: 'bananas', 7: 'arroz', 9: 'detergente', 10: 'papel-higienico', 11: 'pan', 12: 'huevos' }
const money = price => `$${price.toFixed(2)}`
function Icon({ name }) { return <img className="lists-icon" src={`/assets/icons/svg/${name}.svg`} alt="" aria-hidden="true" /> }
function ProductPhoto({ product }) {
  const image = product.image || missingProductPhotos[product.id] || assets.products[photos[product.id]]
  return <span className="sp-photo">{image ? <img src={image} alt={`${product.name}, ${product.brand}`} /> : <Icon name="icon-bolsa" />}</span>
}

export default function Search({ products, query, onQuery, category, onCategory, selectedList, cart, onAddToList, onUndoList, onAddToCart, onUndoCart, onNavigate, onRead, voiceSupported }) {
  const [sort, setSort] = useState('relevance')
  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState('')
  const [undo, setUndo] = useState(null)
  const [codeOpen, setCodeOpen] = useState(false)
  const [code, setCode] = useState('')
  const inputRef = useRef(null)
  const resultRef = useRef(null)
  const results = searchCatalog(products, query, category, sort)
  function filter(value) { onCategory(value); setSelected(null); setMessage('') }
  function addList(product) {
    if (!selectedList) { setMessage('Primero crea una lista en Mis listas.'); return }
    onAddToList(product.id)
    setUndo({ kind: 'list', id: product.id, listId: selectedList.id })
    setMessage(`${product.name}${product.brand ? ` de ${product.brand}` : ''} agregado a «${selectedList.name}».`)
  }
  function addCart(product) {
    const quantity = cart[product.id] || 0
    onAddToCart(product.id)
    setUndo({ kind: 'cart', id: product.id, quantity })
    setMessage(`${product.name}${product.brand ? ` de ${product.brand}` : ''} agregado al carrito.`)
  }
  function findCode(event) {
    event.preventDefault()
    const product = products.find(item => String(item.id) === code.trim())
    if (!product) { setMessage('No encontramos ese código del catálogo. Prueba con el nombre del producto.'); return }
    onQuery(`${product.name} ${product.brand}`)
    onCategory('Todos')
    setSelected(product.id)
    setCodeOpen(false)
    setMessage('Producto encontrado por su código del catálogo.')
  }
  return <div className="lists-screen sp-screen">
    <ResponsiveHeader active="search" onNavigate={onNavigate} onRead={() => onRead(`Buscar producto. ${results.length} resultados. ${results.map(product => `${product.name}, ${product.brand}, ${money(product.price)}, pasillo ${product.aisle}, ${product.available ? 'disponible' : 'agotado'}`).join('. ')}`)} voiceSupported={voiceSupported}><header className="lists-header"><div className="lists-header-inner">
      <button className="lists-brand" onClick={() => onNavigate('home')} aria-label="Ir al inicio de AYÚDATE"><img src={assets.branding.logo} alt="AYÚDATE" /></button>
      <nav className="lists-nav" aria-label="Navegación principal">{navigation.map(([id, label]) => <button key={id} aria-current={id === 'search' ? 'page' : undefined} onClick={() => onNavigate(id)}>{label}</button>)}</nav>
      <div className="lists-header-actions"><button disabled={!voiceSupported} onClick={() => onRead(`Buscar producto. ${results.length} resultados. ${results.map(product => `${product.name}, ${product.brand}, ${money(product.price)}, pasillo ${product.aisle}, ${product.available ? 'disponible' : 'agotado'}`).join('. ')}`)}><Icon name="nav-leer" />Leer</button><button onClick={() => onNavigate('accessibility')}><Icon name="nav-accesibilidad" />Accesibilidad</button><button className="lists-button" onClick={() => onNavigate('help')}><Icon name="nav-asistencia" />Solicitar asistencia</button></div>
    </div></header></ResponsiveHeader>
    <div className="sp-content">
      <section className="sp-hero" aria-labelledby="sp-title"><div><h1 id="sp-title">Buscar <span>producto</span></h1><p>Encuentra ubicación, precio y disponibilidad.</p></div><div className="sp-banner" aria-hidden="true"><p>Los productos<br />que necesitas,<br />más cerca de ti ♡</p><img src={assets.illustrations.productos_frescos} alt="" /></div></section>
      <section className="sp-filters" aria-label="Buscar y filtrar productos">
        <div className="sp-search-row"><form className="sp-search" onSubmit={event => { event.preventDefault(); resultRef.current?.focus(); }} role="search"><Icon name="icon-buscar" /><input ref={inputRef} type="search" aria-label="Buscar producto" placeholder="Producto, categoría o pasillo" value={query} onChange={event => { onQuery(event.target.value); setSelected(null); setMessage('') }} /><button className="sp-clear" type="button" aria-label="Limpiar búsqueda" disabled={!query} onClick={() => { onQuery(''); inputRef.current?.focus() }}>×</button><button className="lists-button" type="submit">Buscar</button></form>
          <button className="sp-code" aria-expanded={codeOpen} aria-controls="sp-code-form" onClick={() => setCodeOpen(!codeOpen)}><Icon name="icon-barcode" /><span><strong>Buscar por código</strong><small>Busca un producto con su código</small></span></button>
        </div>
        {codeOpen && <form id="sp-code-form" className="sp-code-form" onSubmit={findCode}><label htmlFor="sp-code">Código del catálogo</label><input id="sp-code" autoFocus inputMode="numeric" value={code} onChange={event => setCode(event.target.value)} required /><button className="lists-button">Buscar código</button><p>Encontrarás este código al seleccionar un producto. El catálogo actual no incluye códigos de barras.</p></form>}
        <div className="sp-categories" aria-label="Filtrar por categoría">{categories.map(([name, icon]) => <button key={name} aria-pressed={category === name} onClick={() => filter(name)}>{icon && <Icon name={icon} />}{name === 'Frutas' ? 'Frutas y verduras' : name}</button>)}<select aria-label="Más categorías" value={categories.some(([name]) => name === category) ? '' : category} onChange={event => filter(event.target.value || 'Todos')}><option value="">Más categorías</option><option value="Cereales">Cereales</option></select></div>
      </section>
      <div className="sp-result-toolbar"><h2 ref={resultRef} tabIndex={-1}>{results.length} {results.length === 1 ? 'resultado' : 'resultados'}{query.trim() ? ` para “${query.trim()}”` : ''}</h2><label>Ordenar por: <select value={sort} onChange={event => setSort(event.target.value)}><option value="relevance">Relevancia</option><option value="price-up">Menor precio</option><option value="price-down">Mayor precio</option><option value="name">Nombre</option></select></label></div>
      <div className="sp-status" role="status">{message}{undo && <button onClick={() => { if (undo.kind === 'list') onUndoList(undo.id, undo.listId); else onUndoCart(undo.id, undo.quantity); setUndo(null); setMessage('Se deshizo el último agregado.') }}>Deshacer agregado {undo.kind === 'list' ? 'a la lista' : 'al carrito'}</button>}</div>
      <div className="sp-results">{results.map(product => <article className={`sp-result ${selected === product.id ? 'sp-selected' : ''}`} key={product.id}>
        <div className="sp-product"><button className="sp-select-product" aria-label={`Seleccionar ${product.name} ${product.brand}`} aria-expanded={selected === product.id} onClick={() => setSelected(selected === product.id ? null : product.id)}><ProductPhoto product={product} /><span><strong>{product.name} {product.unit}</strong><small>{product.brand}</small></span></button><button className="sp-read" disabled={!voiceSupported} onClick={() => onRead(productSpeech(product))}><Icon name="nav-leer" />Leer</button></div>
        <div className="sp-price"><strong>{money(product.price)}</strong><small>{product.unit}</small></div>
        <span className="sp-meta"><Icon name="icon-hoja" />{product.category}</span><span className="sp-meta"><Icon name="icon-navegacion" />Pasillo {product.aisle}</span>
        <div className={`sp-availability ${product.available ? '' : 'sp-unavailable'}`}><Icon name={product.available ? 'icon-check' : 'icon-info'} /><span><strong>{product.available ? 'Disponible' : 'Agotado'}</strong><small>{product.available ? 'Disponible en el catálogo' : 'No disponible actualmente'}</small></span></div>
        <div className="sp-actions"><button className="sp-add-list" disabled={!product.available || !!selectedList?.items.includes(product.id)} onClick={() => addList(product)}><Icon name="icon-listas" />{selectedList?.items.includes(product.id) ? 'En tu lista' : 'Agregar a lista'}</button><button className="lists-button" disabled={!product.available} onClick={() => addCart(product)}><Icon name="icon-carrito" />Agregar al carrito</button><button className="sp-location" onClick={() => setSelected(selected === product.id ? null : product.id)}><Icon name="icon-navegacion" />Ver ubicación</button></div>
        {selected === product.id && <section className="sp-detail" aria-label={`Detalle de ${product.name} ${product.brand}`}><p><strong>{product.name}{product.brand && ` · ${product.brand}`}</strong> — Pasillo {product.aisle}, {product.shelf}. {product.available ? 'Disponible' : 'Agotado'}. Código del catálogo: {product.id}.</p><div><button disabled={!voiceSupported} onClick={() => onRead(productSpeech(product))}><Icon name="nav-leer" />Leer producto</button><button onClick={() => onNavigate('route')}><Icon name="icon-ruta" />Ir a Mi ruta</button><button onClick={() => setSelected(null)}>Cerrar detalle</button></div></section>}
      </article>)}</div>
      {!results.length && <div className="sp-empty"><Icon name="icon-buscar" /><h2>No encontramos productos</h2><p>Prueba otro nombre o cambia la categoría seleccionada.</p><button onClick={() => { onQuery(''); filter('Todos'); inputRef.current?.focus() }}>Limpiar filtros</button></div>}
      <footer className="lists-footer"><p>Pequeñas compras, grandes momentos <span aria-hidden="true">♡</span></p><span className="lists-footer-line" /><small><strong>AYÚDATE</strong> Tu supermercado, más fácil para todos.</small></footer>
    </div>
  </div>
}



