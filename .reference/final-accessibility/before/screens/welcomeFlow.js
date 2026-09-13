export const supportOptions = [
  { id: 'visual', title: 'Asistencia visual', text: 'Texto más grande, alto contraste y navegación simplificada.', icon: '/assets/icons/svg/icon-ojo.svg' },
  { id: 'auditory', title: 'Asistencia auditiva', text: 'Subtítulos, avisos visuales y notificaciones en pantalla.', icon: '/assets/icons/svg/icon-audio.svg' },
  { id: 'motor', title: 'Asistencia motriz', text: 'Rutas accesibles, menos desplazamientos y compra simplificada.', icon: '/assets/pictograms/svg/pictograma-ayuda-desplazamiento.svg' },
  { id: 'communication', title: 'Asistencia de comunicación', text: 'Lenguaje claro, pictogramas y apoyo paso a paso.', icon: '/assets/icons/svg/icon-chat.svg' },
]

// Only enable existing controls; the next screen lets the user refine them.
export function supportPreferences(current, selected) {
  const next = { ...current }
  if (selected.includes('visual')) Object.assign(next, { largeText: true, highContrast: true, bigButtons: true })
  if (selected.includes('auditory')) Object.assign(next, { pictograms: true, voice: false })
  if (selected.includes('motor')) Object.assign(next, { accessibleRoute: true, bigButtons: true })
  if (selected.includes('communication')) next.pictograms = true
  return next
}
