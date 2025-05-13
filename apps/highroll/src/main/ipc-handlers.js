const { ipcMain } = require('electron');
const { showOverlay, hideOverlay, setOverlayTransparency } = require('./overlay');

/**
 * Sets up IPC handlers for communication between main and renderer processes
 * @param {BrowserWindow} mainWindow - The main application window
 */
function setupIpcHandlers(mainWindow) {
  // Handle overlay visibility
  ipcMain.on('overlay:show', () => {
    showOverlay();
  });

  ipcMain.on('overlay:hide', () => {
    hideOverlay();
  });

  ipcMain.on('overlay:set-transparency', (event, opacity) => {
    setOverlayTransparency(opacity);
  });

  // Handle screen capture requests
  ipcMain.handle('screen:capture', async () => {
    // This will be implemented in Phase 2
    return { success: false, message: 'Screen capture not yet implemented' };
  });

  // Handle game state updates
  ipcMain.on('game:state-update', (event, gameState) => {
    // Forward game state updates to the overlay window
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('game:state-updated', gameState);
    }
  });
}

module.exports = {
  setupIpcHandlers
};
