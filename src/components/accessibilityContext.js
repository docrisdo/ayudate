import { createContext, useContext, useEffect } from 'react'

export const AccessibilityContext = createContext(() => {})
export const useAnnounce = () => useContext(AccessibilityContext)

const titles = { welcome: 'Bienvenida', accessibility: 'Configuración de accesibilidad', home: 'Inicio', lists: 'Mis listas', 'new-list': 'Nueva lista', search: 'Buscar producto', route: 'Mi ruta', budget: 'Presupuesto', cart: 'Mi carrito', help: 'Solicitar asistencia' }

export function useScreenFocus(screen) {
  useEffect(() => {
    document.title = `${titles[screen] || 'Inicio'} · AYÚDATE`
    const frame = requestAnimationFrame(() => {
      const title = document.querySelector('#root h1')
      if (title) { title.tabIndex = -1; title.focus({ preventScroll: true }) }
    })
    return () => cancelAnimationFrame(frame)
  }, [screen])
}

// Capture the next surviving control before React removes the focused row.
export function focusAfterRemoval(element, rowSelector, controlSelector, fallback) {
  const row = element?.closest(rowSelector)
  const target = row?.nextElementSibling?.querySelector(controlSelector) || row?.previousElementSibling?.querySelector(controlSelector)
  requestAnimationFrame(() => (target?.isConnected ? target : document.querySelector(fallback))?.focus())
}
