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
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { format } from 'url'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'

// Configure logging for debugging
log.transports.file.level = 'info'
autoUpdater.logger = log

// AutoUpdater Settings [web:86]
autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = false

// For development testing (optional)
if (is.dev) {
  autoUpdater.forceDevUpdateConfig = true
}

let mainWindow
let secondWindow
let customerCollectionWin
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

// Helper function to send update messages
function sendUpdateMessage(message) {
  if (mainWindow && mainWindow.webContents && !mainWindow.isDestroyed()) {
    log.info('Sending update message:', message)
    mainWindow.webContents.send('update-message', message)
  }
}

function sendUpdateProgress(progress) {
  if (mainWindow && mainWindow.webContents && !mainWindow.isDestroyed()) {
    log.info('Sending update progress:', progress)
    mainWindow.webContents.send('update-progress', progress)
  }
}

// Auto Updater Events [web:86][web:88]
autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...')
  sendUpdateMessage('Checking for updates...')
})

autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info.version)
  sendUpdateMessage(`Update available! Version ${info.version}`)
  
  // Auto download the update
  log.info('Starting update download...')
  autoUpdater.downloadUpdate()
})

autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available. Current version:', app.getVersion())
  sendUpdateMessage('No update available.')
  
  // Hide message after 5 seconds
  setTimeout(() => {
    sendUpdateMessage(null)
  }, 5000)
})

autoUpdater.on('download-progress', (progressObj) => {
  const percent = Math.round(progressObj.percent)
  log.info(`Download progress: ${percent}% - ${progressObj.transferred}/${progressObj.total} bytes`)
  sendUpdateProgress(percent)
  
  if (percent === 0) {
    sendUpdateMessage('Starting download...')
  } else {
    sendUpdateMessage('Downloading update...')
  }
})

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded successfully:', info.version)
  sendUpdateMessage('Update downloaded successfully!')
  sendUpdateProgress(100)
  
  // Show dialog for restart
  setTimeout(() => {
    showUpdateDialog(info)
  }, 2000)
})

autoUpdater.on('error', (error) => {
  log.error('Auto updater error:', error)
  sendUpdateMessage(`Update error: ${error.message}`)
  
  // Clear error message after 8 seconds
  setTimeout(() => {
    sendUpdateMessage(null)
  }, 8000)
})

// Show update dialog
function showUpdateDialog(info) {
  if (!mainWindow || mainWindow.isDestroyed()) return
  
  const dialogOptions = {
    type: 'info',
    title: 'Update Ready',
    message: `Update Downloaded Successfully!`,
    detail: `Version ${info.version} has been downloaded. The app will restart to apply the update.`,
    buttons: ['Restart Now', 'Later'],
    defaultId: 0,
    cancelId: 1,
    icon: icon
  }
  
  dialog.showMessageBox(mainWindow, dialogOptions).then((result) => {
    if (result.response === 0) {
      // User chose to restart now
      log.info('User chose to restart and install update')
      autoUpdater.quitAndInstall(false, true)
    } else {
      // User chose later
      log.info('User chose to install update later')
      sendUpdateMessage(null) // Hide the banner
    }
  }).catch((error) => {
    log.error('Dialog error:', error)
  })
}

// App Ready
app.whenReady().then(() => {
  createWindow()
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Check for updates on startup (after 5 seconds)
  setTimeout(() => {
    log.info('Checking for updates on startup...')
    autoUpdater.checkForUpdates()
  }, 5000)

  // Set up periodic update checks (every 30 minutes in production)
  if (!is.dev) {
    updateCheckInterval = setInterval(() => {
      log.info('Periodic update check...')
      autoUpdater.checkForUpdates()
    }, 30 * 60 * 1000) // 30 minutes
  }

  // IPC Events
  ipcMain.on('open-child-window', () => createChildWindow())
  ipcMain.on('open-second-window', () => createSecondWindow())
  ipcMain.on('open-cutomer-win', () => customerCollection())
  ipcMain.handle('get-app-version', () => app.getVersion())

  // Update related IPC handlers
  ipcMain.handle('check-for-update', async () => {
    try {
      log.info('Manual update check requested')
      const result = await autoUpdater.checkForUpdates()
      return { success: true, updateInfo: result }
    } catch (error) {
      log.error('Manual update check failed:', error)
      sendUpdateMessage(`Update check failed: ${error.message}`)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('start-update-download', async () => {
    try {
      log.info('Manual download requested')
      await autoUpdater.downloadUpdate()
      return { success: true }
    } catch (error) {
      log.error('Manual download failed:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('restart-and-install', () => {
    log.info('Restart and install requested')
    autoUpdater.quitAndInstall(false, true)
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
  })

  // 🖨️ Slip printing (keeping your existing code)
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
