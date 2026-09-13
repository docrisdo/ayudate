import { useState } from 'react'
import assets from '../../asset-manifest.json'
import { supportOptions } from './welcomeFlow.js'
import './Welcome.css'

function Icon({ name }) { return <img className="wl-icon" src={`/assets/icons/svg/${name}.svg`} alt="" aria-hidden="true" /> }

export default function Welcome({ initialSelection, onContinue, onSkip }) {
  const [selection, setSelection] = useState(() => initialSelection.filter(id => supportOptions.some(option => option.id === id)))
  function toggle(id) { setSelection(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]) }
  return <div className="wl-screen">
    <header className="wl-header"><img className="wl-logo" src={assets.branding.logo} alt="AYÚDATE" /><button onClick={onSkip}>Omitir<Icon name="icon-flecha-derecha" /></button></header>
    <main className="wl-layout" id="contenido-principal" tabIndex={-1}>
      <section className="wl-config" aria-labelledby="wl-title">
        <div className="wl-wordmark" aria-label="AYÚDATE">AYÚ<span>DATE</span></div><p className="wl-tagline">Tu supermercado, más fácil para todos.</p>
        <h1 id="wl-title">Configura tu experiencia</h1><p className="wl-intro">Selecciona una o varias opciones para que podamos ayudarte durante tu compra.</p><p className="wl-description">Configura tu experiencia para que podamos ayudarte durante tu compra.</p>
        <fieldset className="wl-options"><legend>Elige los apoyos que necesitas</legend>{supportOptions.map(option => <label key={option.id} className={`wl-option${selection.includes(option.id) ? ' is-selected' : ''}`}><img src={option.icon} alt="" /><span><strong>{option.title}</strong><small id={`wl-description-${option.id}`}>{option.text}</small></span><input type="checkbox" checked={selection.includes(option.id)} onChange={() => toggle(option.id)} aria-label={option.title} aria-describedby={`wl-description-${option.id}`} /><span className="wl-check" aria-hidden="true">{selection.includes(option.id) && <Icon name="icon-check" />}</span></label>)}</fieldset>
        <button className="wl-continue" onClick={() => onContinue(selection)}>Continuar<Icon name="icon-flecha-derecha" /></button><button className="wl-skip" onClick={onSkip}>Continuar sin configurar</button>
      </section>
      <aside className="wl-visual" aria-label="Una compra más fácil para tu día a día">
        <img className="wl-photo" src={assets.illustrations.bienvenida_persona_silla_ruedas} alt="Mujer en silla de ruedas usando su teléfono mientras hace la compra en el supermercado." />
        <p className="wl-handwriting">Una compra<br />más fácil para<br />tu día a día ♡</p>
        <div className="wl-feature wl-feature-find"><Icon name="icon-buscar" /><div><strong>Encuentra<br />productos</strong><p>Busca lo que necesitas de forma rápida.</p></div></div>
        <div className="wl-feature wl-feature-route"><Icon name="icon-navegacion" /><div><strong>Sigue tu ruta</strong><p>Te guiamos por los pasillos del supermercado.</p></div></div>
        <div className="wl-feature wl-feature-help"><Icon name="icon-asistencia" /><div><strong>Pide ayuda<br />cuando la necesites</strong><p>Estamos para ayudarte.</p></div></div>
        <p className="wl-wellbeing">Tu bienestar<br />también cuenta ♡</p>
      </aside>
    </main>
  </div>
}
