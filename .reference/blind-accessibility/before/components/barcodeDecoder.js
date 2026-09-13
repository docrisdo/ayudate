// The fallback is downloaded only when the camera scanner needs it.
export async function createBarcodeDecoder() {
  if ('BarcodeDetector' in window) {
    try {
      const supported = await window.BarcodeDetector.getSupportedFormats()
      const formats = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'].filter(format => supported.includes(format))
      if (formats.includes('ean_13')) {
        const detector = new window.BarcodeDetector({ formats })
        return async video => (await detector.detect(video))[0]?.rawValue || null
      }
    } catch { /* Use the portable decoder if native initialization fails. */ }
  }
  const { BrowserMultiFormatOneDReader } = await import('@zxing/browser')
  const reader = new BrowserMultiFormatOneDReader()
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { willReadFrequently: true })
  return async video => {
    if (!video.videoWidth || !video.videoHeight) return null
    canvas.width = Math.min(video.videoWidth, 1280)
    canvas.height = Math.round(video.videoHeight * canvas.width / video.videoWidth)
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    try { return reader.decodeFromCanvas(canvas).getText() }
    catch (error) {
      if (['NotFoundException', 'ChecksumException', 'FormatException'].includes(error.constructor.name)) return null
      throw error
    }
  }
}
