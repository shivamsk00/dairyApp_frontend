import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { format } from 'url'
import { autoUpdater } from 'electron-updater'


// 🔧 Setup logging for debugging update issues

// ✅ Enable auto-download
autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true

let mainWindow
let secondWindow
let customerCollectionWin
let childWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 2000,
    height: 1500,
    show: false,
    autoHideMenuBar: true,
    icon: process.platform === 'win32' ? join(__dirname, '../../resources/icon.ico') : icon,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    secondWindow?.close()
    customerCollectionWin?.close()
    childWindow?.close()

    mainWindow = null
    secondWindow = null
    customerCollectionWin = null
    childWindow = null
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// 🔁 You can keep your other window functions same...

app.whenReady().then(() => {
  createWindow()
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // ✅ Auto Updater logic
  autoUpdater.checkForUpdatesAndNotify()

  // 📩 IPC
  ipcMain.on('open-child-window', () => createChildWindow())
  ipcMain.on('open-second-window', () => createSecondWindow())
  ipcMain.on('open-cutomer-win', () => customerCollection())
  ipcMain.handle('get-app-version', () => app.getVersion())

  // 🖨️ Slip printing – (unchanged)
  ipcMain.on('print-slip', (event, slipData) => {
    // ... your slip print code
  })

  // 📦 Auto Updater Events
  autoUpdater.on('checking-for-update', () => {
    mainWindow.webContents.send('update-message', 'Checking for update...')
  })

  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update-message', 'Update available... Downloading...')
  })

  autoUpdater.on('update-not-available', () => {
    mainWindow.webContents.send('update-message', 'No update available.')
  })

  autoUpdater.on('download-progress', (progress) => {
    const percent = Math.floor(progress.percent)
    mainWindow.webContents.send('update-progress', percent)
  })

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update-message', 'Update downloaded. Installing in 3 seconds...')
    setTimeout(() => {
      autoUpdater.quitAndInstall()
    }, 3000)
  })

  autoUpdater.on('error', (err) => {
    mainWindow.webContents.send('update-message', `Update error: ${err.message}`)
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
