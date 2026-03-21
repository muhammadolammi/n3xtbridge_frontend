import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'


if (
  window.location.hostname.endsWith("web.app") ||
  window.location.hostname.endsWith("firebaseapp.com")
) {
  window.location.replace("https://n3xtbridge.com");
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
