import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { SpeechContext } from './speechContext.js'
import './SpeechControls.css'

export default function SpeechProvider({ children }) {
  const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
  const current = useRef(null)
  const suspended = useRef(null)
  const beforeSpeech = useRef(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [host, setHost] = useState(document.body)
  const [commandHost, setCommandHost] = useState(null)
  const dock = useRef(null)
  const cancelCurrent = useCallback(() => {
    const old = current.current
    current.current = null
    old?.finish(false)
    window.speechSynthesis?.cancel()
  }, [])
  const stop = useCallback(() => {
    suspended.current = null
    cancelCurrent()
    setStatus('idle')
    setError('')
  }, [cancelCurrent])
  const play = useCallback((text, transient = false) => {
    beforeSpeech.current?.()
    if (!supported || !text?.trim()) return Promise.resolve(false)
    if (transient && current.current && !current.current.transient) {
      suspended.current = current.current.utterance.text.slice(current.current.offset)
    } else if (!transient) suspended.current = null
    cancelCurrent()
    window.speechSynthesis.resume()
    const utterance = new SpeechSynthesisUtterance(text)
    let finish
    const completion = new Promise(resolve => { finish = resolve })
    const entry = { utterance, transient, offset: 0, finish }
    current.current = entry
    utterance.lang = 'es-MX'
    utterance.rate = 0.92
    utterance.pitch = 1
    const update = next => { if (current.current === entry) setStatus(next) }
    utterance.onboundary = event => { if (event.name === 'word') entry.offset = event.charIndex }
    utterance.onstart = () => update(window.speechSynthesis.paused ? 'paused' : 'speaking')
    utterance.onpause = () => update('paused')
    utterance.onresume = () => update('speaking')
    function done(ok) {
      if (current.current !== entry) return
      current.current = null
      setStatus(suspended.current ? 'paused' : 'idle')
      finish(ok)
    }
    utterance.onend = () => done(true)
    utterance.onerror = event => {
      if (current.current !== entry) return
      done(false)
      if (!transient && !['canceled', 'interrupted'].includes(event.error)) setError('No pudimos iniciar la lectura. Intenta pulsar Leer de nuevo.')
    }
    setError('')
    setStatus('speaking')
    try { window.speechSynthesis.speak(utterance) }
    catch { utterance.onerror({ error: 'unavailable' }) }
    return completion
  }, [cancelCurrent, supported])
  const speak = useCallback(text => play(text), [play])
  const announce = useCallback(text => play(text, true), [play])
  const pause = useCallback(() => {
    if (!current.current && !suspended.current) return
    window.speechSynthesis?.pause()
    setStatus('paused')
  }, [])
  const resume = useCallback(() => {
    beforeSpeech.current?.()
    if (suspended.current && !current.current) { play(suspended.current); return }
    if (!current.current) return
    window.speechSynthesis.resume()
    setStatus('speaking')
  }, [play])
  const beforeSpeak = useCallback(handler => { beforeSpeech.current = handler; return () => { beforeSpeech.current = null } }, [])
  useEffect(() => {
    const observer = new MutationObserver(() => setHost(document.querySelector('dialog[open]') || document.body))
    observer.observe(document.body, { attributes: true, attributeFilter: ['open'], childList: true, subtree: true })
    window.addEventListener('pagehide', stop)
    return () => { observer.disconnect(); window.removeEventListener('pagehide', stop); suspended.current = null; cancelCurrent() }
  }, [cancelCurrent, stop])
  useEffect(() => {
    const element = dock.current
    const measure = () => document.body.style.setProperty('--voice-dock-height', host === document.body ? `${element?.getBoundingClientRect().height || 0}px` : '0px')
    const observer = new ResizeObserver(measure)
    if (element) observer.observe(element)
    measure()
    return () => { observer.disconnect(); document.body.style.removeProperty('--voice-dock-height') }
  }, [host])
  return <SpeechContext.Provider value={{ speak, announce, pause, resume, stop, beforeSpeak, status, supported, commandHost }}>
    {children}
    {createPortal(<div ref={dock} className={`assistive-dock${host === document.body ? '' : ' assistive-dock--modal'}`}>
      {(status !== 'idle' || error) && <section className="speech-controls" aria-label="Controles de lectura">
        <span role="status">{error || (status === 'paused' ? 'Lectura pausada' : 'Lectura en curso')}</span>
        {status !== 'idle' && <button onClick={status === 'paused' ? resume : pause}><img src={`/assets/icons/svg/${status === 'paused' ? 'icon-play' : 'icon-pausa'}.svg`} alt="" />{status === 'paused' ? 'Reanudar' : 'Pausar'}</button>}
        <button onClick={stop}>{error ? 'Cerrar aviso de lectura' : 'Detener'}</button>
      </section>}
      <div ref={setCommandHost} />
    </div>, host)}
  </SpeechContext.Provider>
}
