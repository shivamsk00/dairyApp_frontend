import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ToastContainer, toast } from 'react-toastify';

// Electron webFrame के लिए check करें कि environment Electron है या नहीं
if (typeof window !== 'undefined' && window.electronAPI) {
  // अगर electronAPI available है तो webFrame functions use करें
  window.electronAPI.setZoomFactor(1.0);
  window.electronAPI.setZoomLevel(0);
} else if (typeof window !== 'undefined' && window.require) {
  // Legacy method - अगर contextIsolation disabled है
  try {
    const { webFrame } = window.require('electron');
    webFrame.setZoomFactor(1.0);
    webFrame.setZoomLevel(0);
  } catch (error) {
    console.log('Electron webFrame not available:', error);
  }
}

// CSS के through भी font scaling को disable करें
const style = document.createElement('style');
style.textContent = `
  * {
    -webkit-text-size-adjust: none !important;
    text-size-adjust: none !important;
    zoom: 1 !important;
  }
  
  body, html {
    zoom: 1 !important;
    transform: scale(1) !important;
    font-size: 16px !important;
  }
`;
document.head.appendChild(style);

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <ToastContainer />
  </>
)
