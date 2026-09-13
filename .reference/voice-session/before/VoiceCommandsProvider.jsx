import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSpeech } from './speechContext.js'
import { VoiceCommandContext } from './voiceCommandContext.js'
import { parseVoiceCommand, voiceExamples } from './voiceCommandParser.js'
import './VoiceCommands.css'

const unsupported = 'Los comandos de voz no están disponibles en este navegador. Puedes seguir utilizando los demás controles de AYÚDATE.'
const permissionError = 'No pudimos acceder al micrófono. Puedes continuar utilizando los controles de AYÚDATE.'
const welcome = 'Bienvenido a AYÚDATE. Puedes utilizar la aplicación mediante asistencia por voz. Toca la pantalla para iniciar la guía por voz.'
const activated = 'Comandos de voz activados. Puedes decir: Inicio, Mis listas, Buscar producto, Mi ruta, Presupuesto, Mi carrito, Solicitar asistencia o ¿Qué puedo decir?'

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
  const permission = useRef(false)
  const pending = useRef(null)
  const ownSpeech = useRef(false)
  const helpDialog = useRef(null)
  const helpButton = useRef(null)
  const helpScreen = useRef(null)
  const welcomeUsed = useRef(false)
  const previousMeta = useRef(meta)
  const actions = useRef({})
  const setState = useCallback(value => { phaseRef.current = value; setPhase(value) }, [])
  const configure = useCallback(value => {
    config.current = value
    setMeta(previous => previous.enabled === value.enabled && previous.screen === value.screen ? previous : { enabled: value.enabled, screen: value.screen })
  }, [])
  const registerScope = useCallback((name, handler) => { scopes.current.set(name, handler); return () => scopes.current.delete(name) }, [])
  const say = useCallback(text => {
    setMessage(text)
    ownSpeech.current = true
    const done = liveSpeech.current.announce(text)
    ownSpeech.current = false
    return done
  }, [])
  const cancel = useCallback((feedback = true) => {
    sequence.current += 1
    clearTimeout(timeout.current)
    const active = recognition.current
    recognition.current = null
    if (active) { active.onend = null; active.onresult = null; active.onerror = null; active.abort() }
    pending.current = null
    setConfirming(false)
    setState('idle')
    if (feedback) { liveSpeech.current.stop(); say('Escucha detenida.') }
  }, [say, setState])
  useEffect(() => beforeSpeak(() => {
    if (!ownSpeech.current && ['listening', 'preparing', 'processing'].includes(phaseRef.current)) cancel(false)
  }), [cancel, beforeSpeak])

  async function execute(command) {
    if (pending.current) {
      const valid = Date.now() < pending.current.expires && pending.current.screen === config.current.screen
      pending.current = null
      setConfirming(false)
      if (command.type === 'yes' && valid) command = { type: 'confirmClearCart' }
      else if (['yes', 'no', 'cancel'].includes(command.type)) { await say('Acción cancelada.'); return }
    }
    if (command.type === 'clearCart') {
      pending.current = { screen: config.current.screen, expires: Date.now() + 30000 }
      setConfirming(true)
      await say('He entendido: vaciar carrito. ¿Deseas continuar? Di sí o no.')
      if (pending.current) actions.current.listen(true)
      return
    }
    if (command.type === 'help') {
      helpScreen.current = config.current.screen
      helpDialog.current.showModal()
      await say('Puedes decir: Ir a inicio, Buscar leche, Seleccionar primer producto, Abrir mi carrito, Leer pantalla o Necesito ayuda en caja.')
      return
    }
    if (command.type === 'pause') { liveSpeech.current.pause(); await say('Lectura pausada.'); return }
    if (command.type === 'resume') { setMessage('Lectura reanudada.'); liveSpeech.current.resume(); return }
    if (command.type === 'stop') { liveSpeech.current.stop(); await say('Lectura detenida.'); return }
    if (command.type === 'cancel') { cancel(); return }
    if (['unknown', 'yes', 'no'].includes(command.type)) { setState('error'); await say('No entendí la instrucción. Inténtalo nuevamente o di: ¿Qué puedo decir?'); return }
    const scoped = scopes.current.get(config.current.screen)?.(command)
    const response = scoped || config.current.onCommand?.(command)
    if (response?.read) { liveSpeech.current.speak(response.read); setMessage('Leyendo.'); return }
    if (response?.message) await say(response.message)
    else { setState('error'); await say('Primero selecciona un producto.') }
  }

  async function listen(confirmation = false, guided = false) {
    if (!confirmation) cancel(false)
    const token = ++sequence.current
    const Constructor = window.SpeechRecognition || window.webkitSpeechRecognition
    setState('preparing')
    setTranscript('')
    if (!Constructor) { setState('error'); await say(unsupported); return }
    try {
      if (!permission.current) {
        if (guided) await say('Guía por voz activada. Para utilizar comandos de voz necesitamos permiso para acceder al micrófono.')
        if (token !== sequence.current) return
        if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) throw new Error('unavailable')
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach(track => track.stop())
        if (token !== sequence.current) return
        permission.current = true
        await say(activated)
      }
      if (token !== sequence.current) return
      if (!confirmation) await say('Escuchando.')
      if (token !== sequence.current) return
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
        if (['not-allowed', 'service-not-allowed', 'audio-capture'].includes(error)) { permission.current = false; await say(permissionError) }
        else await say(error === 'network' ? 'No pudimos reconocer la instrucción. Revisa tu conexión o utiliza los controles de AYÚDATE.' : 'No escuché una instrucción. Inténtalo nuevamente.')
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
      permission.current = false
      pending.current = null
      setConfirming(false)
      setState('error')
      await say(permissionError)
    }
  }
  function activate() { config.current.onEnable?.(); actions.current.listen(false, true) }
  useEffect(() => { actions.current = { listen, execute, activate } })
  useEffect(() => {
    if (!meta.enabled || meta.screen !== previousMeta.current.screen) cancel(false)
    if (meta.screen !== previousMeta.current.screen) helpDialog.current?.close()
    previousMeta.current = meta
  }, [meta, cancel])
  useEffect(() => {
    if (meta.screen !== 'welcome') return
    welcomeUsed.current = false
    const timer = setTimeout(() => { if (config.current.enabled) say(welcome) }, 0)
    function touch(event) {
      if (event.detail === 0 || welcomeUsed.current || !event.target.closest('.wl-screen') || event.target.closest('button,a,input,label,select,textarea,summary,[role="button"]')) return
      welcomeUsed.current = true
      actions.current.activate()
    }
    document.addEventListener('click', touch)
    return () => { clearTimeout(timer); document.removeEventListener('click', touch) }
  }, [meta.screen, say])
  useEffect(() => {
    const hide = () => { if (document.hidden) cancel(false) }
    const pagehide = () => cancel(false)
    document.addEventListener('visibilitychange', hide)
    window.addEventListener('pagehide', pagehide)
    return () => { document.removeEventListener('visibilitychange', hide); window.removeEventListener('pagehide', pagehide); cancel(false) }
  }, [cancel])
  const busy = ['preparing', 'listening', 'processing'].includes(phase)
  const visible = meta.enabled || meta.screen === 'welcome'
  return <VoiceCommandContext.Provider value={{ configure, registerScope, activate, cancel }}>
    {children}
    {visible && speech.commandHost && createPortal(<section className="voice-commands" aria-label="Comandos de voz">
      <div className="voice-command-actions"><button onClick={() => meta.enabled ? actions.current.listen() : activate()} disabled={busy}>{meta.enabled ? 'Comandos de voz' : 'Iniciar guía por voz'}</button>{busy && <button onClick={() => cancel()}>Detener escucha</button>}<button ref={helpButton} onClick={() => { cancel(false); actions.current.execute({ type: 'help' }) }}>Ayuda de voz</button></div>
      {message && <p role="status">{message}</p>}{transcript && <small>He entendido: {transcript}</small>}
      {confirming && <div className="voice-command-actions"><button onClick={() => { const request = pending.current; cancel(false); pending.current = request; actions.current.execute({ type: 'yes' }) }}>Sí, vaciar carrito</button><button onClick={() => cancel()}>No, cancelar</button></div>}
    </section>, speech.commandHost)}
    <dialog className="voice-help" ref={helpDialog} onClose={() => requestAnimationFrame(() => requestAnimationFrame(() => { if (helpScreen.current === config.current.screen) helpButton.current?.focus() }))} aria-labelledby="voice-help-title"><h2 id="voice-help-title">¿Qué puedo decir?</h2><p>Activa Comandos de voz, di una instrucción y espera la respuesta. La escucha se detiene después de cada instrucción.</p><div className="voice-help-groups">{Object.entries(voiceExamples).map(([title, examples]) => <section key={title}><h3>{title}</h3><ul>{examples.map(example => <li key={example}>{example}</li>)}</ul></section>)}</div><button onClick={() => helpDialog.current.close()}>Cerrar ayuda de voz</button></dialog>
  </VoiceCommandContext.Provider>
}

