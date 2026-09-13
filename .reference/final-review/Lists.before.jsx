import ResponsiveHeader from '../components/ResponsiveHeader.jsx'
import { useRef, useState } from 'react'
import assets from '../../asset-manifest.json'
import './Lists.css'

const productImages = {
  1: assets.products.leche, 5: assets.products.manzanas, 6: assets.products.bananas,
  7: assets.products.arroz, 9: assets.products.detergente,
  10: assets.products['papel-higienico'], 11: assets.products.pan, 12: assets.products.huevos,
}
const navigation = [['home', 'Inicio'], ['lists', 'Mis listas'], ['search', 'Buscar producto'], ['route', 'Mi ruta'], ['budget', 'Presupuesto'], ['cart', 'Mi carrito']]

function Icon({ name, className = '' }) {
  return <img className={`lists-icon ${className}`} src={`/assets/icons/svg/${name}.svg`} alt="" aria-hidden="true" width="28" height="28" />
}

function ProductImage({ product }) {
  // Only show a photograph when the official library contains this product.
  return productImages[product.id] ? <img className="lists-product-image" src={productImages[product.id]} alt="" width="52" height="44" /> : <span className="lists-product-image" aria-hidden="true" />
}

function listIcon(list) {
  if (list.id === 'cleaning') return 'icon-limpieza'
  if (list.id === 'breakfast') return 'icon-bebidas'
  return 'icon-bolsa'
}

function updatedLabel(list) {
  if (!list.updatedAt) return 'Guardada en este dispositivo'
  const date = new Date(list.updatedAt)
  return date.toDateString() === new Date().toDateString()
    ? 'Actualizada hoy'
    : `Actualizada el ${date.toLocaleDateString('es-MX')}`
}

export default function ListsScreen({ lists, selectedList, products, newListName, onNameChange, onCreateList, onNewList, onSelectList, onUpdateList, onDeleteList, onRestoreList, onAddProduct, onRemoveProduct, onStart, onNavigate, onRead, voiceSupported }) {
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [deleted, setDeleted] = useState(null)
  const detailRef = useRef(null)
  const nameRef = useRef(null)
  const selectedProducts = (selectedList?.items || []).map(id => products.find(product => product.id === id)).filter(Boolean)

  function openList(list, edit = false) {
    onSelectList(list.id)
    setDraftName(list.name)
    setEditing(edit)
    setDeleteId(null)
    if (edit) requestAnimationFrame(() => nameRef.current?.focus())
    else {
      detailRef.current?.focus({ preventScroll: true })
      if (window.matchMedia('(max-width: 960px)').matches) detailRef.current?.scrollIntoView({ block: 'start' })
    }
  }

  function removeList(list) {
    setDeleted({ list, index: lists.findIndex(item => item.id === list.id) })
    onDeleteList(list.id)
    setDeleteId(null)
    setEditing(false)
  }

  return (
    <div className="lists-screen">
      <ResponsiveHeader active="lists" onNavigate={onNavigate} onRead={onRead} voiceSupported={voiceSupported}><header className="lists-header">
        <div className="lists-header-inner">
          <button className="lists-brand" type="button" onClick={() => onNavigate('home')} aria-label="Ir al inicio de AYÚDATE"><img src={assets.branding.logo} alt="AYÚDATE" /></button>
          <nav className="lists-nav" aria-label="Navegación principal">
            {navigation.map(([id, label]) => <button key={id} type="button" aria-current={id === 'lists' ? 'page' : undefined} onClick={() => onNavigate(id)}>{label}</button>)}
          </nav>
          <div className="lists-header-actions">
            <button type="button" onClick={onRead} disabled={!voiceSupported}><Icon name="nav-leer" />Leer</button>
            <button type="button" onClick={() => onNavigate('accessibility')}><Icon name="nav-accesibilidad" />Accesibilidad</button>
            <button className="lists-button" type="button" onClick={() => onNavigate('help')}><Icon name="nav-asistencia" />Solicitar asistencia</button>
          </div>
        </div>
      </header></ResponsiveHeader>

      <div className="lists-content">
        <section className="lists-hero" aria-labelledby="lists-title">
          <div className="lists-hero-copy"><h1 id="lists-title">Mis <span>listas</span></h1><p>Prepara tus compras y vuelve a utilizarlas cuando quieras.</p></div>
          <div className="lists-banner" aria-hidden="true"><p>Las mismas<br />compras, menos<br />preocupaciones ♡</p><img src={assets.illustrations.productos_frescos} alt="" /></div>
        </section>

        <div className="lists-new-action"><button type="button" className="lists-button" aria-expanded={onNewList ? undefined : creating} aria-controls={onNewList ? undefined : 'lists-create-form'} onClick={() => onNewList ? onNewList() : setCreating(!creating)}><Icon name="icon-plus" />Nueva lista</button></div>
        {creating && <form id="lists-create-form" className="lists-inline-form" onSubmit={event => { event.preventDefault(); if (!newListName.trim()) return; onCreateList(); setCreating(false); setEditing(false) }}>
          <label htmlFor="lists-new-name">Nombre de la lista</label><input id="lists-new-name" autoFocus value={newListName} onChange={event => onNameChange(event.target.value)} placeholder="Ej. Compra semanal" required maxLength={80} />
          <button className="lists-button" type="submit">Crear lista</button><button type="button" onClick={() => setCreating(false)}>Cancelar</button>
        </form>}

        <div className="lists-columns">
          <section className="lists-saved-panel" aria-labelledby="saved-title">
            <h2 id="saved-title"><Icon name="icon-listas" />Tus listas guardadas</h2>
            <div className="lists-saved-stack">
              {lists.map(list => <article key={list.id} className={`lists-saved-card ${selectedList?.id === list.id ? 'is-selected' : ''}`}>
                <button className="lists-card-select" type="button" aria-label={`Seleccionar ${list.name}`} aria-pressed={selectedList?.id === list.id} onClick={() => openList(list)}>
                  <Icon name={listIcon(list)} className="lists-list-symbol" /><span><strong>{list.name}</strong><span>{list.items.length} {list.items.length === 1 ? 'producto' : 'productos'}</span><small>{updatedLabel(list)}</small></span>
                </button>
                <div className="lists-card-actions">
                  <button type="button" aria-label={`Abrir ${list.name}`} onClick={() => openList(list)}><Icon name="icon-carpeta" /><span>Abrir</span></button>
                  <button type="button" aria-label={`Editar ${list.name}`} onClick={() => openList(list, true)}><Icon name="icon-editar" /><span>Editar</span></button>
                  <button type="button" aria-label={`Eliminar ${list.name}`} onClick={() => setDeleteId(deleteId === list.id ? null : list.id)}><Icon name="icon-basura" /><span>Eliminar</span></button>
                </div>
                <button className="lists-card-arrow" type="button" aria-label={`Ver productos de ${list.name}`} onClick={() => openList(list)}><Icon name="icon-flecha-derecha" /></button>
                {deleteId === list.id && <div className="lists-delete-confirm"><span>¿Eliminar «{list.name}»?</span><button type="button" onClick={() => removeList(list)}>Eliminar lista</button><button type="button" onClick={() => setDeleteId(null)}>Cancelar</button></div>}
              </article>)}
              {!lists.length && <p className="lists-empty">Aún no tienes listas. Usa «Nueva lista» para preparar tu compra.</p>}
            </div>
            {deleted && <div className="lists-undo" role="status"><span>Se eliminó «{deleted.list.name}».</span><button type="button" onClick={() => { onRestoreList(deleted.list, deleted.index); setDeleted(null) }}>Deshacer</button></div>}
          </section>

          <section className="lists-detail-panel" aria-labelledby="lists-detail-title" ref={detailRef} tabIndex={-1}>
            <div className="lists-detail-heading"><Icon name={selectedList ? listIcon(selectedList) : 'icon-listas'} className="lists-detail-symbol" /><div><h2 id="lists-detail-title">{selectedList?.name || 'Tu próxima compra'}</h2><p>{selectedProducts.length} {selectedProducts.length === 1 ? 'producto' : 'productos'}{selectedList && <span>{updatedLabel(selectedList)}</span>}</p></div>
              {selectedList && <button type="button" className="lists-detail-edit" aria-label="Editar lista seleccionada" aria-expanded={editing} onClick={() => editing ? setEditing(false) : openList(selectedList, true)}><Icon name="icon-editar" /></button>}
            </div>
            {editing && selectedList && <form className="lists-rename" onSubmit={event => { event.preventDefault(); if (draftName.trim()) onUpdateList({ ...selectedList, name: draftName.trim(), updatedAt: new Date().toISOString() }) }}><label htmlFor="lists-edit-name">Nombre de la lista</label><div><input id="lists-edit-name" ref={nameRef} value={draftName} onChange={event => setDraftName(event.target.value)} required maxLength={80} /><button className="lists-button" type="submit">Guardar</button><button type="button" onClick={() => setEditing(false)}>Listo</button></div></form>}
            <h3 className="lists-products-title">Productos de esta lista</h3>
            <ul className="lists-products">
              {selectedProducts.map(product => <li key={product.id}><ProductImage product={product} /><span>{product.name}</span><span className="lists-product-unit">{product.unit}</span>{editing && <button type="button" aria-label={`Quitar ${product.name}`} onClick={() => onRemoveProduct(product.id)}><Icon name="icon-basura" /></button>}</li>)}
            </ul>
            {!selectedProducts.length && <p className="lists-empty">{selectedList ? (editing ? 'Agrega productos del catálogo de abajo.' : 'Esta lista está vacía. Abre Editar para agregar productos.') : 'Crea una lista para empezar a organizar tus compras.'}</p>}
            {editing && selectedList && <section className="lists-catalog" aria-label="Agregar productos"><h3>Agrega tus productos</h3>{products.map(product => <div className="lists-catalog-row" key={product.id}><ProductImage product={product} /><span>{product.name}<small>${product.price.toFixed(2)} · {product.available ? 'Disponible' : 'Agotado'}</small></span><button type="button" disabled={!product.available || selectedList.items.includes(product.id)} aria-label={`Agregar a lista: ${product.name}`} onClick={() => onAddProduct(product.id)}>{selectedList.items.includes(product.id) ? 'Agregado' : 'Agregar'}</button></div>)}</section>}
            <div className="lists-start"><Icon name="icon-carrito" /><div><strong>¿Todo listo?</strong><p>Usa esta lista para añadir los productos<br className="lists-desktop-break" /> a tu carrito y empezar tu compra.</p></div><button className="lists-button lists-button--blue" type="button" disabled={!selectedProducts.length} onClick={() => onStart(selectedList.id)}>Iniciar compra<Icon name="icon-flecha-derecha" /></button></div>
          </section>
        </div>
        <footer className="lists-footer"><p>Pequeñas compras, grandes momentos <span aria-hidden="true">♡</span></p><span className="lists-footer-line" /><small><strong>AYÚDATE</strong> Tu supermercado, más fácil para todos.</small></footer>
      </div>
    </div>
  )
}
