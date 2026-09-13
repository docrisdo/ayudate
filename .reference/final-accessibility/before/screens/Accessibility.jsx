import { useState } from 'react'
import { useSpeech } from '../components/speechContext.js'
import { useVoiceCommands } from '../components/voiceCommandContext.js'
import ResponsiveHeader from '../components/ResponsiveHeader.jsx'
import assets from '../../asset-manifest.json'
import './Lists.css'
import './Accessibility.css'

const options = [
  ['voiceCommands', 'Comandos de voz', 'Controla AYÚDATE utilizando instrucciones habladas.', 'icon-asistencia'],
  ['voice', 'Lectura en voz alta', 'AYÚDATE puede leer en voz alta los textos, productos e indicaciones durante tu compra.', 'icon-audio'],
  ['autoRead', 'Lectura automática', 'Lee automáticamente la información principal al entrar a una pantalla.', 'icon-audio'],
  ['largeText', 'Texto más grande', 'Hace que todo el texto se vea más grande y fácil de leer.', 'icon-texto-grande'],
  ['highContrast', 'Alto contraste', 'Usa colores con mayor contraste para una mejor visibilidad.', 'icon-contraste'],
  ['visualHints', 'Indicaciones visuales', 'Muestra resaltados y señales visuales en la pantalla.', 'icon-indicaciones-visuales'],
  ['vibrations', 'Vibraciones', 'Recibe vibraciones en tu dispositivo para notificaciones importantes.', 'icon-vibracion'],
  ['accessibleRoute', 'Ruta accesible', 'Te muestra la ruta más accesible dentro del supermercado.', 'icon-navegacion'],
  ['bigButtons', 'Botones simplificados', 'Muestra botones más grandes y con menos texto.', 'icon-botones-simplificados'],
  ['pictograms', 'Apoyo con imágenes', 'Muestra imágenes claras en productos, secciones e indicaciones.', 'icon-apoyo-imagenes'],
]
function Icon({ name }) { return <img className="lists-icon" src={`/assets/icons/svg/${name}.svg`} alt="" aria-hidden="true" /> }

export default function Accessibility({ preferences, onPreferences, product, quantity, onAddToCart, onNavigate, onRead, voiceSupported, onSave }) {
  const [notice, setNotice] = useState('')
  const { status: speechStatus, pause, resume } = useSpeech()
  const voiceCommands = useVoiceCommands()
  const canVibrate = typeof navigator.vibrate === 'function'
  const productMessage = `${product.name}, ${product.unit}. Marca ${product.brand}. Pasillo ${product.aisle}, ${product.shelf}. Precio ${product.price} pesos. ${product.available ? 'Disponible' : 'Agotado'}.`
  function toggle(key, checked) {
    onPreferences({ ...preferences, [key]: checked })
    if (key === 'voiceCommands') { if (checked) voiceCommands.activate(); else voiceCommands.cancel() }
    if (key === 'vibrations' && checked) {
      const vibrated = canVibrate && navigator.vibrate(120)
      setNotice(vibrated ? 'Vibración activada.' : 'Preferencia guardada. Este dispositivo no permite vibrar.')
    } else setNotice('')
  }
  function play() {
    if (!voiceSupported) return
    if (speechStatus === 'paused') resume()
    else onRead(`AYÚDATE listo. ${productMessage}`)
    setNotice('Lectura iniciada.')
  }
  return <div className={`lists-screen ac-screen${preferences.visualHints ? ' ac-hints' : ''}`}>
    <ResponsiveHeader active="accessibility" onNavigate={onNavigate} voiceSupported={voiceSupported} onRead={() => onRead(`Configuración de accesibilidad. ${options.map(([key, label]) => `${label}: ${preferences[key] ? 'activado' : 'desactivado'}`).join('. ')}`)}>
      <header className="ac-header"><img src={assets.branding.logo} alt="AYÚDATE" /><div className="ac-steps" aria-label="Paso 2 de 2: Configuración de accesibilidad"><span className="ac-step-complete"><Icon name="icon-check" /></span><span><strong>Paso 1</strong><small>Tu cuenta</small></span><span className="ac-step-line" /><span className="ac-step-number">2</span><span><strong>Paso 2 de 2</strong><small>Configuración de accesibilidad</small></span></div><p>Tu supermercado, más fácil para todos.</p></header>
    </ResponsiveHeader>
    <main className="ac-content" id="main-content" tabIndex={-1}>
      <section className="ac-hero" aria-labelledby="ac-title"><div><h1 id="ac-title">Haz AYÚ<span>DATE más cómodo</span> para ti</h1><p>Puedes cambiar estas opciones cuando quieras.</p></div><div className="ac-banner" aria-hidden="true"><p>Una experiencia<br />de compra para<br />tu día a día ♡</p><img src={assets.illustrations.productos_frescos} alt="" /></div></section>
      <div className="ac-columns">
        <section className="ac-panel ac-settings" aria-label="Preferencias de accesibilidad">{options.map(([key, title, description, icon]) => <div key={key} className={`ac-setting${key === 'voice' ? ' ac-voice' : ''}`}><label className="ac-setting-label"><Icon name={icon} /><span className="ac-setting-copy"><strong>{title}</strong><small id={`ac-description-${key}`}>{description}</small></span><span className="ac-switch"><input type="checkbox" aria-label={title} aria-describedby={`ac-description-${key}`} checked={Boolean(preferences[key])} onChange={event => toggle(key, event.target.checked)} /><span className="ac-switch-track" aria-hidden="true"><span>{preferences[key] ? '✓' : ''}</span></span></span></label>{key === 'voice' && <div className="ac-voice-controls"><button className="lists-button" onClick={play} disabled={!voiceSupported}><Icon name="icon-play" />Reproducir</button><button className="ac-pause" disabled={!voiceSupported} onClick={() => { pause(); setNotice('Lectura pausada.') }}><Icon name="icon-pausa" />Pausar</button><Icon name="icon-audio" /></div>}{key === 'voice' && !voiceSupported && <p className="ac-capability">La lectura en voz alta no está disponible en este navegador.</p>}{key === 'vibrations' && !canVibrate && <p className="ac-capability">Este dispositivo no admite vibración.</p>}</div>)}</section>
        <section className="ac-panel ac-preview" aria-labelledby="ac-preview-title"><div className="ac-preview-heading"><Icon name="icon-ojo" /><div><h2 id="ac-preview-title">Vista previa</h2><p>Así se verá la información con tus preferencias activas.</p></div></div>
          <div className="ac-preview-card"><div className="ac-product"><img className="ac-product-photo" src={product.image || assets.products.leche} alt={`${product.name}, ${product.brand}`} /><div><h3>{product.name} {product.unit}</h3><p>Marca {product.brand}</p><strong className="ac-aisle">{preferences.pictograms && <Icon name="icon-navegacion" />}Pasillo {product.aisle}</strong><strong className="ac-price">${product.price.toFixed(2)}</strong><span className="ac-available">{preferences.pictograms && <Icon name="icon-check" />}{product.available ? 'Disponible' : 'Agotado'}</span></div><button className="ac-product-read" aria-label="Leer producto de vista previa" disabled={!voiceSupported} onClick={() => onRead(productMessage)}><Icon name="icon-audio" /></button></div>
            <div className="ac-directions">{preferences.pictograms && <Icon name="icon-navegacion" />}<div><strong>¿Cómo llegar?</strong><p>{preferences.accessibleRoute ? 'Sigue los pasillos principales y evita cruces innecesarios.' : `Busca ${product.shelf.toLowerCase()} en la zona de ${product.category.toLowerCase()}.`}<br />El producto está en el <strong>Pasillo {product.aisle}.</strong></p></div></div>
            <div className="ac-cart-notice">{preferences.pictograms && <Icon name="icon-check" />}<div><strong>{quantity > 0 ? 'Producto agregado a tu carrito' : 'Prueba tus preferencias'}</strong><p>{quantity > 0 ? 'Puedes continuar con tu compra o buscar otro producto.' : 'Agrega este producto para comprobar el aviso en pantalla.'}</p><button className="ac-add" onClick={() => { onAddToCart(product.id); if (preferences.vibrations && canVibrate) navigator.vibrate(120); setNotice('Producto agregado al carrito.') }} disabled={!product.available}>{quantity > 0 ? 'Agregar otra unidad' : 'Agregar al carrito'}</button></div></div>
          </div>
        </section>
      </div>
      {notice && <p className="ac-notice" role="status">{notice}</p>}
      <div className="ac-bottom-actions"><button className="ac-back" onClick={() => onNavigate('welcome')}><Icon name="icon-flecha-derecha" />Volver</button><button className="lists-button lists-button--blue" onClick={onSave}>Guardar y continuar<Icon name="icon-flecha-derecha" /></button></div>
      <footer className="lists-footer"><p>Pequeñas configuraciones, grandes compras <span aria-hidden="true">♡</span></p><span className="lists-footer-line" /><small><strong>AYÚDATE</strong> Tu supermercado, más fácil para todos.</small></footer>
    </main>
  </div>
}
