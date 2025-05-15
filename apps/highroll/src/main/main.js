const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { setupIpcHandlers } = require('./ipc-handlers');
const { createOverlayWindow } = require('./overlay');

// Keep a global reference of the window objects to prevent garbage collection
let mainWindow = null;
let overlayWindow = null;

function createMainWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Load the index.html directly from the renderer directory
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Open DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Create overlay window
  overlayWindow = createOverlayWindow();

  // Set up IPC handlers
  setupIpcHandlers(mainWindow, overlayWindow);

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
    if (overlayWindow) {
      overlayWindow.close();
      overlayWindow = null;
    }
  });
}

// Create window when Electron is ready
app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
