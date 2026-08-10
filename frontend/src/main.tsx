import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useUserStore } from './store/user-store'

const state = useUserStore.getState()
if (state.isAuthenticated && !localStorage.getItem("access_token")) {
  state.logout()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />

  </StrictMode>,
)
