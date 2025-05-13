const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

// Keep a global reference of the window objects
let mainWindow = null;
let overlayWindow = null;
let isClickThrough = false;

function createMainWindow() {
  // Create the main window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Load a simple HTML content
  mainWindow.loadFile(path.join(__dirname, 'test-main.html'));

  // Open DevTools
  mainWindow.webContents.openDevTools();

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createOverlayWindow() {
  // Create the overlay window
  overlayWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Load a simple HTML content
  overlayWindow.loadFile(path.join(__dirname, 'test-overlay.html'));

  // Hide the overlay by default
  overlayWindow.hide();

  // Handle window closed
  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });

  console.log('Overlay window created');
}

function toggleOverlay() {
  if (overlayWindow) {
    if (overlayWindow.isVisible()) {
      overlayWindow.hide();
      console.log('Overlay hidden');
    } else {
      overlayWindow.show();
      console.log('Overlay shown');
    }
  } else {
    console.log('Overlay window does not exist');
  }
}

function toggleClickThrough() {
  if (overlayWindow) {
    isClickThrough = !isClickThrough;
    overlayWindow.setIgnoreMouseEvents(isClickThrough);
    console.log(`Click-through ${isClickThrough ? 'enabled' : 'disabled'}`);
  } else {
    console.log('Overlay window does not exist');
  }
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createMainWindow();
  createOverlayWindow();

  // Register global shortcut for toggling overlay visibility (Alt+Shift+O)
  globalShortcut.register('Alt+Shift+O', toggleOverlay);
  console.log('Global shortcut for overlay toggle registered: Alt+Shift+O');

  // Register global shortcut for toggling click-through (Alt+Shift+C)
  globalShortcut.register('Alt+Shift+C', toggleClickThrough);
  console.log('Global shortcut for click-through toggle registered: Alt+Shift+C');

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
      createOverlayWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Unregister shortcuts when app is about to quit
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  console.log('Global shortcuts unregistered');
});
