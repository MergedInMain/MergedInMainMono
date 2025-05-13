import { BrowserWindow, screen, globalShortcut } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { logger } from './logger';

// Keep a global reference of the overlay window
let overlayWindow: BrowserWindow | null = null;
// Track click-through state
let isClickThrough = false;

/**
 * Sets up the overlay window for the TFT game
 * @param mainWindow - The main application window
 * @returns The created overlay window
 */
export function setupOverlay(mainWindow: BrowserWindow): BrowserWindow {
  logger.info('Setting up overlay window');

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
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  // Load the overlay HTML file
  try {
    if (process.env.NODE_ENV === 'development') {
      // In development mode, try to load from webpack dev server
      const devServerUrl = 'http://localhost:9000/overlay_window';
      logger.info(`Loading overlay URL: ${devServerUrl}`);

      // First try loading from the webpack dev server
      overlayWindow.loadURL(devServerUrl)
        .catch((err) => {
          // Detailed error logging for webpack dev server issues
          logger.error('Failed to load overlay from webpack dev server:', err);

          // Analyze the error type to provide more specific debugging information
          if (err.code === 'ERR_CONNECTION_REFUSED') {
            logger.error('Overlay: Webpack dev server connection refused. Possible causes:');
            logger.error('1. Webpack dev server is not running');
            logger.error('2. Webpack dev server is running on a different port (expected: 9000)');
            logger.error('3. Firewall is blocking the connection');
          } else if (err.code === 'ERR_ABORTED') {
            logger.error('Overlay: Request to webpack dev server was aborted. Possible causes:');
            logger.error('1. Webpack compilation errors for overlay_window entry point');
            logger.error('2. Webpack dev server restarting');
            logger.error('3. Network interruption');
          } else if (err.code === 'ERR_FAILED') {
            logger.error('Overlay: Request to webpack dev server failed. Possible causes:');
            logger.error('1. Incorrect webpack configuration for overlay_window');
            logger.error('2. Entry points not properly defined');
            logger.error('3. HTML template issues for overlay window');
          }

          // Check if the webpack output directory exists and has the expected files for overlay
          const webpackOutputDir = path.join(__dirname, '../../.webpack/renderer/overlay_window');
          try {
            if (fs.existsSync(webpackOutputDir)) {
              logger.info('Overlay: Webpack output directory exists:', webpackOutputDir);
              const files = fs.readdirSync(webpackOutputDir);
              logger.info('Overlay: Files in webpack output directory:', files);

              if (!files.includes('index.html')) {
                logger.error('Overlay: index.html not found in webpack output directory');
              }
              if (!files.includes('index.js')) {
                logger.error('Overlay: index.js not found in webpack output directory');
              }
            } else {
              logger.error('Overlay: Webpack output directory does not exist:', webpackOutputDir);
            }
          } catch (fsErr) {
            logger.error('Overlay: Error checking webpack output directory:', fsErr);
          }

          // Fallback to loading from file system if dev server fails
          const devPath = path.join(__dirname, '../../.webpack/renderer/overlay_window/index.html');
          logger.info(`Overlay: Attempting fallback: Loading file: ${devPath}`);

          // Check if overlayWindow still exists
          if (overlayWindow) {
            return overlayWindow.loadFile(devPath);
          }
          return Promise.reject(new Error('Overlay window was closed'));
        });
    } else {
      // In production mode, load from file
      overlayWindow.loadFile(path.join(__dirname, '../renderer/overlay.html'));
    }
  } catch (error) {
    logger.error('Failed to load overlay HTML file:', error);
    // Fallback to a simple HTML content
    overlayWindow.loadURL('data:text/html;charset=utf-8,<html><body style="background-color:transparent;"><h3>HighRoll Overlay</h3><p>Failed to load overlay. Please check the logs.</p></body></html>');
  }

  // Hide the overlay by default
  overlayWindow.hide();

  // Make the overlay draggable but prevent resizing by default
  overlayWindow.setResizable(false);

  // Set up click-through mode (disabled by default)
  setClickThrough(false);

  // Register global shortcut for toggling overlay visibility (Alt+Shift+O)
  registerShortcuts();

  // Handle overlay window closed
  overlayWindow.on('closed', () => {
    logger.info('Overlay window closed');
    // Unregister shortcuts when the window is closed
    unregisterShortcuts();
    overlayWindow = null;
  });

  // Handle overlay window focus
  overlayWindow.on('focus', () => {
    logger.debug('Overlay window focused');
  });

  // Handle overlay window blur
  overlayWindow.on('blur', () => {
    logger.debug('Overlay window blurred');
  });

  logger.info('Overlay window created successfully');
  return overlayWindow;
}

/**
 * Register global shortcuts for the overlay
 */
function registerShortcuts(): void {
  // Register shortcut for toggling overlay visibility (Alt+Shift+O)
  try {
    globalShortcut.register('Alt+Shift+O', toggleOverlay);
    logger.info('Global shortcut for overlay toggle registered: Alt+Shift+O');
  } catch (error) {
    logger.error('Failed to register global shortcut:', error);
  }
}

/**
 * Unregister global shortcuts
 */
function unregisterShortcuts(): void {
  try {
    globalShortcut.unregister('Alt+Shift+O');
    logger.info('Global shortcut for overlay toggle unregistered');
  } catch (error) {
    logger.error('Failed to unregister global shortcut:', error);
  }
}

/**
 * Toggle overlay visibility
 */
export function toggleOverlay(): void {
  if (overlayWindow) {
    if (overlayWindow.isVisible()) {
      hideOverlay();
    } else {
      showOverlay();
    }
  } else {
    logger.warn('Attempted to toggle overlay, but overlay window does not exist');
  }
}

/**
 * Shows the overlay window
 */
export function showOverlay(): void {
  if (overlayWindow) {
    overlayWindow.show();
    logger.info('Overlay window shown');
  } else {
    logger.warn('Attempted to show overlay window, but it does not exist');
  }
}

/**
 * Hides the overlay window
 */
export function hideOverlay(): void {
  if (overlayWindow) {
    overlayWindow.hide();
    logger.info('Overlay window hidden');
  } else {
    logger.warn('Attempted to hide overlay window, but it does not exist');
  }
}

/**
 * Sets the transparency of the overlay window
 * @param opacity - Opacity value between 0 and 1
 */
export function setOverlayTransparency(opacity: number): void {
  if (overlayWindow) {
    // Ensure opacity is between 0 and 1
    const validOpacity = Math.max(0, Math.min(1, opacity));
    overlayWindow.setOpacity(validOpacity);
    logger.info(`Overlay transparency set to ${validOpacity}`);
  } else {
    logger.warn('Attempted to set overlay transparency, but overlay window does not exist');
  }
}

/**
 * Positions the overlay window
 * @param x - X coordinate
 * @param y - Y coordinate
 */
export function positionOverlay(x: number, y: number): void {
  if (overlayWindow) {
    overlayWindow.setPosition(x, y);
    logger.info(`Overlay positioned at (${x}, ${y})`);
  } else {
    logger.warn('Attempted to position overlay, but overlay window does not exist');
  }
}

/**
 * Resizes the overlay window
 * @param width - New width
 * @param height - New height
 */
export function resizeOverlay(width: number, height: number): void {
  if (overlayWindow) {
    overlayWindow.setSize(width, height);
    logger.info(`Overlay resized to ${width}x${height}`);
  } else {
    logger.warn('Attempted to resize overlay, but overlay window does not exist');
  }
}

/**
 * Sets the click-through state of the overlay window
 * @param enabled - Whether click-through should be enabled
 */
export function setClickThrough(enabled: boolean): void {
  if (overlayWindow) {
    // Set the window to ignore mouse events (click-through)
    overlayWindow.setIgnoreMouseEvents(enabled);
    isClickThrough = enabled;
    logger.info(`Click-through ${enabled ? 'enabled' : 'disabled'}`);
  } else {
    logger.warn('Attempted to set click-through, but overlay window does not exist');
  }
}

/**
 * Toggles the click-through state of the overlay window
 */
export function toggleClickThrough(): void {
  setClickThrough(!isClickThrough);
}

/**
 * Gets the current click-through state
 * @returns Whether click-through is enabled
 */
export function getClickThroughState(): boolean {
  return isClickThrough;
}

/**
 * Gets the current overlay window
 * @returns The overlay window or null if it doesn't exist
 */
export function getOverlayWindow(): BrowserWindow | null {
  return overlayWindow;
}
