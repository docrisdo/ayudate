import { useEffect, useRef, useState } from 'react'
import { createBarcodeDecoder } from './barcodeDecoder.js'
import './BarcodeScanner.css'

export default function BarcodeScanner({ products, onFound, onClose }) {
  const dialog = useRef(null)
  const video = useRef(null)
  const manualInput = useRef(null)
  const session = useRef(null)
  const [mode, setMode] = useState('camera')
  const [attempt, setAttempt] = useState(0)
  const [code, setCode] = useState('')
  const [notice, setNotice] = useState('Solicitando acceso a la cámara…')
  const [notFound, setNotFound] = useState(false)

  function stopCamera() { session.current?.(); session.current = null }
  function close() { stopCamera(); onClose() }
  function lookup(value) {
    stopCamera()
    // Preserve leading zeroes; UPC-A and its EAN-13 form identify the same item.
    const clean = value.replace(/\s/g, '')
    const product = products.find(item => item.barcode === clean || String(item.id) === clean || (clean.length === 12 && item.barcode === `0${clean}`))
    if (product) { onFound(product); return }
    setCode(clean)
    setNotFound(true)
    setNotice('Este código no está registrado en el catálogo de demostración.')
    setMode('result')
  }
  const lookupRef = useRef(lookup)
  useEffect(() => { lookupRef.current = lookup })
  useEffect(() => {
    dialog.current.showModal()
    return () => session.current?.()
  }, [])
  useEffect(() => {
    if (mode !== 'camera') return
    let disposed = false
    let stream
    let timer
    const element = video.current
    const stop = () => {
      disposed = true
      clearTimeout(timer)
      stream?.getTracks().forEach(track => track.stop())
      if (element) element.srcObject = null
    }
    session.current = stop
    async function start() {
      try {
        if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) throw new Error('unsupported')
        stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } })
        if (disposed) { stream.getTracks().forEach(track => track.stop()); return }
        element.srcObject = stream
        await element.play()
        const decode = await createBarcodeDecoder()
        if (disposed) return
        setNotice('Coloca el código de barras dentro del recuadro.')
        const scan = async () => {
          if (disposed) return
          try {
            const value = element.readyState >= 2 ? await decode(element) : null
            if (disposed) return
            if (value) { lookupRef.current(value); return }
            timer = setTimeout(scan, 250)
          } catch {
            if (!disposed) {
              stop()
              setNotice('No pudimos reconocer el código con la cámara. Puedes ingresarlo manualmente.')
              setMode('manual')
            }
          }
        }
        scan()
      } catch {
        if (disposed) return
        stop()
        setNotice('No pudimos acceder a la cámara. Puedes ingresar el código manualmente.')
        setMode('manual')
      }
    }
    start()
    const hide = () => { if (document.hidden) { stop(); setMode('manual'); setNotice('Cámara detenida. Puedes volver a escanear o ingresar el código manualmente.') } }
    document.addEventListener('visibilitychange', hide)
    window.addEventListener('pagehide', stop)
    return () => { stop(); document.removeEventListener('visibilitychange', hide); window.removeEventListener('pagehide', stop) }
  }, [mode, attempt])
  useEffect(() => {
    if (mode === 'manual') manualInput.current?.focus()
    else if (mode === 'result') dialog.current?.querySelector('h3')?.focus()
    else dialog.current?.querySelector('h2')?.focus()
  }, [mode])
  function retry() { setNotFound(false); setNotice('Solicitando acceso a la cámara…'); setMode('camera'); setAttempt(value => value + 1) }
  return <dialog className="barcode-scanner" ref={dialog} aria-labelledby="scanner-title" onCancel={event => { event.preventDefault(); close() }}>
    <h2 id="scanner-title" tabIndex={-1}>Escanear producto</h2>
    {mode === 'camera' && <div className="scanner-view"><video ref={video} muted playsInline autoPlay aria-label="Vista de cámara para escanear productos" /><div className="scanner-guide" aria-hidden="true" /></div>}
    <div role="status">{notFound && <h3 tabIndex={-1}>Producto no encontrado</h3>}<p>{notice}</p></div>
    {mode === 'manual' && <form onSubmit={event => { event.preventDefault(); lookup(code) }}><label htmlFor="scanner-code">Código de barras</label><input id="scanner-code" ref={manualInput} value={code} onChange={event => setCode(event.target.value)} inputMode="numeric" autoComplete="off" maxLength={32} required pattern="[0-9 ]+" /><button type="submit">Buscar código</button></form>}
    <div className="scanner-actions">
      {mode !== 'manual' && <button onClick={() => { stopCamera(); setMode('manual') }}>Ingresar código manualmente</button>}
      {mode !== 'camera' && <button onClick={retry}>Volver a escanear</button>}
      <button onClick={close}>Cancelar</button>
    </div>
  </dialog>
}
