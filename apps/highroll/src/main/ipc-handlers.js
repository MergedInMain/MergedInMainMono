const { ipcMain, desktopCapturer, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

function setupIpcHandlers(mainWindow, overlayWindow) {
  // Toggle overlay visibility
  ipcMain.handle('toggle-overlay', (_, visible) => {
    if (visible) {
      overlayWindow.show();
    } else {
      overlayWindow.hide();
    }
    return visible;
  });

  // Set overlay opacity
  ipcMain.handle('set-overlay-opacity', (_, opacity) => {
    overlayWindow.setOpacity(opacity);
    return opacity;
  });

  // Resize overlay window
  ipcMain.handle('resize-overlay', (_, { width, height }) => {
    const [currentWidth, currentHeight] = overlayWindow.getSize();
    overlayWindow.setSize(width || currentWidth, height || currentHeight);
    return { width, height };
  });

  // Reposition overlay window
  ipcMain.handle('reposition-overlay', (_, { x, y }) => {
    overlayWindow.setPosition(x, y);
    return { x, y };
  });

  // Capture screen for game state analysis
  ipcMain.handle('capture-screen', async () => {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['window', 'screen'],
        thumbnailSize: { width: 1920, height: 1080 },
      });

      // Find the primary display source
      const primaryDisplay = screen.getPrimaryDisplay();
      const source = sources.find(s => 
        s.display_id === primaryDisplay.id.toString() || 
        s.name === 'Entire Screen' || 
        s.name.includes('Screen 1')
      );

      if (!source) {
        throw new Error('Could not find primary display source');
      }

      // Save the thumbnail to a temporary file
      const tempDir = path.join(os.tmpdir(), 'tft-overlay');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const timestamp = Date.now();
      const imagePath = path.join(tempDir, `screen-${timestamp}.png`);
      
      // Convert NativeImage to buffer and save to file
      const imageBuffer = source.thumbnail.toPNG();
      fs.writeFileSync(imagePath, imageBuffer);

      return { success: true, imagePath };
    } catch (error) {
      console.error('Error capturing screen:', error);
      return { success: false, error: error.message };
    }
  });

  // Send game state to overlay
  ipcMain.on('update-game-state', (_, gameState) => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.webContents.send('game-state-updated', gameState);
    }
  });
}

module.exports = { setupIpcHandlers };
