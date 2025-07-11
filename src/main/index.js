import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { format } from 'url'
import { autoUpdater } from 'electron-updater'

// AutoUpdater Settings
autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = false

let mainWindow
let secondWindow
let customerCollectionWin
let childWindow

// Main Window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 2000,
    height: 1500,
    show: false,
    autoHideMenuBar: true,
    icon: process.platform === 'win32' ? join(__dirname, '../../resources/icon2.ico') : icon,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())

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

// Second Window
function createSecondWindow() {
  secondWindow = new BrowserWindow({
    width: 1500,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  secondWindow.on('closed', () => {
    secondWindow = null
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('second-window-closed')
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    secondWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#/milk-collection`)
  } else {
    secondWindow.loadFile(join(__dirname, '../renderer/index.html'))
    secondWindow.webContents.once('did-finish-load', () => {
      secondWindow.webContents.executeJavaScript(`window.location.hash = '#/milk-collection';`)
    })
  }
}

// Customer Window
function customerCollection() {
  customerCollectionWin = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  customerCollectionWin.on('closed', () => {
    customerCollectionWin = null
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('customer-win-close')
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    customerCollectionWin.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#/customer-collection`)
  } else {
    customerCollectionWin.loadFile(join(__dirname, '../renderer/index.html'))
    customerCollectionWin.webContents.once('did-finish-load', () => {
      customerCollectionWin.webContents.executeJavaScript(
        `window.location.hash = '#/customer-collection';`
      )
    })
  }
}

// Child Modal Window
function createChildWindow() {
  childWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    childWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/child`)
  } else {
    childWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// App Ready
app.whenReady().then(() => {
  createWindow()
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // AutoUpdater Check
  autoUpdater.checkForUpdatesAndNotify()

  // IPC Events
  ipcMain.on('open-child-window', () => createChildWindow())
  ipcMain.on('open-second-window', () => createSecondWindow())
  ipcMain.on('open-cutomer-win', () => customerCollection())
  ipcMain.handle('get-app-version', () => app.getVersion())

  ////////////////////////////////// CLOSE ALL WINDOW AFTER LOGOUT /////////////////////////////////////////////////////
  ipcMain.on('logout_close_all', () => {
    if (secondWindow && !secondWindow.isDestroyed()) {
      secondWindow.close()
    }

    if (customerCollectionWin && !customerCollectionWin.isDestroyed()) {
      customerCollectionWin.close()
    }

    if (childWindow && !childWindow.isDestroyed()) {
      childWindow.close()
    }
  })

  // 🖨️ Slip printing
  ipcMain.on('print-slip', (event, slipData) => {
    const slipWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        sandbox: false
      }
    })

    const filePath = join(__dirname, '../../out/milk-slip.html')

    const queryParams = new URLSearchParams({
      account_no: slipData.account_no,
      customer: slipData.customer,
      date: slipData.date,
      time: slipData.time,
      shift: slipData.shift,
      milk_type: slipData.milk_type,
      qty: slipData.qty,
      fat: slipData.fat,
      snf: slipData.snf,
      oth_rate: slipData.oth_rate,
      base_rate: slipData.base_rate,
      rate: slipData.rate,
      total: slipData.total
    }).toString()

    const finalUrl = format({
      protocol: 'file',
      slashes: true,
      pathname: filePath,
      search: `?${queryParams}`
    })

    console.log('🖨️ Loading Slip URL:', finalUrl)

    slipWindow.loadURL(finalUrl)

    slipWindow.webContents.on('did-finish-load', () => {
      slipWindow.webContents.print(
        {
          silent: true,
          printBackground: true,
          margins: { marginType: 'none' },
          pageSize: {
            width: 50000,
            height: 300000
          }
        },
        (success, error) => {
          if (!success) console.error('Print failed:', error)
          slipWindow.close()
        }
      )
    })
  })

  // Auto Updater Events
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

  ipcMain.on('start-update-download', () => {
    autoUpdater.downloadUpdate()
  })

  ipcMain.on('check-for-update', () => {
    autoUpdater.checkForUpdates()
  })

  autoUpdater.on('error', (err) => {
    mainWindow.webContents.send('update-message', `Update error: ${err.message}`)
  })
})

// App Quit
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
