import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import SpeechProvider from './components/SpeechProvider.jsx'
import VoiceCommandsProvider from './components/VoiceCommandsProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SpeechProvider><VoiceCommandsProvider><App /></VoiceCommandsProvider></SpeechProvider>
  </StrictMode>,
)
