import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ToastHost } from './components/ui';
import { initFontScale } from './helper/fontScale';
import { initSidebarTheme } from './helper/sidebarTheme';
import { installFriendlyToasts } from './helper/friendlyErrors';
import { isSessionExpiredOpen } from './helper/sessionExpired';

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
    /* Not scale(1): any transform on html/body becomes the containing block of position:fixed
       elements, which pushed dialogs to the middle of the whole page instead of the window. */
    transform: none !important;
  }

  /* rem stays fixed; the text that has no size class of its own follows the font-size setting */
  html {
    font-size: 16px !important;
  }
  body {
    font-size: calc(16px * var(--ui-font-scale, 1)) !important;
  }
`;
document.head.appendChild(style);

// Apply the saved font-size setting before the first paint
initFontScale();
initSidebarTheme();
installFriendlyToasts(isSessionExpiredOpen);

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <ToastHost />
  </>
)
