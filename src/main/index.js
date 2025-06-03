import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let mainWindow // 👈 global main window

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

// ✅ Child window (modal or child of main)
function createChildWindow() {
  const childWindow = new BrowserWindow({
      width: 1200,
    height: 800,
    parent: mainWindow, // 👈 makes it a child
    modal: true, // 👈 modal true hai
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

// ✅ Second independent window
// function createSecondWindow() {
//   const secondWindow = new BrowserWindow({
//     width: 700,
//     height: 500,
//     // show: false,

//     webPreferences: {
//       preload: join(__dirname, '../preload/index.js'),
//       sandbox: false
//     }
//   })

//   if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
//     // ✅ Dev mode
//     secondWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#/milk-collection`)
//   } else {
//     // ✅ Prod mode using HashRouter
//     secondWindow.loadFile(join(__dirname, '../renderer/index.html'))
//     secondWindow.webContents.once('did-finish-load', () => {
//       secondWindow.webContents.executeJavaScript(`
//         location.hash = '/milk-collection';
//       `)
//     })
//   }
// }

function createSecondWindow() {
  const secondWindow = new BrowserWindow({
     width: 1500,
    height: 800,
    autoHideMenuBar: true,      // Hides menu bar
    menuBarVisible: false,      // Completely disables it
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // Notify when closed
  secondWindow.on('closed', () => {
    mainWindow?.webContents.send('second-window-closed')
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    secondWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#/milk-collection`)
  } else {
    secondWindow.loadFile(join(__dirname, '../renderer/index.html'))
    secondWindow.webContents.once('did-finish-load', () => {
      secondWindow.webContents.executeJavaScript(`
        window.history.pushState({}, '', '/#/milk-collection');
        window.dispatchEvent(new Event('popstate'));
      `)
    })
  }
}




// CUSTOMER COLLECTION WIN
function customerCollection() {
  const customerCollectionWin = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,      // Hides menu bar
    menuBarVisible: false,      // Completely disables it
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // Notify when closed
  customerCollectionWin.on('closed', () => {
    mainWindow?.webContents.send('customer-win-close')
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    customerCollectionWin.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#/customer-collection`)
  } else {
    customerCollectionWin.loadFile(join(__dirname, '../renderer/index.html'))
    customerCollectionWin.webContents.once('did-finish-load', () => {
      customerCollectionWin.webContents.executeJavaScript(`
        window.history.pushState({}, '', '/#/customer-collection');
        window.dispatchEvent(new Event('popstate'));
      `)
    })
  }
}






// ✅ App ready
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  // ✅ IPC listeners
  ipcMain.on('open-child-window', () => {
    createChildWindow()
  })

  ipcMain.on('open-second-window', () => {
    createSecondWindow()
  })

  // CUSTOMER WINDOW OPEN 
  ipcMain.on('open-cutomer-win', () => {
    customerCollection()
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// ✅ Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
