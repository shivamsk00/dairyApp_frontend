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
    width: 800,
    height: 600,
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
    width: 700,
    height: 500,
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
        window.history.pushState({}, '', '/milk-collection');
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

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// ✅ Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
