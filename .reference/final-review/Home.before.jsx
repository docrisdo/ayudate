import ResponsiveHeader from '../components/ResponsiveHeader.jsx'
import { AyudateIcon } from '../components/AyudateIcons.jsx'
import assets from '../../asset-manifest.json'
import './Home.css'

const navItems = [
  ['home', 'Inicio'], ['lists', 'Mis listas'], ['search', 'Buscar producto'],
  ['route', 'Mi ruta'], ['budget', 'Presupuesto'], ['cart', 'Mi carrito'],
]
const cards = [
  { id: 'search', title: 'Buscar producto', text: 'Encuentra lo que necesitas de forma rápida', icon: 'search', tone: 'blue' },
  { id: 'route', title: 'Mi ruta', text: 'Te guiamos por los pasillos del supermercado', icon: 'pin' },
  { id: 'budget', title: 'Presupuesto', text: 'Controla tus gastos en tiempo real', icon: 'calculator', tone: 'blue' },
  { id: 'cart', title: 'Mi carrito', text: 'Revisa y confirma tu compra', icon: 'cart' },
  { id: 'help', title: 'Solicitar asistencia', text: 'Estamos para ayudarte cuando lo necesites', icon: 'help', tone: 'orange' },
]
function Bubble({ name, tone = 'teal' }) {
  return <span className={`home-bubble home-bubble--${tone}`}><AyudateIcon name={name === 'voice' ? 'audio' : name} /></span>
}
export default function HomeScreen({ voiceEnabled, voiceSupported, pictogramsEnabled, listCount, activeList, listProducts, cart, currentStop, onToggleVoice, onNavigate, onRead }) {
  const found = listProducts.filter((product) => cart[product.id] > 0).length
  const productCount = listProducts.length
  const nextStop = currentStop?.product
    ? `${currentStop.product.category} · Pasillo ${currentStop.product.aisle}`
    : currentStop?.label || 'Elige una lista'
  return (
    <div className="home-screen">
      <a className="home-skip" href="#home-content">Saltar al contenido</a>
      <ResponsiveHeader active="home" onNavigate={onNavigate} onRead={onRead} voiceSupported={voiceSupported}><header className="home-header">
        <div className="home-header-inner">
          <button className="home-brand" type="button" onClick={() => onNavigate('home')} aria-label="Ir al inicio de AYÚDATE">
            <img className="home-brand-logo" src={assets.branding.logo} alt="AYÚDATE. Tu supermercado, más fácil para todos." />
          </button>
          <nav className="home-nav" aria-label="Navegación principal">
            {navItems.map(([id, label]) => <button key={id} type="button" aria-current={id === 'home' ? 'page' : undefined} onClick={() => onNavigate(id)}>{label}</button>)}
          </nav>
          <div className="home-header-actions">
            <button type="button" onClick={onRead} disabled={!voiceSupported}><AyudateIcon name="voice" />Leer</button>
            <button type="button" onClick={() => onNavigate('accessibility')}><AyudateIcon name="access" />Accesibilidad</button>
            <button className="home-button" type="button" onClick={() => onNavigate('help')}><AyudateIcon name="help" />Solicitar asistencia</button>
          </div>
        </div>
      </header></ResponsiveHeader>
      <div className="home-content" id="home-content" tabIndex={-1}>
        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-hero-copy">
            <h1 id="home-title">Hola, <span>¿qué necesitas hoy?</span></h1>
            <p>Organiza tu compra o continúa donde la dejaste.</p>
          </div>
          <div className="home-hero-art" aria-hidden="true"><img src={assets.banners.inicio} alt="" /></div>
        </section>
        <section className="home-actions" aria-label="Organiza tu compra">
          <article className="home-list-card">
            <div className="home-notebook" aria-hidden="true"><img src={assets.illustrations.lista_compras} alt="" /></div>
            <div className="home-list-copy">
              <Bubble name="list" />
              <div><h2>Mis listas</h2><p>Prepara y reutiliza tus compras</p><small><AyudateIcon name="list" />{listCount} {listCount === 1 ? 'lista guardada' : 'listas guardadas'}</small></div>
            </div>
            <button className="home-button home-open-lists" type="button" onClick={() => onNavigate('lists')}>Abrir mis listas<AyudateIcon name="arrowRight" /></button>
          </article>
          <div className="home-quick-grid">
            {cards.map((card) => (
              <button key={card.id} className={`home-quick-card home-quick-card--${card.id}`} type="button" onClick={() => onNavigate(card.id)}>
                <Bubble name={card.icon} tone={card.tone} />
                <span className="home-quick-copy"><strong>{card.title}</strong><span>{card.text}</span></span>
                <AyudateIcon name="chevron" className="home-chevron" />
              </button>
            ))}
          </div>
        </section>
        <section className="home-continue" aria-labelledby="continue-title">
          <div className="home-section-heading">
            <h2 id="continue-title">Continúa tu compra</h2>
            <button className="home-text-button" type="button" onClick={() => onNavigate('lists')}>Ver todas mis listas<AyudateIcon name="arrowRight" /></button>
          </div>
          <article className="home-purchase">
            <div className="home-purchase-name"><Bubble name="basket" /><div><h3>{activeList?.name || 'Prepara tu primera compra'}</h3><p><AyudateIcon name="list" />{productCount} {productCount === 1 ? 'producto' : 'productos'}</p></div></div>
            <div className="home-purchase-progress"><strong>{found} {found === 1 ? 'producto encontrado' : 'productos encontrados'}</strong><div><progress max={productCount || 1} value={found} aria-label="Productos encontrados" /><span>{found} de {productCount}</span></div></div>
            <div className="home-next-stop">
              {pictogramsEnabled ? <img className="home-route-pictogram" src={assets.pictograms.routeLocation} alt="" aria-hidden="true" /> : <AyudateIcon name="pin" />}
              <div><p>Próxima parada:</p><strong>{productCount ? nextStop : 'Agrega productos a tu lista'}</strong></div>
            </div>
            <button className="home-button home-button--blue" type="button" onClick={() => onNavigate(productCount ? 'route' : 'lists')}>{productCount ? 'Continuar compra' : 'Preparar compra'}<AyudateIcon name="arrowRight" /></button>
          </article>
        </section>
        <section className="home-access" aria-labelledby="access-title">
          <div className="home-access-copy"><Bubble name="voice" /><div><h2 id="access-title">Accesibilidad activa</h2><p>Personaliza tu experiencia para una compra más cómoda y accesible.</p></div></div>
          <label className="home-voice-toggle">
            <AyudateIcon name="voice" /><span>Lectura en voz alta</span>
            <input type="checkbox" role="switch" checked={voiceEnabled} disabled={!voiceSupported} onChange={(event) => onToggleVoice(event.target.checked)} />
            <span className="home-switch" aria-hidden="true" />
          </label>
          <button className="home-text-button home-access-settings" type="button" onClick={() => onNavigate('accessibility')}><AyudateIcon name="gear" />Configurar accesibilidad<AyudateIcon name="arrowRight" /></button>
        </section>
        <footer className="home-footer"><p>Pequeñas compras, grandes momentos <span aria-hidden="true">♡</span></p><span className="home-footer-line" aria-hidden="true" /><small><strong>AYÚDATE</strong> Tu supermercado, más fácil para todos.</small></footer>
      </div>
    </div>
  )
}
