import { release } from 'os'
import { join } from 'path'
import { BrowserWindow, app, ipcMain, protocol, shell } from 'electron'
import windowStateKeeper from 'electron-window-state'
import contextMenu from 'electron-context-menu'
import { deleteImage, downloadJson, selectImage, selectJson, uploadImage } from './handles'

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1'))
  app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32')
  app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

export const ROOT_PATH = {
  dist: join(__dirname, '../..'),
  public: join(__dirname, app.isPackaged ? '../..' : '../../../public'),
}

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL as string
const indexHtml = join(ROOT_PATH.dist, 'index.html')

async function createWindow() {
  // Register a custom protocol called "app" that maps to the app's userData directory
  protocol.registerFileProtocol('app', (request, callback) => {
    // Strip off "app://"
    const url = request.url.substr(6)
    const filePath = join(app.getPath('userData'), url)
    callback({ path: filePath })
  })

  contextMenu({
    showSaveImageAs: true,
  })

  const mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800,
  })

  win = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    title: 'Main window',
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
  })

  mainWindowState.manage(win)
  if (app.isPackaged) {
    win.loadFile(indexHtml)
  }
  else {
    win.loadURL(url)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  }

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:'))
      shell.openExternal(url)
    return { action: 'deny' }
  })

  // Open target="_blank" links in the default browser
  win.webContents.on('new-window', (e, url) => {
    e.preventDefault()
    shell.openExternal(url)
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin')
    app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized())
      win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length)
    allWindows[0].focus()

  else
    createWindow()
})

ipcMain.handle('select-image', selectImage)
ipcMain.handle('upload-image', uploadImage)
ipcMain.handle('delete-image', deleteImage)
ipcMain.handle('download-json', downloadJson)
ipcMain.handle('select-json', selectJson)
