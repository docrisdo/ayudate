import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSpeech } from './speechContext.js'
import { VoiceCommandContext } from './voiceCommandContext.js'
import { parseVoiceCommand, voiceExamples } from './voiceCommandParser.js'
import './VoiceCommands.css'

const unsupported = 'Los comandos de voz no están disponibles en este navegador. Puedes seguir utilizando los demás controles de AYÚDATE.'
const permissionError = 'No pudimos acceder al micrófono. Puedes continuar utilizando los controles de AYÚDATE.'

export default function VoiceCommandsProvider({ children }) {
  const speech = useSpeech()
  const { beforeSpeak } = speech
  const liveSpeech = useRef(speech)
  useEffect(() => { liveSpeech.current = speech })
  const config = useRef({})
  const scopes = useRef(new Map())
  const [meta, setMeta] = useState({ enabled: false, screen: null })
  const [phase, setPhase] = useState('idle')
  const [message, setMessage] = useState('')
  const [transcript, setTranscript] = useState('')
  const [confirming, setConfirming] = useState(false)
  const phaseRef = useRef('idle')
  const recognition = useRef(null)
  const sequence = useRef(0)
  const timeout = useRef(null)
  const pending = useRef(null)
  const helpDialog = useRef(null)
  const helpButton = useRef(null)
  const helpScreen = useRef(null)
  const previousMeta = useRef(meta)
  const actions = useRef({})
  const setState = useCallback(value => { phaseRef.current = value; setPhase(value) }, [])
  const configure = useCallback(value => {
    config.current = value
    setMeta(previous => previous.enabled === value.enabled && previous.screen === value.screen ? previous : { enabled: value.enabled, screen: value.screen })
  }, [])
  const registerScope = useCallback((name, handler) => { scopes.current.set(name, handler); return () => scopes.current.delete(name) }, [])
  const reportStatus = useCallback(text => {
    setMessage(text)
    return Promise.resolve()
  }, [])
  const cancel = useCallback((feedback = true) => {
    sequence.current += 1
    clearTimeout(timeout.current)
    const active = recognition.current
    recognition.current = null
    if (active) { active.onstart = null; active.onend = null; active.onresult = null; active.onerror = null; active.abort() }
    pending.current = null
    setConfirming(false)
    if (['preparing', 'listening', 'processing'].includes(phaseRef.current)) setMessage('Micrófono detenido.')
    setState('idle')
    if (feedback) { liveSpeech.current.stop(); reportStatus('Escucha detenida.') }
  }, [reportStatus, setState])
  useEffect(() => beforeSpeak(() => {
    if (['listening', 'preparing', 'processing'].includes(phaseRef.current)) cancel(false)
  }), [cancel, beforeSpeak])

  async function execute(command) {
    if (pending.current) {
      const valid = Date.now() < pending.current.expires && pending.current.screen === config.current.screen
      pending.current = null
      setConfirming(false)
      if (command.type === 'yes' && valid) command = { type: 'confirmClearCart' }
      else if (['yes', 'no', 'cancel'].includes(command.type)) { await reportStatus('Acción cancelada.'); return }
    }
    if (command.type === 'clearCart') {
      pending.current = { screen: config.current.screen, expires: Date.now() + 30000 }
      setConfirming(true)
      await reportStatus('He entendido: vaciar carrito. Confirma con los botones o pulsa Responder por voz para decir sí o no.')
      return
    }
    if (command.type === 'help') {
      helpScreen.current = config.current.screen
      helpDialog.current.showModal()
      helpDialog.current.querySelector('h2')?.focus()
      return
    }
    if (command.type === 'pause') { liveSpeech.current.pause(); await reportStatus('Lectura pausada.'); return }
    if (command.type === 'resume') { setMessage('Lectura reanudada.'); liveSpeech.current.resume(); return }
    if (command.type === 'stop') { liveSpeech.current.stop(); await reportStatus('Lectura detenida.'); return }
    if (command.type === 'cancel') { cancel(); return }
    if (['unknown', 'yes', 'no'].includes(command.type)) { setState('error'); await reportStatus('No entendí la instrucción. Pulsa Dar un comando por voz para intentarlo de nuevo o abre Ver comandos de voz.'); return }
    const scoped = scopes.current.get(config.current.screen)?.(command)
    const response = scoped || config.current.onCommand?.(command)
    if (response?.read) {
      if (['readScreen', 'readCart', 'readProduct'].includes(command.type)) { liveSpeech.current.speak(response.read); setMessage('Lectura solicitada en curso.'); }
      else setMessage(response.read)
      return
    }
    if (response?.message) await reportStatus(response.message)
    else { setState('error'); await reportStatus('Primero selecciona un producto.') }
  }

  async function listen(confirmation = false) {
    if (!confirmation) cancel(false)
    // Keep reading paused until the user explicitly resumes it.
    liveSpeech.current.pause()
    const token = ++sequence.current
    const Constructor = window.SpeechRecognition || window.webkitSpeechRecognition
    setState('preparing')
    setTranscript('')
    setMessage('Activando micrófono. Si el navegador solicita permiso, puedes aceptarlo o rechazarlo.')
    if (!Constructor) { setState('error'); await reportStatus(unsupported); return }
    try {
      const engine = new Constructor()
      recognition.current = engine
      engine.lang = 'es-MX'
      engine.continuous = false
      engine.interimResults = false
      engine.maxAlternatives = 1
      let result = ''
      let error = ''
      let finished = false
      engine.onstart = () => { if (token === sequence.current) { setState('listening'); setMessage('Escuchando… Di una instrucción.') } }
      engine.onresult = event => {
        if (token !== sequence.current || result) return
        const final = Array.from(event.results).find(item => item.isFinal)
        if (!final) return
        result = final[0].transcript
        setTranscript(result)
        setState('processing')
        setMessage('Procesando instrucción…')
        engine.abort()
      }
      engine.onerror = event => { if (event.error !== 'aborted') error = event.error }
      engine.onend = async () => {
        if (finished || token !== sequence.current) return
        finished = true
        clearTimeout(timeout.current)
        recognition.current = null
        if (result && !error) { setState('understood'); await actions.current.execute(parseVoiceCommand(result)); return }
        pending.current = null
        setConfirming(false)
        setState('error')
        if (['not-allowed', 'service-not-allowed', 'audio-capture'].includes(error)) { await reportStatus(permissionError) }
        else await reportStatus(error === 'network' ? 'No pudimos reconocer la instrucción. Revisa tu conexión o utiliza los controles de AYÚDATE.' : 'No escuché una instrucción. Inténtalo nuevamente.')
      }
      engine.start()
      timeout.current = setTimeout(() => { if (token === sequence.current) engine.abort() }, 15000)
    } catch {
      if (token !== sequence.current) return
      const active = recognition.current
      recognition.current = null
      if (active) {
        active.onstart = null
        active.onresult = null
        active.onerror = null
        active.onend = null
        active.abort()
      }
      clearTimeout(timeout.current)
      pending.current = null
      setConfirming(false)
      setState('error')
      await reportStatus(permissionError)
    }
  }
  function activate() { config.current.onEnable?.(); setMessage('Comandos de voz habilitados. El micrófono está detenido. Pulsa Dar un comando por voz para comenzar.') }
  useEffect(() => { actions.current = { listen, execute, activate } })
  useEffect(() => {
    if (!meta.enabled || meta.screen !== previousMeta.current.screen) cancel(false)
    if (meta.screen !== previousMeta.current.screen) helpDialog.current?.close()
    previousMeta.current = meta
  }, [meta, cancel])
  useEffect(() => {
    const hide = () => { if (document.hidden) cancel(false) }
    const pagehide = () => cancel(false)
    document.addEventListener('visibilitychange', hide)
    window.addEventListener('pagehide', pagehide)
    return () => { document.removeEventListener('visibilitychange', hide); window.removeEventListener('pagehide', pagehide); cancel(false) }
  }, [cancel])
  const busy = ['preparing', 'listening', 'processing'].includes(phase)
  const visible = meta.enabled
  const examples = Object.entries(voiceExamples).filter(([group]) => group === 'Navegar' || group === 'Lectura' || (group === 'Buscar' && meta.screen === 'search') || (group === 'Asistencia' && meta.screen === 'help'))
  return <VoiceCommandContext.Provider value={{ configure, registerScope, activate, cancel }}>
    {children}
    {visible && speech.commandHost && createPortal(<section className="voice-commands" aria-label="Comandos de voz">
      <div className="voice-command-actions"><button onClick={() => { if (!meta.enabled) activate(); actions.current.listen() }} disabled={busy}>Dar un comando por voz</button>{busy && <button onClick={() => cancel()}>Detener escucha</button>}<button ref={helpButton} onClick={() => { cancel(false); actions.current.execute({ type: 'help' }) }}>Ver comandos de voz</button></div>
      <p role="status" aria-atomic="true" hidden={!message}>{message}</p>{transcript && <small>Comando reconocido: {transcript}. Micrófono detenido.</small>}
      {confirming && <div className="voice-command-actions"><button disabled={busy} onClick={() => actions.current.listen(true)}>Responder por voz: sí o no</button><button onClick={() => { const request = pending.current; cancel(false); pending.current = request; actions.current.execute({ type: 'yes' }) }}>Sí, vaciar carrito</button><button onClick={() => cancel()}>No, cancelar</button></div>}
    </section>, speech.commandHost)}
    <dialog className="voice-help" ref={helpDialog} onClose={() => requestAnimationFrame(() => requestAnimationFrame(() => { if (helpScreen.current === config.current.screen) helpButton.current?.focus() }))} aria-labelledby="voice-help-title"><h2 id="voice-help-title" tabIndex={-1}>¿Qué puedo decir?</h2><p>Pulsa Dar un comando por voz, di una instrucción y espera la respuesta. La escucha se detiene después de cada instrucción.</p><div className="voice-help-groups">{examples.map(([title, examples]) => <section key={title}><h3>{title}</h3><ul>{examples.map(example => <li key={example}>{example}</li>)}</ul></section>)}</div><button onClick={() => helpDialog.current.close()}>Cerrar ayuda de voz</button></dialog>
  </VoiceCommandContext.Provider>
}

