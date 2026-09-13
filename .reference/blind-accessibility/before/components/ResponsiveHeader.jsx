import { useEffect, useId, useRef, useState } from 'react'
import assets from '../../asset-manifest.json'
import './ResponsiveHeader.css'

const navigation = [['home', 'Inicio'], ['lists', 'Mis listas'], ['search', 'Buscar producto'], ['route', 'Mi ruta'], ['budget', 'Presupuesto'], ['cart', 'Mi carrito'], ['help', 'Solicitar asistencia']]

// Wrap every screen's desktop header here so mobile navigation stays consistent.
export default function ResponsiveHeader({ children, active, onNavigate, onRead, voiceSupported }) {
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const header = useRef(null)
  const toggle = useRef(null)
  useEffect(() => {
    if (!open) return
    function outside(event) { if (!header.current?.contains(event.target)) setOpen(false) }
    function escape(event) {
      if (event.key === 'Escape') { setOpen(false); toggle.current?.focus() }
    }
    const desktop = window.matchMedia('(min-width: 769px)')
    function resize(event) { if (event.matches) setOpen(false) }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    desktop.addEventListener('change', resize)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
      desktop.removeEventListener('change', resize)
    }
  }, [open])
  function navigate(id) { setOpen(false); onNavigate(id) }
  return <div className="responsive-header">
    {children}
    <header className="mobile-header" ref={header}>
      <div className="mobile-header-bar">
        <button className="mobile-header-brand" onClick={() => navigate('home')} aria-label="Ir al inicio de AYÚDATE"><img src={assets.branding.logo} alt="AYÚDATE" /></button>
        <button className="mobile-header-read" onClick={onRead} disabled={!voiceSupported}><img src="/assets/icons/svg/nav-leer.svg" alt="" />Leer</button>
        <button className="mobile-header-access" onClick={() => navigate('accessibility')} aria-current={active === 'accessibility' ? 'page' : undefined}><img src="/assets/icons/svg/nav-accesibilidad.svg" alt="" />Accesibilidad</button>
        <button className="mobile-header-toggle" ref={toggle} aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open} aria-controls={menuId} onClick={() => setOpen(!open)}><span className={open ? 'mobile-header-bars is-open' : 'mobile-header-bars'} aria-hidden="true"><i /><i /><i /></span></button>
      </div>
      <nav id={menuId} className="mobile-header-menu" aria-label="Navegación principal" hidden={!open}>{navigation.map(([id, label]) => <button key={id} aria-current={active === id || (active === 'newlist' && id === 'lists') ? 'page' : undefined} onClick={() => navigate(id)}>{label}{(active === id || (active === 'newlist' && id === 'lists')) && <span aria-hidden="true">Actual</span>}</button>)}</nav>
    </header>
  </div>
}
