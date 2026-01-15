// import { contextBridge, ipcRenderer } from 'electron'
// import { electronAPI } from '@electron-toolkit/preload'

// // Custom APIs for renderer
// const api = {
//   // 🪟 Window Controls
//   openChildWindow: () => ipcRenderer.send('open-child-window'),
//   openSecondWindow: () => ipcRenderer.send('open-second-window'),
//   openCusomerWindow: () => ipcRenderer.send('open-cutomer-win'),
//   printSlip: (data) => ipcRenderer.send('print-slip', data),
//   upadateStartDownload: (data) => ipcRenderer.send('start-update-download', data),
//   checkForUpdate: () => ipcRenderer.send('check-for-update'),
//   logoutCloseAll: () => ipcRenderer.send('logout_close_all'),

//   onUpdateMessage: (callback) => {
//     ipcRenderer.on('update-message', (event, message) => {
//       callback(message)
//     })
//   },

//   onUpdateProgress: (callback) => {
//     ipcRenderer.on('update-progress', (_, percent) => callback(percent))
//   },

//   // 📦 App Info
//   getAppVersion: () => ipcRenderer.invoke('get-app-version'),
//   // 🧩 Utility
//   invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
//   on: (channel, callback) => ipcRenderer.on(channel, (event, data) => callback(data)),

//   // 🧼 Window closed events
//   onSecondWindowClosed: (callback) => {
//     ipcRenderer.on('second-window-closed', callback)
//   },
//   onCutomerWindowClosed: (callback) => {
//     ipcRenderer.on('customer-win-close', callback)
//   }
// }

// // ✅ Expose to Renderer
// if (process.contextIsolated) {
//   try {
//     contextBridge.exposeInMainWorld('electron', electronAPI)
//     contextBridge.exposeInMainWorld('api', api)
//   } catch (error) {
//     console.error('ContextBridge exposure failed:', error)
//   }
// } else {
//   window.electron = electronAPI
//   window.api = api
// }


// Improved version with better structure, error handling, and comments

import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // 🪟 Window Controls
  openChildWindow: () => ipcRenderer.send('open-child-window'),
  openSecondWindow: () => ipcRenderer.send('open-second-window'),
  openCusomerWindow: () => ipcRenderer.send('open-cutomer-win'),
  printSlip: (data) => ipcRenderer.send('print-slip', data),
  logoutCloseAll: () => ipcRenderer.send('logout_close_all'),

  // 🔄 Update System APIs - Using invoke pattern for async operations [web:121][web:124]
  checkForUpdate: () => ipcRenderer.invoke('check-for-update'),
  upadateStartDownload: () => ipcRenderer.invoke('start-update-download'),
  restartAndInstall: () => ipcRenderer.invoke('restart-and-install'),

  // 📦 App Info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // 🔔 Update Event Listeners - Proper callback handling [web:122][web:125]
  onUpdateMessage: (callback) => {
    // Remove existing listeners to prevent memory leaks
    ipcRenderer.removeAllListeners('update-message')
    
    ipcRenderer.on('update-message', (event, message) => {
      callback(message)
    })
  },

  onUpdateProgress: (callback) => {
    // Remove existing listeners to prevent memory leaks
    ipcRenderer.removeAllListeners('update-progress')
    
    ipcRenderer.on('update-progress', (event, percent) => {
      callback(percent)
    })
  },

  // 🧼 Cleanup function for update listeners [web:122]
  removeUpdateListeners: () => {
    ipcRenderer.removeAllListeners('update-message')
    ipcRenderer.removeAllListeners('update-progress')
  },

  // 🧼 Window closed events
  onSecondWindowClosed: (callback) => {
    ipcRenderer.removeAllListeners('second-window-closed')
    ipcRenderer.on('second-window-closed', callback)
  },

  onCutomerWindowClosed: (callback) => {
    ipcRenderer.removeAllListeners('customer-win-close')
    ipcRenderer.on('customer-win-close', callback)
  },

  // 🧼 Cleanup function for window events
  removeWindowListeners: () => {
    ipcRenderer.removeAllListeners('second-window-closed')
    ipcRenderer.removeAllListeners('customer-win-close')
  },

  // 🧩 Utility - Generic invoke and on methods [web:124][web:125]
  invoke: (channel, ...args) => {
    // Whitelist allowed channels for security
    const allowedInvokeChannels = [
      'get-app-version',
      'check-for-update',
      'start-update-download',
      'restart-and-install'
    ]
    
    if (allowedInvokeChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args)
    } else {
      throw new Error(`Channel "${channel}" is not allowed for invoke operations`)
    }
  },

  on: (channel, callback) => {
    // Whitelist allowed channels for security
    const allowedOnChannels = [
      'update-message',
      'update-progress',
      'second-window-closed',
      'customer-win-close'
    ]
    
    if (allowedOnChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel) // Prevent memory leaks
      return ipcRenderer.on(channel, (event, data) => callback(data))
    } else {
      throw new Error(`Channel "${channel}" is not allowed for on operations`)
    }
  },

  // 🧼 Generic cleanup function
  removeListener: (channel) => {
    ipcRenderer.removeAllListeners(channel)
  },

  // 🔍 Debug helper - Get all active listeners (development only)
  getActiveListeners: () => {
    if (process.env.NODE_ENV === 'development') {
      return {
        updateMessage: ipcRenderer.listenerCount('update-message'),
        updateProgress: ipcRenderer.listenerCount('update-progress'),
        secondWindowClosed: ipcRenderer.listenerCount('second-window-closed'),
        customerWinClose: ipcRenderer.listenerCount('customer-win-close')
      }
    }
    return null
  }
}

// ✅ Expose to Renderer with proper error handling [web:120][web:131]
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    
    console.log('✅ Context Bridge APIs exposed successfully')
  } catch (error) {
    console.error('❌ ContextBridge exposure failed:', error)
  }
} else {
  // Fallback for non-isolated context (not recommended for production)
  console.warn('⚠️ Context isolation is disabled - this is not secure!')
  window.electron = electronAPI
  window.api = api
}

// 🧼 Cleanup on window unload to prevent memory leaks
window.addEventListener('beforeunload', () => {
  if (window.api?.removeUpdateListeners) {
    window.api.removeUpdateListeners()
  }
  if (window.api?.removeWindowListeners) {
    window.api.removeWindowListeners()
  }
})
