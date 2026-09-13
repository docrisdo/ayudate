import assets from '../../asset-manifest.json'
import './Welcome.css'

function Icon({ name }) { return <img className="wl-icon" src={`/assets/icons/svg/${name}.svg`} alt="" aria-hidden="true" /> }

export default function Welcome({ onStart, onPersonalize }) {
  return <div className="wl-screen">
    <header className="wl-header"><img className="wl-logo" src={assets.branding.logo} alt="AYÚDATE" /></header>
    <main className="wl-layout" id="contenido-principal" tabIndex={-1}>
      <section className="wl-config" aria-labelledby="wl-title">
        <div className="wl-wordmark" aria-label="AYÚDATE">AYÚ<span>DATE</span></div><p className="wl-tagline">Tu supermercado, más fácil para todos.</p>
        <h1 id="wl-title">Bienvenido a AYÚDATE</h1>
        <p className="wl-intro">Organiza tus listas, encuentra productos y lleva el control de tu compra.</p>
        <p className="wl-description">Puedes personalizar tu experiencia cuando quieras.</p>
        <div className="wl-entry-actions"><button className="wl-continue" onClick={onStart}>Comenzar<Icon name="icon-flecha-derecha" /></button><button className="wl-skip" onClick={onPersonalize}>Personalizar experiencia</button></div>
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
