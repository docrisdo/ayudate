import { useRef, useState } from 'react'
import ResponsiveHeader from '../components/ResponsiveHeader.jsx'
import assets from '../../asset-manifest.json'
import { assistanceOptions } from './assistanceOptions.js'
import { useVoiceScope } from '../components/voiceCommandContext.js'
import './Lists.css'
import './Assistance.css'

const navigation = [['home', 'Inicio'], ['lists', 'Mis listas'], ['search', 'Buscar producto'], ['route', 'Mi ruta'], ['budget', 'Presupuesto'], ['cart', 'Mi carrito']]
function Icon({ name }) { return <img className="lists-icon" src={`/assets/icons/svg/${name}.svg`} alt="" aria-hidden="true" /> }
const pictogram = option => `/assets/pictograms/svg/pictograma-${option.pictogram}.svg`

export default function Assistance({ selectedId, onSelect, onNavigate, onRead, voiceSupported }) {
  const selected = assistanceOptions.find(option => option.id === selectedId) || assistanceOptions[0]
  const [confirmed, setConfirmed] = useState(false)
  function notifyStaff() { const inside = document.activeElement?.closest('dialog'); setConfirmed(true); requestAnimationFrame(() => (inside ? document.querySelector('.as-confirmation') : document.querySelector('.as-notify-result'))?.focus()) }
  function selectHelp(id) { onSelect(id); setConfirmed(false) }
  useVoiceScope('help', command => {
    if (command.type === 'assistance') {
      selectHelp(command.id)
      return { read: assistanceOptions.find(option => option.id === command.id).message }
    }
    if (command.type !== 'notify') return null
    notifyStaff()
    return { message: 'Solicitud enviada. Espera un momento mientras alguien acude a ayudarte.' }
  })
  const dialog = useRef(null)
  const read = () => onRead(`Solicitar asistencia. ${selected.title}. ${selected.message}`)
  return <div className="lists-screen as-screen">
    <ResponsiveHeader active="help" onNavigate={onNavigate} onRead={read} voiceSupported={voiceSupported}><header className="lists-header"><div className="lists-header-inner">
      <button className="lists-brand" onClick={() => onNavigate('home')} aria-label="Ir al inicio de AYÚDATE"><img src={assets.branding.logo} alt="AYÚDATE" /></button>
      <nav className="lists-nav" aria-label="Navegación principal">{navigation.map(([id, label]) => <button key={id} onClick={() => onNavigate(id)}>{label}</button>)}</nav>
      <div className="lists-header-actions"><button disabled={!voiceSupported} onClick={read}><Icon name="nav-leer" />Leer</button><button onClick={() => onNavigate('accessibility')}><Icon name="nav-accesibilidad" />Accesibilidad</button><button className="lists-button" aria-current="page" onClick={() => onNavigate('help')}><Icon name="nav-asistencia" />Solicitar asistencia</button></div>
    </div></header></ResponsiveHeader>
    <main className="as-content" id="contenido-principal" tabIndex={-1}>
      <section className="as-hero" aria-labelledby="as-title"><div><h1 id="as-title"><span className="a11y-sr-only">Solicitar asistencia. </span>¿Cómo podemos <span>ayudarte?</span></h1><p>Selecciona una opción para pedir apoyo rápidamente.</p></div><div className="as-banner" aria-hidden="true"><p>Estamos<br />para ayudarte ♡</p><div className="as-agent"><img src={assets.banners.asistencia} alt="" /></div></div></section>
      <div className="as-options" role="group" aria-label="Opciones de asistencia">{assistanceOptions.map(option => <button key={option.id} className={`as-option${selected.id === option.id ? ' is-selected' : ''}`} aria-pressed={selected.id === option.id} onClick={() => selectHelp(option.id)}><img className="as-pictogram" src={pictogram(option)} alt="" /><span className="as-option-copy"><strong>{option.title}</strong><span>{option.text}</span></span><span className="as-selection" aria-hidden="true">{selected.id === option.id && <span />}</span></button>)}
        <section className="as-notify as-panel" aria-label="Notificar al personal">
          {confirmed ? <div className="as-notify-result" tabIndex={-1} role="status"><Icon name="icon-check" /><div><strong>Solicitud enviada</strong><p>El personal de la tienda ha sido notificado. Espera un momento mientras alguien acude a ayudarte.</p><small>Esperando apoyo del personal…</small></div></div> : <><p>Se notificará: <strong>{selected.title}</strong></p><button className="lists-button" aria-label={`Notificar al personal: ${selected.title}`} onClick={notifyStaff}><Icon name="nav-asistencia" />Notificar al personal</button></>}
        </section>
      </div>
      <section className="as-panel as-message" aria-labelledby="as-message-title"><h2 id="as-message-title">Mensaje para mostrar</h2><div className="as-message-body"><div className="as-phone"><img src={assets.illustrations.celular_ayudate} alt="" /></div><div className="as-message-copy"><p className="as-message-text" aria-live="polite" aria-atomic="true">{selected.message}</p><p className="as-message-hint">Puedes mostrar este mensaje a un empleado del supermercado.</p><div className="as-actions"><button className="lists-button" disabled={!voiceSupported} onClick={() => onRead(selected.message)}><Icon name="nav-leer" />Leer mensaje en voz alta</button><button className="as-show" onClick={() => dialog.current.showModal()}><Icon name="icon-ojo" />Mostrar mensaje en pantalla</button></div></div></div></section>
      <aside className="as-info"><Icon name="icon-info" /><p>Si necesitas otra forma de comunicarte, puedes seleccionar otra opción o pedir apoyo en el punto de atención al cliente.</p><span>Juntos es más fácil ♡</span></aside>
      <footer className="lists-footer"><p>Pequeñas compras, grandes momentos <span aria-hidden="true">♡</span></p><span className="lists-footer-line" /><small><strong>AYÚDATE</strong> Tu supermercado, más fácil para todos.</small></footer>
    </main>
    <dialog className="as-dialog" ref={dialog} aria-labelledby="as-dialog-title"><div className="as-dialog-heading"><img src={pictogram(selected)} alt="" /><h2 id="as-dialog-title">{selected.title}</h2></div><p className="as-dialog-message">{selected.message}</p>{confirmed && <div className="as-confirmation" tabIndex={-1} role="status"><Icon name="icon-check" /><div><strong>Solicitud enviada</strong><p>El personal de la tienda ha sido notificado. Espera un momento mientras alguien acude a ayudarte.</p></div></div>}<div className="as-dialog-actions"><button className="lists-button" disabled={!voiceSupported} onClick={() => onRead(selected.message)}><Icon name="nav-leer" />Leer mensaje</button>{!confirmed && <button className="lists-button lists-button--blue" onClick={notifyStaff}>Confirmar solicitud</button>}<button className="as-close" onClick={() => dialog.current.close()}>Volver a las opciones</button></div></dialog>
  </div>
}

