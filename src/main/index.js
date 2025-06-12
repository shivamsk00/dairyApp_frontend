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

  ipcMain.on('print-slip', async (event, printData) => {
  const printWindow = new BrowserWindow({
    width: 400,
    height: 600,
    show: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
    },
  });

 const slipFilePath = join(app.getAppPath(), 'out', 'milk-slip.html'); // ✅ correct
  await printWindow.loadFile(slipFilePath);

  printWindow.webContents.on('did-finish-load', async () => {
    // Inject data if needed via JS
    await printWindow.webContents.executeJavaScript(`
      document.getElementById('customer-name').innerText = "${printData.customer || 'Shivam'}";
      document.getElementById('milk').innerText = "${printData.milk || '5 Litres'}";
      document.getElementById('rate').innerText = "${printData.rate || '₹40 / Litre'}";
      document.getElementById('total').innerText = "${printData.total || '₹200'}";
      
    `);

    // Print
    printWindow.webContents.print(
      {
        silent: false,
        printBackground: true,
        pageSize:'A6'
      },
      (success, errorType) => {
        if (!success) {
          event.reply('print-error', `Print failed: ${errorType}`);
        }
        printWindow.close();
      }
    );
  });
});











//   ipcMain.on('print-slip', async (event, htmlContent) => {
//   const printWindow = new BrowserWindow({
//     width: 400,
//     height: 600,
//     show: true,
//     webPreferences: {
//       contextIsolation: true,
//       nodeIntegration: false
//     }
//   });

//   await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

//   printWindow.webContents.on('did-finish-load', async () => {
//     try {
//       // ✅ Correct method with await
//       const printers = await printWindow.webContents.getPrintersAsync();

//       if (printers.length === 0) {
//         console.log('❌ No printers found');
//         event.reply('print-error', '❌ No printers connected');
//         printWindow.close();
//         return;
//       }

//       console.log('🖨️ Printers found:', printers.map(p => p.name));

//       printWindow.webContents.print(
//         {
//           silent: true,
//           printBackground: true,
//            pageSize: 'A4'  // 👈 Force page size
//         },
//         (success, errorType) => {
//           if (!success) {
//             console.log('❌ Print failed:', errorType);
//             event.reply('print-error', `❌ Print failed: ${errorType}`);
//           } else {
//             console.log('✅ Print success');
//           }

//           printWindow.close();
//         }
//       );
//     } catch (err) {
//       console.error('💥 Error in print process:', err);
//       event.reply('print-error', `💥 Print error: ${err.message}`);
//       printWindow.close();
//     }
//   });
// });


  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
