import { BrowserWindow, screen, globalShortcut } from 'electron';
import * as path from 'path';
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
  if (process.env.NODE_ENV === 'development') {
    // In development mode, load from webpack dev server
    overlayWindow.loadURL('http://localhost:9000/overlay_window/index.html');
  } else {
    // In production mode, load from file
    overlayWindow.loadFile(path.join(__dirname, '../renderer/overlay.html'));
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
