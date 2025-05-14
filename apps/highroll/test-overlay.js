const { app, BrowserWindow, screen, globalShortcut, ipcMain } = require('electron');
const path = require('path');

// Keep a global reference of the windows
let mainWindow = null;
let overlayWindow = null;
let isClickThrough = false;
let overlayOpacity = 0.8;

// Mock game state for testing
let gameState = {
  stage: 'carousel',
  round: 1,
  health: 100,
  gold: 50,
  level: 1,
  champions: [
    { id: 'TFT9_Ahri', name: 'Ahri', cost: 4, stars: 1 },
    { id: 'TFT9_Akali', name: 'Akali', cost: 5, stars: 1 },
    { id: 'TFT9_Ashe', name: 'Ashe', cost: 1, stars: 2 }
  ],
  traits: [
    { id: 'Set9_Ionia', name: 'Ionian', count: 2, active: true },
    { id: 'Set9_Void', name: 'Void', count: 1, active: false }
  ],
  augments: [
    { id: 'TFT9_Augment_CombatCaster', name: 'Combat Caster', tier: 1 }
  ]
};

function createMainWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load a simple HTML file
  mainWindow.loadFile(path.join(__dirname, 'test-main.html'));

  // Open DevTools
  mainWindow.webContents.openDevTools();

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit();
  });

  return mainWindow;
}

function createOverlayWindow() {
  // Get the primary display dimensions
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  // Create the overlay window
  overlayWindow = new BrowserWindow({
    width: 400,
    height: 300,
    x: Math.floor(width / 2 - 200), // Center horizontally
    y: Math.floor(height / 2 - 150), // Center vertically
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load a simple HTML file
  overlayWindow.loadFile(path.join(__dirname, 'test-overlay.html'));

  // Set initial opacity
  overlayWindow.setOpacity(overlayOpacity);

  // Hide the overlay by default
  overlayWindow.hide();

  // Register global shortcut for toggling overlay visibility (Alt+Shift+O)
  globalShortcut.register('Alt+Shift+O', toggleOverlay);
  console.log('Global shortcut for overlay toggle registered: Alt+Shift+O');

  // Register global shortcut for toggling click-through (Alt+Shift+C)
  globalShortcut.register('Alt+Shift+C', toggleClickThrough);
  console.log('Global shortcut for click-through toggle registered: Alt+Shift+C');

  // Handle overlay window closed
  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });

  // Send initial game state to overlay
  setTimeout(() => {
    if (overlayWindow) {
      overlayWindow.webContents.send('game-state-updated', gameState);
    }
  }, 1000);

  return overlayWindow;
}

function toggleOverlay() {
  if (overlayWindow) {
    if (overlayWindow.isVisible()) {
      overlayWindow.hide();
      console.log('Overlay hidden');
      if (mainWindow) {
        mainWindow.webContents.send('overlay-visibility-changed', false);
      }
    } else {
      overlayWindow.show();
      console.log('Overlay shown');
      if (mainWindow) {
        mainWindow.webContents.send('overlay-visibility-changed', true);
      }
    }
  }
}

function toggleClickThrough() {
  if (overlayWindow) {
    isClickThrough = !isClickThrough;
    overlayWindow.setIgnoreMouseEvents(isClickThrough);
    console.log(`Click-through ${isClickThrough ? 'enabled' : 'disabled'}`);

    // Notify overlay window about click-through state change
    if (overlayWindow) {
      overlayWindow.webContents.send('click-through-changed', isClickThrough);
    }

    // Notify main window about click-through state change
    if (mainWindow) {
      mainWindow.webContents.send('click-through-changed', isClickThrough);
    }
  }
}

function setOverlayTransparency(opacity) {
  if (overlayWindow) {
    // Ensure opacity is between 0 and 1
    overlayOpacity = Math.max(0, Math.min(1, opacity));
    overlayWindow.setOpacity(overlayOpacity);
    console.log(`Overlay transparency set to ${overlayOpacity}`);

    // Notify main window about opacity change
    if (mainWindow) {
      mainWindow.webContents.send('overlay-opacity-changed', overlayOpacity);
    }
  }
}

function resizeOverlay(width, height) {
  if (overlayWindow) {
    overlayWindow.setSize(width, height);
    console.log(`Overlay resized to ${width}x${height}`);

    // Notify main window about size change
    if (mainWindow) {
      mainWindow.webContents.send('overlay-size-changed', { width, height });
    }
  }
}

function updateGameState(newState) {
  // Update the game state
  gameState = { ...gameState, ...newState };
  console.log('Game state updated:', gameState);

  // Send the updated game state to the overlay
  if (overlayWindow) {
    overlayWindow.webContents.send('game-state-updated', gameState);
  }

  // Send the updated game state to the main window
  if (mainWindow) {
    mainWindow.webContents.send('game-state-updated', gameState);
  }
}

// Set up IPC handlers
function setupIPC() {
  // Handle toggle overlay request from renderer
  ipcMain.on('toggle-overlay', () => {
    toggleOverlay();
  });

  // Handle toggle click-through request from renderer
  ipcMain.on('toggle-click-through', () => {
    toggleClickThrough();
  });

  // Handle get click-through state request from renderer
  ipcMain.handle('get-click-through-state', () => {
    return isClickThrough;
  });

  // Handle overlay position change
  ipcMain.on('set-overlay-position', (event, x, y) => {
    if (overlayWindow) {
      overlayWindow.setPosition(x, y);
    }
  });

  // Handle overlay transparency change
  ipcMain.on('set-overlay-transparency', (event, opacity) => {
    setOverlayTransparency(opacity);
  });

  // Handle overlay resize
  ipcMain.on('resize-overlay', (event, width, height) => {
    resizeOverlay(width, height);
  });

  // Handle game state update
  ipcMain.on('update-game-state', (event, newState) => {
    updateGameState(newState);
  });

  // Handle get game state request
  ipcMain.handle('get-game-state', () => {
    return gameState;
  });

  // Handle get overlay opacity request
  ipcMain.handle('get-overlay-opacity', () => {
    return overlayOpacity;
  });

  // Handle get overlay size request
  ipcMain.handle('get-overlay-size', () => {
    if (overlayWindow) {
      return overlayWindow.getSize();
    }
    return [400, 300]; // Default size
  });

  // Handle get overlay visibility request
  ipcMain.handle('get-overlay-visibility', () => {
    if (overlayWindow) {
      return overlayWindow.isVisible();
    }
    return false;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  setupIPC();
  createMainWindow();
  createOverlayWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
      createOverlayWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Unregister shortcuts when app is about to quit
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
