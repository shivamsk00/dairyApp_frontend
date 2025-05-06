import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ToastContainer, toast } from 'react-toastify';
createRoot(document.getElementById('root')).render(
  <>
    <App />
    <ToastContainer />

  </>
)
