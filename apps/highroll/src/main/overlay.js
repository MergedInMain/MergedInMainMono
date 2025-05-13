const { BrowserWindow } = require('electron');
const path = require('path');

let overlayWindow;

/**
 * Sets up the overlay window for the TFT game
 * @param {BrowserWindow} mainWindow - The main application window
 */
function setupOverlay(mainWindow) {
  // Create the overlay window
  overlayWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load the overlay HTML file
  overlayWindow.loadFile(path.join(__dirname, '../renderer/overlay.html'));

  // Hide the overlay by default
  overlayWindow.hide();

  // Handle overlay window closed
  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });

  return overlayWindow;
}

/**
 * Shows the overlay window
 */
function showOverlay() {
  if (overlayWindow) {
    overlayWindow.show();
  }
}

/**
 * Hides the overlay window
 */
function hideOverlay() {
  if (overlayWindow) {
    overlayWindow.hide();
  }
}

/**
 * Sets the transparency of the overlay window
 * @param {number} opacity - Opacity value between 0 and 1
 */
function setOverlayTransparency(opacity) {
  if (overlayWindow) {
    overlayWindow.setOpacity(opacity);
  }
}

module.exports = {
  setupOverlay,
  showOverlay,
  hideOverlay,
  setOverlayTransparency
};
