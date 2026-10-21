// import { app, shell, BrowserWindow, ipcMain } from 'electron'
// import { join } from 'path'
// import { electronApp, optimizer, is } from '@electron-toolkit/utils'
// import icon from '../../resources/icon.png?asset'
// import { format } from 'url'
// import { autoUpdater } from 'electron-updater'

// // AutoUpdater Settings
// autoUpdater.autoDownload = false
// autoUpdater.autoInstallOnAppQuit = false

// let mainWindow
// let secondWindow
// let customerCollectionWin
// let childWindow

// // Main Window
// function createWindow() {
//   mainWindow = new BrowserWindow({
//     width: 2000,
//     height: 1500,
//     show: false,
//     autoHideMenuBar: true,
//     icon: process.platform === 'win32' ? join(__dirname, '../../resources/icon2.ico') : icon,
//     ...(process.platform === 'linux' ? { icon } : {}),
//     webPreferences: {
//       preload: join(__dirname, '../preload/index.js'),
//       sandbox: false
//     }
//   })

//   mainWindow.on('ready-to-show', () => mainWindow.show())

//   mainWindow.on('closed', () => {
//     secondWindow?.close()
//     customerCollectionWin?.close()
//     childWindow?.close()
//     mainWindow = null
//     secondWindow = null
//     customerCollectionWin = null
//     childWindow = null
//   })

//   mainWindow.webContents.setWindowOpenHandler((details) => {
//     shell.openExternal(details.url)
//     return { action: 'deny' }
//   })

//   if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
//     mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
//   } else {
//     mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
//   }
// }

// // Second Window
// function createSecondWindow() {
//   secondWindow = new BrowserWindow({
//     width: 1500,
//     height: 800,
//     autoHideMenuBar: true,
//     webPreferences: {
//       preload: join(__dirname, '../preload/index.js'),
//       sandbox: false
//     }
//   })

//   secondWindow.on('closed', () => {
//     secondWindow = null
//     if (mainWindow && !mainWindow.isDestroyed()) {
//       mainWindow.webContents.send('second-window-closed')
//     }
//   })

//   if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
//     secondWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#/milk-collection`)
//   } else {
//     secondWindow.loadFile(join(__dirname, '../renderer/index.html'))
//     secondWindow.webContents.once('did-finish-load', () => {
//       secondWindow.webContents.executeJavaScript(`window.location.hash = '#/milk-collection';`)
//     })
//   }
// }

// // Customer Window
// function customerCollection() {
//   customerCollectionWin = new BrowserWindow({
//     width: 1200,
//     height: 800,
//     autoHideMenuBar: true,
//     webPreferences: {
//       preload: join(__dirname, '../preload/index.js'),
//       sandbox: false
//     }
//   })

//   customerCollectionWin.on('closed', () => {
//     customerCollectionWin = null
//     if (mainWindow && !mainWindow.isDestroyed()) {
//       mainWindow.webContents.send('customer-win-close')
//     }
//   })

//   if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
//     customerCollectionWin.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#/customer-collection`)
//   } else {
//     customerCollectionWin.loadFile(join(__dirname, '../renderer/index.html'))
//     customerCollectionWin.webContents.once('did-finish-load', () => {
//       customerCollectionWin.webContents.executeJavaScript(
//         `window.location.hash = '#/customer-collection';`
//       )
//     })
//   }
// }

// // Child Modal Window
// function createChildWindow() {
//   childWindow = new BrowserWindow({
//     width: 1200,
//     height: 800,
//     parent: mainWindow,
//     modal: true,
//     webPreferences: {
//       preload: join(__dirname, '../preload/index.js'),
//       sandbox: false
//     }
//   })

//   if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
//     childWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/child`)
//   } else {
//     childWindow.loadFile(join(__dirname, '../renderer/index.html'))
//   }
// }

// // App Ready
// app.whenReady().then(() => {
//   createWindow()
//   electronApp.setAppUserModelId('com.electron')

//   app.on('browser-window-created', (_, window) => {
//     optimizer.watchWindowShortcuts(window)
//   })

//   // AutoUpdater Check
//   autoUpdater.checkForUpdatesAndNotify()

//   // IPC Events
//   ipcMain.on('open-child-window', () => createChildWindow())
//   ipcMain.on('open-second-window', () => createSecondWindow())
//   ipcMain.on('open-cutomer-win', () => customerCollection())
//   ipcMain.handle('get-app-version', () => app.getVersion())

//   ////////////////////////////////// CLOSE ALL WINDOW AFTER LOGOUT /////////////////////////////////////////////////////
//   ipcMain.on('logout_close_all', () => {
//     if (secondWindow && !secondWindow.isDestroyed()) {
//       secondWindow.close()
//     }

//     if (customerCollectionWin && !customerCollectionWin.isDestroyed()) {
//       customerCollectionWin.close()
//     }

//     if (childWindow && !childWindow.isDestroyed()) {
//       childWindow.close()
//     }
//   })

//   // 🖨️ Slip printing
//   ipcMain.on('print-slip', (event, slipData) => {
//     const slipWindow = new BrowserWindow({
//       show: false,
//       webPreferences: {
//         sandbox: false
//       }
//     })

//     const filePath = join(__dirname, '../../out/milk-slip.html')

//     const queryParams = new URLSearchParams({
//       account_no: slipData.account_no,
//       customer: slipData.customer,
//       date: slipData.date,
//       time: slipData.time,
//       shift: slipData.shift,
//       milk_type: slipData.milk_type,
//       qty: slipData.qty,
//       fat: slipData.fat,
//       snf: slipData.snf,
//       oth_rate: slipData.oth_rate,
//       base_rate: slipData.base_rate,
//       rate: slipData.rate,
//       total: slipData.total
//     }).toString()

//     const finalUrl = format({
//       protocol: 'file',
//       slashes: true,
//       pathname: filePath,
//       search: `?${queryParams}`
//     })

//     console.log('🖨️ Loading Slip URL:', finalUrl)

//     slipWindow.loadURL(finalUrl)

//     slipWindow.webContents.on('did-finish-load', () => {
//       slipWindow.webContents.print(
//         {
//           silent: true,
//           printBackground: true,
//           margins: { marginType: 'none' },
//           pageSize: {
//             width: 50000,
//             height: 300000
//           }
//         },
//         (success, error) => {
//           if (!success) console.error('Print failed:', error)
//           slipWindow.close()
//         }
//       )
//     })
//   })

//   // Auto Updater Events
//   autoUpdater.on('checking-for-update', () => {
//     mainWindow.webContents.send('update-message', 'Checking for update...')
//   })

//   autoUpdater.on('update-available', () => {
//     mainWindow.webContents.send('update-message', 'Update available... Downloading...')
//   })

//   autoUpdater.on('update-not-available', () => {
//     mainWindow.webContents.send('update-message', 'No update available.')
//   })

//   autoUpdater.on('download-progress', (progress) => {
//     const percent = Math.floor(progress.percent)
//     mainWindow.webContents.send('update-progress', percent)
//   })

//   autoUpdater.on('update-downloaded', () => {
//     mainWindow.webContents.send('update-message', 'Update downloaded. Installing in 3 seconds...')
//     setTimeout(() => {
//       autoUpdater.quitAndInstall()
//     }, 3000)
//   })

//   ipcMain.on('start-update-download', () => {
//     autoUpdater.downloadUpdate()
//   })

//   ipcMain.on('check-for-update', () => {
//     autoUpdater.checkForUpdates()
//   })

//   autoUpdater.on('error', (err) => {
//     mainWindow.webContents.send('update-message', `Update error: ${err.message}`)
//   })
// })

// // App Quit
// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') app.quit()
// })



// NEW CODE HERE

import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { existsSync } from 'fs'
import { join } from 'path'
import { networkInterfaces } from 'os'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { format } from 'url'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import { createUpdateManager } from './updater'
import { createVersionManager } from './versions'
import { createOcrService } from './ocr'

// Configure logging for debugging
log.transports.file.level = 'info'
autoUpdater.logger = log

// CRITICAL: Disable signature verification [web:37][web:32]
autoUpdater.verifyUpdateCodeSignature = (publisherName, path) => {
  log.info('Bypassing signature verification for:', path)
  return Promise.resolve(null) // Always allow updates
}

// AutoUpdater Settings
autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = false

// For development testing (optional)
if (is.dev) {
  autoUpdater.forceDevUpdateConfig = false
}

let mainWindow
let secondWindow
let customerCollectionWin
let cashEntryWin
let childWindow
let updateCheckInterval

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
    
    // Clear update interval
    if (updateCheckInterval) {
      clearInterval(updateCheckInterval)
      updateCheckInterval = null
    }
    
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

// Cash Entry Window
function createCashEntryWindow() {
  cashEntryWin = new BrowserWindow({
    width: 1500,
    height: 850,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  cashEntryWin.on('closed', () => {
    cashEntryWin = null
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('cash-entry-window-closed')
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    cashEntryWin.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#/cash-entry-win`)
  } else {
    cashEntryWin.loadFile(join(__dirname, '../renderer/index.html'))
    cashEntryWin.webContents.once('did-finish-load', () => {
      cashEntryWin.webContents.executeJavaScript(`window.location.hash = '#/cash-entry-win';`)
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

// Auto-update: one structured status object is pushed to the renderer ('update-status').
const updater = createUpdateManager({
  autoUpdater,
  currentVersion: () => app.getVersion(),
  log,
  send: (status) => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('update-status', status)
  }
})

// Version control: list every published version and install any of them (including older ones).
const versions = createVersionManager({
  app,
  shell,
  repo: 'shivamsk00/dairyApp_frontend',
  log,
  send: (status) => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('version-install-status', status)
  }
})

// Offline OCR (reads a price list from a picture). Loaded only while a scan runs.
const ocr = createOcrService({
  app,
  isDev: is.dev,
  log,
  send: (progress) => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('ocr-progress', progress)
  }
})

// Background update checks stay off while the app is deliberately pinned on an older version.
const backgroundUpdateCheck = () => {
  if (versions.getPin()) return
  updater.check()
}

// Blank paper fed out below the printed slip so it clears the printer and can be torn off, in millimetres.
// Raise it if the slip still does not come out far enough; lower it to save paper.
const SLIP_FEED_MM = 20

// App Ready
app.whenReady().then(() => {
  createWindow()
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  updater.registerEvents()
  versions.reconcilePin(app.getVersion())

  // Quiet background checks: they only surface something when an update is actually found.
  setTimeout(() => backgroundUpdateCheck(), 5000)
  if (!is.dev) {
    updateCheckInterval = setInterval(() => backgroundUpdateCheck(), 30 * 60 * 1000) // every 30 minutes
  }

  // IPC Events
  ipcMain.on('open-child-window', () => createChildWindow())
  ipcMain.on('open-second-window', () => createSecondWindow())
  ipcMain.on('open-cutomer-win', () => customerCollection())
  ipcMain.on('open-cash-entry-window', () => createCashEntryWindow())
  ipcMain.handle('get-app-version', () => app.getVersion())
  // This computer's address on its network (e.g. 192.168.1.20): the first external IPv4 found.
  ipcMain.handle('get-system-ip', () => {
    for (const list of Object.values(networkInterfaces())) {
      for (const net of list || []) {
        if (net.family === 'IPv4' && !net.internal) return net.address
      }
    }
    return null
  })

  // Update related IPC handlers
  ipcMain.handle('check-for-update', async () => {
    const status = await updater.check({ manual: true })
    return { success: status.state !== 'error', status }
  })
  ipcMain.handle('start-update-download', () => {
    updater.download()
    return { success: true }
  })
  ipcMain.handle('restart-and-install', () => updater.install())
  ipcMain.handle('get-update-status', () => updater.getStatus())
  ipcMain.handle('dismiss-update-status', () => updater.dismiss())

  // OCR IPC: receives the prepared image blocks, answers with the text of each
  ipcMain.handle('ocr:recognize', async (_event, chunks) => {
    try {
      return { success: true, texts: await ocr.recognize(chunks) }
    } catch (error) {
      return { success: false, message: error?.message || 'Could not read the image.' }
    }
  })

  // Version control IPC
  ipcMain.handle('versions:list', () => versions.list())
  ipcMain.handle('versions:install', (_event, version) => versions.install(String(version)))
  ipcMain.handle('versions:get-pin', () => versions.getPin())
  ipcMain.handle('versions:clear-pin', () => {
    versions.clearPin()
    return { success: true }
  })

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

    if (cashEntryWin && !cashEntryWin.isDestroyed()) {
      cashEntryWin.close()
    }
  })

  // 🖨️ Slip printing
  ipcMain.on('print-slip', (event, slipData) => {
    // The slip page: out/milk-slip.html is used when it exists (it is the file edited by hand). A build made
    // on a clean checkout (such as the GitHub release) does not have it, so resources/milk-slip.html, which
    // ships with the app, is the fallback.
    const filePath = [
      join(__dirname, '../../out/milk-slip.html'),
      join(is.dev ? app.getAppPath() : process.resourcesPath, 'resources', 'milk-slip.html')
    ].find((candidate) => existsSync(candidate))
    const reply = (result) => {
      if (!event.sender.isDestroyed()) event.sender.send('print-slip-result', result)
    }
    if (!filePath) {
      log.error('Print slip: template not found (out/milk-slip.html or resources/milk-slip.html)')
      reply({ success: false, error: 'The slip template is missing from the app. Please reinstall or update the app.' })
      return
    }

    const slipWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        sandbox: false
      }
    })

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

    slipWindow.webContents.on('did-fail-load', (_e, code, description) => {
      log.error('Print slip: page failed to load', code, description)
      reply({ success: false, error: `The slip could not be opened (${description}).` })
      if (!slipWindow.isDestroyed()) slipWindow.close()
    })

    slipWindow.webContents.on('did-finish-load', async () => {
      // The roll is as long as the slip plus a feed margin below it, so the paper comes out far enough to
      // tear off. (A fixed 300 mm page ignores the real length of the slip.)
      const contentPx = await slipWindow.webContents
        .executeJavaScript('document.body.offsetHeight')
        .catch(() => 0)
      const pageHeightMicrons =
        contentPx > 0 ? Math.ceil(((contentPx * 25.4) / 96 + SLIP_FEED_MM) * 1000) : 300000
      slipWindow.webContents.print(
        {
          silent: true,
          printBackground: true,
          margins: { marginType: 'none' },
          pageSize: {
            width: 50000,
            height: pageHeightMicrons
          }
        },
        (success, error) => {
          if (!success) log.error('Print failed:', error)
          const hint = 'The printer did not accept the slip. Check that a printer is installed, turned on and set as the default.'
          reply({ success, error: success ? undefined : /cancel|fail/i.test(error || '') || !error ? hint : error })
          if (!slipWindow.isDestroyed()) slipWindow.close()
        }
      )
    })
  })

})

// App Quit
app.on('window-all-closed', () => {
  if (updateCheckInterval) {
    clearInterval(updateCheckInterval)
  }
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
