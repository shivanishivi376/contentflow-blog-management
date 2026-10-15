import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.jsx'
import { store } from './app/store/store.js'
import { setAuthTokens, logout } from './features/auth/authSlice.js'
import { setupAuthInterceptors } from './services/api/apiClient.js'
import { GoogleOAuthProvider } from '@react-oauth/google'

setupAuthInterceptors({
  onRefreshed: (tokens) => {
    store.dispatch(setAuthTokens(tokens))
  },
  onExpired: () => {
    store.dispatch(logout())
  },
})

const app = import.meta.env.VITE_GOOGLE_CLIENT_ID
  ? (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  )
  : <App />

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        {app}
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
