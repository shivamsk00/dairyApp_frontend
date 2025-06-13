import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  openChildWindow: () => ipcRenderer.send('open-child-window'),
  openSecondWindow: () => ipcRenderer.send('open-second-window'),
  openCusomerWindow: () => ipcRenderer.send('open-cutomer-win'),
  printSlip: (html) => ipcRenderer.send('print-slip', html),
  onPrintError: (callback) => ipcRenderer.on('print-error', (_, msg) => callback(msg)),
  listPrinters: () => ipcRenderer.send('list-printers'),

  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  on: (channel, callback) => ipcRenderer.on(channel, (event, data) => callback(data)),

  onPrintersList: (callback) =>
    ipcRenderer.on('printers-list', (_, printers) => callback(printers)),

  openPrintPreview: () => ipcRenderer.send('print-slip-window'),

  onSecondWindowClosed: (callback) => {
    ipcRenderer.on('second-window-closed', callback)
  },

  onCutomerWindowClosed: (callback) => {
    ipcRenderer.on('customer-win-close', callback)
  }
}

// Expose APIs to renderer safely
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error('ContextBridge exposure failed:', error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
