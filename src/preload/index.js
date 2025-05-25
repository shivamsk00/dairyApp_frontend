import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  openChildWindow: () => ipcRenderer.send('open-child-window'),
  openSecondWindow: () => ipcRenderer.send('open-second-window'),
  onSecondWindowClosed: (callback) => ipcRenderer.on('second-window-closed', callback)
}

// Expose APIs to renderer safely
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
