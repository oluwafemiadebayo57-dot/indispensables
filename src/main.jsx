import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// AUTO-FIX FOR CHUNK LOAD ERRORS (Vercel updates)
window.addEventListener('vite:preloadError', () => {
  window.location.reload(); 
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)