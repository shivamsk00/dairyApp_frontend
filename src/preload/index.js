// import { contextBridge, ipcRenderer } from 'electron'
// import { electronAPI } from '@electron-toolkit/preload'

// // Custom APIs for renderer
// const api = {
//   openChildWindow: () => ipcRenderer.send('open-child-window'),
//   openSecondWindow: () => ipcRenderer.send('open-second-window'),
//   openCusomerWindow: () => ipcRenderer.send('open-cutomer-win'),
//   printSlip: (html) => ipcRenderer.send('print-slip', html),
//   onPrintError: (callback) => ipcRenderer.on('print-error', (_, msg) => callback(msg)),
//   listPrinters: () => ipcRenderer.send('list-printers'),
//   getPrinter:()=> ipcRenderer.send('get-printers'),
//   getPrinters: () => ipcRenderer.invoke('get-printers'),

//   invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
//   on: (channel, callback) => ipcRenderer.on(channel, (event, data) => callback(data)),

//   onPrintersList: (callback) =>
//     ipcRenderer.on('printers-list', (_, printers) => callback(printers)),

//   openPrintPreview: () => ipcRenderer.send('print-slip-window'),

//   onSecondWindowClosed: (callback) => {
//     ipcRenderer.on('second-window-closed', callback)
//   },

//   onCutomerWindowClosed: (callback) => {
//     ipcRenderer.on('customer-win-close', callback)
//   }
// }

// // Expose APIs to renderer safely
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

import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
console.log('🧠 typeof ipcRenderer.invoke:', typeof ipcRenderer.invoke)
const api = {
  // 🪟 Windows
  openChildWindow: () => ipcRenderer.send('open-child-window'),
  openSecondWindow: () => ipcRenderer.send('open-second-window'),
  openCusomerWindow: () => ipcRenderer.send('open-cutomer-win'),

  // 🖨️ Printing
  printSlip: (html) => ipcRenderer.send('print-slip', html),
  onPrintError: (callback) => ipcRenderer.on('print-error', (_, msg) => callback(msg)),
  getPrinters: () => ipcRenderer.send('get-printers'),
  openPrintPreview: () => ipcRenderer.send('print-slip-window'),

  // 🧩 Utility
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  on: (channel, callback) => ipcRenderer.on(channel, (event, data) => callback(data)),

  // 🧼 Window closed events
  onSecondWindowClosed: (callback) => {
    ipcRenderer.on('second-window-closed', callback)
  },
  onCutomerWindowClosed: (callback) => {
    ipcRenderer.on('customer-win-close', callback)
  }
}

// ✅ Expose to Renderer
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    console.log('🧠 typeof ipcRenderer.invoke:', typeof ipcRenderer.invoke)
  } catch (error) {
    console.error('ContextBridge exposure failed:', error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
