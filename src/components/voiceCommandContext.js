import { createContext, useContext, useEffect } from 'react'

export const VoiceCommandContext = createContext(null)
export const useVoiceCommands = () => useContext(VoiceCommandContext)

export function useVoiceScope(name, handler) {
  const voice = useVoiceCommands()
  useEffect(() => voice?.registerScope(name, handler))
}
