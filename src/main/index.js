import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { format } from 'url'

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
  createWindow()
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.on('open-child-window', () => createChildWindow())
  ipcMain.on('open-second-window', () => createSecondWindow())
  ipcMain.on('open-cutomer-win', () => customerCollection())

  // ⛔️ All printer commands
  // ipcMain.on('print-slip', (event, htmlContent) => {
  //   const printWindow = new BrowserWindow({
  //     show: true,
  //     webPreferences: {
  //       sandbox: false
  //     }
  //   })

  //   printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)

  //   printWindow.webContents.on('did-finish-load', () => {
  //     printWindow.webContents.print(
  //       {
  //         silent: false,
  //         printBackground: true,
  //         margins: {
  //           marginType: 'none'
  //         },
  //         pageSize: {
  //           width: 58000, // 58 mm = 58000 microns
  //           height: 100000 // 100 mm = 100000 microns (adjust based on slip length)
  //         }
  //       },
  //       (success, failureReason) => {
  //         if (!success) console.log('Print failed:', failureReason)
  //         printWindow.close()
  //       }
  //     )
  //   })

  //   // printWindow.webContents.on('did-finish-load', () => {
  //   //   printWindow.webContents.print({ silent: true, printBackground: true }, (success, errorType) => {
  //   //     if (!success) console.log('Print failed:', errorType);
  //   //     printWindow.close();
  //   //   });
  //   // });
  // })

  // new commond
  // ipcMain.on('print-slip', (event, slipData) => {
  //   const { customer, date, milk, rate, total } = slipData

  //   const slipWindow = new BrowserWindow({
  //     width: 400,
  //     height: 600,
  //     show: false,
  //     webPreferences: {
  //       sandbox: false
  //     }
  //   })

  //   const filePath = join(__dirname, '../../out/milk-slip.html') // 🔁 Adjust path as needed
  //   // const filePath = join(__dirname, '../out/slip.html');

  //   const queryParams = new URLSearchParams({
  //     customer,
  //     date,
  //     milk,
  //     rate,
  //     total
  //   }).toString()

  //   slipWindow.loadURL(
  //     format({
  //       protocol: 'file',
  //       slashes: true,
  //       pathname: filePath,
  //       search: `?${queryParams}`
  //     })
  //   )
  // })

  // dyanamic html
  // ipcMain.on('print-slip', (event, slipData) => {
  //   const { customer, date, milk, rate, total } = slipData

  //   const slipWindow = new BrowserWindow({
  //     show: false, // ✅ Don't show the window
  //     webPreferences: {
  //       sandbox: false
  //     }
  //   })

  //   const filePath = join(__dirname, '../../out/milk-slip.html') // 🔁 Adjust path as needed

  //   const queryParams = new URLSearchParams({
  //     customer,
  //     date,
  //     milk,
  //     rate,
  //     total
  //   }).toString()

  //   slipWindow.loadURL(
  //     format({
  //       protocol: 'file',
  //       slashes: true,
  //       pathname: filePath,
  //       search: `?${queryParams}`
  //     })
  //   )

  //   slipWindow.webContents.on('did-finish-load', () => {
  //     slipWindow.webContents.print(
  //       {
  //         silent: true,
  //         printBackground: true,
  //         scaleFactor: 100,
  //         margins: { marginType: 'none' },
  //         pageSize: {
  //           width: 89000, // microns
  //           height: 89000
  //         }
  //       },
  //       (success, error) => {
  //         if (!success) {
  //           console.error('Print failed:', error)
  //         }
  //         slipWindow.close()
  //       }
  //     )
  //   })
  // })


  ipcMain.on('print-slip', (event, slipData) => {
    const slipWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        sandbox: false
      }
    });

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
    }).toString();

    const finalUrl = format({
      protocol: 'file',
      slashes: true,
      pathname: filePath,
      search: `?${queryParams}`
    });

    console.log("🖨️ Loading Slip URL:", finalUrl); // ✅ log to debug

    slipWindow.loadURL(finalUrl);

    slipWindow.webContents.on('did-finish-load', () => {
      slipWindow.webContents.print(
        {
          silent: true,
          printBackground: true,
          // scaleFactor: 100,
          margins: { marginType: 'none' },
          pageSize: {
            width: 50000,
            height: 300000 // Adjusted for slip size
          }
        },
        (success, error) => {
          if (!success) console.error('Print failed:', error);
          slipWindow.close();
        }
      );
    });
  });




  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
