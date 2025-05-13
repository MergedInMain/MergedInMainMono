import { BrowserWindow, screen } from 'electron';
import * as path from 'path';
import { logger } from './logger';

// Keep a global reference of the overlay window
let overlayWindow: BrowserWindow | null = null;

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
  overlayWindow.loadFile(path.join(__dirname, '../renderer/overlay.html'));

  // Hide the overlay by default
  overlayWindow.hide();
  
  // Make the overlay draggable but prevent resizing by default
  overlayWindow.setResizable(false);

  // Handle overlay window closed
  overlayWindow.on('closed', () => {
    logger.info('Overlay window closed');
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
 * Gets the current overlay window
 * @returns The overlay window or null if it doesn't exist
 */
export function getOverlayWindow(): BrowserWindow | null {
  return overlayWindow;
}
