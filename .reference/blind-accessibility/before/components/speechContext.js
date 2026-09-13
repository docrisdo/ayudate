import { createContext, useContext } from 'react'

export const SpeechContext = createContext(null)
export const useSpeech = () => useContext(SpeechContext)

export const screenIntroductions = {
  welcome: 'Bienvenido a AYÚDATE. Configura tu experiencia para comenzar.',
  accessibility: 'Configuración de accesibilidad. Elige tus preferencias y guarda para continuar.',
  home: 'Inicio de AYÚDATE. Selecciona la función que deseas utilizar.',
  lists: 'Mis listas. Selecciona una lista guardada o crea una nueva.',
  'new-list': 'Nueva lista. Escribe un nombre y agrega los productos que necesitas.',
  search: 'Buscar producto. Escribe el nombre, categoría o pasillo del producto que deseas localizar.',
  route: 'Mi ruta. Aquí puedes consultar el siguiente producto y la zona que debes visitar.',
  budget: 'Presupuesto. Aquí puedes consultar cuánto has gastado y cuánto dinero tienes disponible.',
  cart: 'Mi carrito. Revisa los productos seleccionados antes de finalizar tu compra.',
  help: 'Solicitar asistencia. Selecciona el tipo de ayuda que necesitas.',
}
