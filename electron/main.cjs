const { app, BrowserWindow, shell } = require("electron")
const path = require("node:path")
const { fileURLToPath } = require("node:url")

const devServerUrl = "http://127.0.0.1:3000"
const devServerOrigin = new URL(devServerUrl).origin
let mainWindow

function isAppFile(url) {
  try {
    const filePath = path.resolve(fileURLToPath(url))
    const appFilesPath = path.resolve(app.getAppPath(), "dist")
    const relativePath = path.relative(appFilesPath, filePath)

    return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath))
  } catch {
    return false
  }
}

function isInternalUrl(url) {
  try {
    const parsedUrl = new URL(url)

    if (parsedUrl.protocol === "file:") {
      return isAppFile(parsedUrl)
    }

    return !app.isPackaged && parsedUrl.origin === devServerOrigin
  } catch {
    return false
  }
}

function openExternalUrl(url) {
  try {
    const parsedUrl = new URL(url)

    if (["https:", "http:", "mailto:"].includes(parsedUrl.protocol)) {
      void shell.openExternal(url).catch(() => {})
    }
  } catch {
    return
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 960,
    minHeight: 680,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#14171c",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  mainWindow.once("ready-to-show", () => mainWindow.show())
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!isInternalUrl(url)) {
      openExternalUrl(url)
    }

    return { action: "deny" }
  })
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!isInternalUrl(url)) {
      event.preventDefault()
      openExternalUrl(url)
    }
  })
  mainWindow.on("closed", () => {
    mainWindow = null
  })

  if (app.isPackaged) {
    void mainWindow.loadFile(path.join(app.getAppPath(), "dist", "index.html"))
  } else {
    void mainWindow.loadURL(devServerUrl)
  }
}

const hasSingleInstanceLock = app.requestSingleInstanceLock()

if (!hasSingleInstanceLock) {
  app.quit()
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }

      mainWindow.focus()
    }
  })

  app.whenReady().then(() => {
    createWindow()

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  })

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit()
    }
  })
}
