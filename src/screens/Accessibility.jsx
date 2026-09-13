import { useState } from 'react'
import ResponsiveHeader from '../components/ResponsiveHeader.jsx'
import assets from '../../asset-manifest.json'
import './Lists.css'
import './Accessibility.css'

const options = [
  ['accompaniment', 'Acompañamiento por voz', 'AYÚDATE te dará indicaciones y resúmenes breves durante tu compra.', 'icon-audio'],
  ['largeText', 'Texto más grande', 'Aumenta el texto para leerlo con mayor comodidad.', 'icon-texto-grande'],
  ['highContrast', 'Alto contraste', 'Refuerza el contraste entre el texto y el fondo.', 'icon-contraste'],
]

function Icon({ name }) { return <img className="lists-icon" src={`/assets/icons/svg/${name}.svg`} alt="" aria-hidden="true" /> }

export default function Accessibility({ preferences: savedPreferences, accompaniment, product, onNavigate, onRead, voiceSupported, onSave, onCancel, initialFlow }) {
  const [preferences, setPreferences] = useState(() => ({ ...savedPreferences, accompaniment }))
  const productMessage = `${product.name}, ${product.unit}. Marca ${product.brand}. Pasillo ${product.aisle}, ${product.shelf}. Precio ${product.price} pesos. ${product.available ? 'Disponible' : 'Agotado'}.`
  const appClass = `app-shell${preferences.largeText ? ' large-text' : ''}${preferences.highContrast ? ' high-contrast' : ''}`
  return <div className={appClass}><div className="lists-screen ac-screen ac-hints">
    <ResponsiveHeader active="accessibility" onNavigate={onNavigate} voiceSupported={voiceSupported} onRead={() => onRead(`Personalizar experiencia. ${options.map(([key, label]) => `${label}: ${preferences[key] ? 'activado' : 'desactivado'}`).join('. ')}`)}>
      <header className="ac-header"><img src={assets.branding.logo} alt="AYÚDATE" /><div className="ac-steps" aria-label="Personalizar experiencia"><span className="ac-step-complete"><Icon name="icon-check" /></span><span><strong>Paso 1</strong><small>Bienvenida</small></span><span className="ac-step-line" /><span className="ac-step-number">2</span><span><strong>Paso 2 de 2</strong><small>Configuración de accesibilidad</small></span></div><p>Tu supermercado, más fácil para todos.</p></header>
    </ResponsiveHeader>
    <main className="ac-content" id="contenido-principal" tabIndex={-1}>
      <section className="ac-hero" aria-labelledby="ac-title"><div><h1 id="ac-title">Personalizar <span>experiencia</span></h1><p>Puedes cambiar estas opciones cuando quieras.</p></div><div className="ac-banner" aria-hidden="true"><p>Una experiencia<br />de compra para<br />tu día a día ♡</p><img src={assets.illustrations.productos_frescos} alt="" /></div></section>
      <div className="ac-columns">
        <section className="ac-panel ac-settings" aria-label="Preferencias personales">{options.map(([key, title, description, icon]) => <div key={key} className={`ac-setting${key === 'accompaniment' ? ' ac-voice' : ''}`}>
          <label className="ac-setting-label"><Icon name={icon} /><span className="ac-setting-copy"><strong>{title}</strong><small id={`ac-description-${key}`}>{description}</small></span><span className="ac-switch"><input type="checkbox" role="switch" aria-label={title} aria-describedby={`ac-description-${key}${key === 'accompaniment' ? ' ac-accompaniment-help' : ''}`} checked={preferences[key]} onChange={event => setPreferences(current => ({ ...current, [key]: event.target.checked }))} /><span className="ac-switch-track" aria-hidden="true"><span>{preferences[key] ? '✓' : ''}</span></span></span></label>
          {key === 'accompaniment' && <><p id="ac-accompaniment-help" className="ac-preference-help">Es opcional. Puede utilizarse junto con un lector de pantalla. Si prefieres escuchar únicamente la voz de tu lector, puedes dejarlo apagado. Se aplicará después de guardar.</p>{!voiceSupported && <p className="ac-preference-help">Este navegador no dispone de voz propia. Los resúmenes seguirán disponibles como texto accesible.</p>}</>}
        </div>)}</section>
        <section className="ac-panel ac-preview" aria-labelledby="ac-preview-title"><div className="ac-preview-heading"><Icon name="icon-ojo" /><div><h2 id="ac-preview-title">Vista previa</h2><p>Así se verá la información con tus preferencias activas.</p></div></div>
          <div className="ac-preview-card"><div className="ac-product"><img className="ac-product-photo" src={product.image || assets.products.leche} alt="" /><div><h3>{product.name} {product.unit}</h3><p>Marca {product.brand}</p><strong className="ac-aisle"><Icon name="icon-navegacion" />Pasillo {product.aisle}</strong><strong className="ac-price">${product.price.toFixed(2)}</strong><span className="ac-available"><Icon name="icon-check" />{product.available ? 'Disponible' : 'Agotado'}</span></div><button className="ac-product-read" aria-label="Leer producto de vista previa" disabled={!voiceSupported} onClick={() => onRead(productMessage)}><Icon name="icon-audio" /></button></div>
            <div className="ac-directions"><Icon name="icon-navegacion" /><div><strong>¿Cómo llegar?</strong><p>{`Busca ${product.shelf.toLowerCase()} en la zona de ${product.category.toLowerCase()}.`}<br />El producto está en el <strong>Pasillo {product.aisle}.</strong></p></div></div>
            <div className="ac-cart-notice"><Icon name="icon-check" /><div><strong>Vista previa de tus preferencias</strong><p>Puedes revisar el texto y el contraste sin modificar tu compra.</p></div></div>
          </div>
        </section>
      </div>
      <div className="ac-bottom-actions"><button className="ac-back" onClick={onCancel}><Icon name="icon-flecha-derecha" />Cancelar</button><button className="lists-button lists-button--blue" onClick={() => onSave(preferences)}>{initialFlow ? 'Guardar y continuar' : 'Guardar y volver'}<Icon name="icon-flecha-derecha" /></button></div>
      <footer className="lists-footer"><p>Pequeñas configuraciones, grandes compras <span aria-hidden="true">♡</span></p><span className="lists-footer-line" /><small><strong>AYÚDATE</strong> Tu supermercado, más fácil para todos.</small></footer>
    </main>
  </div></div>
}
