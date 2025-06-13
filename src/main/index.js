import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let mainWindow
let secondWindow
let customerCollectionWin
let childWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
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

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.on('open-child-window', () => createChildWindow())
  ipcMain.on('open-second-window', () => createSecondWindow())
  ipcMain.on('open-cutomer-win', () => customerCollection())

  // ipcMain.on('print-slip', async (event, htmlContent) => {
  //   const printWindow = new BrowserWindow({
  //     width: 400,
  //     height: 600,
  //     show: true,
  //     webPreferences: {
  //       contextIsolation: true
  //     }
  //   })

  //   await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)

  //   printWindow.webContents.on('did-finish-load', () => {
  //     printWindow.webContents.print(
  //       {
  //         silent: false, // ✅ Keep it false to show dialog
  //         printBackground: true
  //       },
  //       (success, errorType) => {
  //         if (!success) {
  //           console.error('Print failed:', errorType)
  //           event.reply('print-error', `Print failed: ${errorType}`)
  //         }
  //         printWindow.close()
  //       }
  //     )
  //   })
  // })

  // print commond+===================>
  ipcMain.on('print-slip', async (event, htmlContent) => {
    const printWindow = new BrowserWindow({
      width: 400,
      height: 600,
      show: true, // You can set false for silent print
      webPreferences: {
        contextIsolation: true
      }
    })

    // Load HTML string into the window
    await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)

    // Wait for HTML to fully load
    printWindow.webContents.on('did-finish-load', () => {
      printWindow.webContents.print(
        {
          silent: false, // If true: no dialog shown (but deviceName is needed)
          printBackground: true, // Important if your HTML has background color/images
          // deviceName: 'printer-name' // ✅ Optional: if you want to force a specific printer
          printBackground: true
        },
        (success, errorType) => {
          if (!success) {
            console.error('Print failed:', errorType)
            event.reply('print-error', `Print failed: ${errorType}`)
          }
          printWindow.close()
        }
      )
    })
  })

  ipcMain.handle('get-printers', async () => {
    const win = BrowserWindow.getAllWindows()[0]

    if (!win || !win.webContents) {
      throw new Error('No window or webContents available')
    }

    // Wait for content to be loaded before calling getPrinters
    if (!win.webContents.isLoadingMainFrame()) {
      return win.webContents.getPrinters() // 🖨️ This will work here
    }

    return new Promise((resolve, reject) => {
      win.webContents.once('did-finish-load', () => {
        try {
          resolve(win.webContents.getPrinters())
        } catch (error) {
          reject(error)
        }
      })
    })
  })

  ipcMain.on('print-slip-window', () => {
    const printWin = new BrowserWindow({ 
      width: 400,
      height: 600,
      autoHideMenuBar: true,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false
      }
    })

    const slipPath = join(__dirname, '../../out/milk-slip.html')
    printWin.loadFile(slipPath)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
