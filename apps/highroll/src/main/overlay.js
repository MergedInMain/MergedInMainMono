const { BrowserWindow, screen } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

function createOverlayWindow() {
  // Get primary display dimensions
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  // Create overlay window
  const overlayWindow = new BrowserWindow({
    width: Math.floor(width * 0.25), // 25% of screen width
    height: Math.floor(height * 0.7), // 70% of screen height
    x: width - Math.floor(width * 0.25) - 20, // Position on right side
    y: 100, // Position from top
    frame: false, // No window frame
    transparent: true, // Transparent background
    alwaysOnTop: true, // Always on top of other windows
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Load the overlay HTML directly from the renderer directory
  overlayWindow.loadFile(path.join(__dirname, '../renderer/overlay.html'));

  // Make the window click-through when not focused
  overlayWindow.setIgnoreMouseEvents(true, { forward: true });

  // Allow mouse events when focused
  overlayWindow.on('focus', () => {
    overlayWindow.setIgnoreMouseEvents(false);
  });

  // Ignore mouse events when blurred
  overlayWindow.on('blur', () => {
    overlayWindow.setIgnoreMouseEvents(true, { forward: true });
  });

  // Hide from taskbar
  overlayWindow.setSkipTaskbar(true);

  return overlayWindow;
}

module.exports = { createOverlayWindow };
