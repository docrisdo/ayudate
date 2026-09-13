import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { SpeechContext } from './speechContext.js'
import './SpeechControls.css'

export default function SpeechProvider({ children }) {
  const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
  const current = useRef(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [host, setHost] = useState(document.body)
  const stop = useCallback(() => {
    current.current = null
    window.speechSynthesis?.cancel()
    setStatus('idle')
    setError('')
  }, [])
  const speak = useCallback(text => {
    if (!supported || !text?.trim()) return false
    current.current = null
    window.speechSynthesis.cancel()
    window.speechSynthesis.resume()
    const utterance = new SpeechSynthesisUtterance(text)
    current.current = utterance
    utterance.lang = 'es-MX'
    utterance.rate = 0.92
    utterance.pitch = 1
    const update = next => { if (current.current === utterance) setStatus(next) }
    utterance.onstart = () => update(window.speechSynthesis.paused ? 'paused' : 'speaking')
    utterance.onpause = () => update('paused')
    utterance.onresume = () => update('speaking')
    utterance.onend = () => { if (current.current === utterance) { current.current = null; setStatus('idle') } }
    utterance.onerror = event => {
      if (current.current !== utterance) return
      current.current = null
      setStatus('idle')
      if (!['canceled', 'interrupted'].includes(event.error)) setError('No pudimos iniciar la lectura. Intenta pulsar Leer de nuevo.')
    }
    setError('')
    setStatus('speaking')
    try { window.speechSynthesis.speak(utterance); return true }
    catch { utterance.onerror({ error: 'unavailable' }); return false }
  }, [supported])
  const pause = useCallback(() => {
    if (!current.current) return
    window.speechSynthesis.pause()
    setStatus('paused')
  }, [])
  const resume = useCallback(() => {
    if (!current.current) return
    window.speechSynthesis.resume()
    setStatus('speaking')
  }, [])
  useEffect(() => {
    const syncHost = () => setHost(document.querySelector('dialog[open]') || document.body)
    // Controls must remain reachable while a native modal makes the page inert.
    const observer = new MutationObserver(syncHost)
    observer.observe(document.body, { attributes: true, attributeFilter: ['open'], childList: true, subtree: true })
    window.addEventListener('pagehide', stop)
    return () => { observer.disconnect(); window.removeEventListener('pagehide', stop); current.current = null; window.speechSynthesis?.cancel() }
  }, [stop])
  return <SpeechContext.Provider value={{ speak, pause, resume, stop, status, supported }}>
    {children}
    {(status !== 'idle' || error) && createPortal(<section className={`speech-controls${host === document.body ? '' : ' speech-controls--modal'}`} aria-label="Controles de lectura">
      <span role="status">{error || (status === 'paused' ? 'Lectura pausada' : 'Lectura en curso')}</span>
      {status !== 'idle' && <button onClick={status === 'paused' ? resume : pause}><img src={`/assets/icons/svg/${status === 'paused' ? 'icon-play' : 'icon-pausa'}.svg`} alt="" />{status === 'paused' ? 'Reanudar' : 'Pausar'}</button>}
      <button onClick={stop}>{error ? 'Cerrar aviso de lectura' : 'Detener'}</button>
    </section>, host)}
  </SpeechContext.Provider>
}
