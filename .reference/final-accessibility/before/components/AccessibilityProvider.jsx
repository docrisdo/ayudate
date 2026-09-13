import { useCallback, useEffect, useRef, useState } from 'react'
import { AccessibilityContext } from './accessibilityContext.js'
import './AccessibilitySupport.css'

export default function AccessibilityProvider({ children }) {
  const [message, setMessage] = useState('')
  const timer = useRef(null)
  const announce = useCallback(text => {
    clearTimeout(timer.current)
    setMessage('')
    timer.current = setTimeout(() => setMessage(text), 80)
  }, [])
  useEffect(() => () => clearTimeout(timer.current), [])
  useEffect(() => {
    function trapDialog(event) {
      if (event.key !== 'Tab') return
      const dialog = document.querySelector('dialog[open]')
      if (!dialog) return
      const controls = [...dialog.querySelectorAll('button,a[href],input,select,textarea,summary,[tabindex="0"]')].filter(element => !element.disabled && element.getClientRects().length && !element.closest('[hidden]'))
      const first = controls[0], last = controls.at(-1)
      if (!first) { event.preventDefault(); return }
      if (event.shiftKey && (document.activeElement === first || !controls.includes(document.activeElement))) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', trapDialog)
    return () => document.removeEventListener('keydown', trapDialog)
  }, [])
  return <AccessibilityContext.Provider value={announce}>
    <a className="a11y-skip" href="#main-content" onClick={event => { event.preventDefault(); document.getElementById('main-content')?.focus() }}>Saltar al contenido principal</a>
    {children}
    <div className="a11y-sr-only" role="status" aria-atomic="true">{message}</div>
  </AccessibilityContext.Provider>
}
