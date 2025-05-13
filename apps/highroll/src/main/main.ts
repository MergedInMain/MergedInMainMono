import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { setupOverlay } from './overlay';
import { setupIpcHandlers } from './ipc-handlers';
import { setupLogger, logger } from './logger';
import { settings } from './settings';

// Prevent multiple instances of the app
const gotTheLock = app.requestSingleInstanceLock();

// Keep a global reference of the window objects to prevent garbage collection
let mainWindow: BrowserWindow | null = null;

/**
 * Creates the main application window
 */
function createWindow(): BrowserWindow {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    },
    show: false, // Don't show until ready-to-show
    backgroundColor: '#1e1e1e',
    title: 'HighRoll - TFT Overlay'
  });

  // Load the index.html of the app
  if (process.env.NODE_ENV === 'development') {
    // In development mode, load from webpack dev server
    mainWindow.loadURL('http://localhost:9000/main_window/index.html');
  } else {
    // In production mode, load from file
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Show window when ready to prevent flickering
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
    logger.info('DevTools opened in development mode');
  }

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Open URLs in the default browser
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Set up the overlay window
  setupOverlay(mainWindow);

  // Set up IPC handlers
  setupIpcHandlers(mainWindow);

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

/**
 * Initialize the application
 */
async function initializeApp(): Promise<void> {
  try {
    // Set up logging
    setupLogger();
    logger.info('Application starting...');

    // Initialize settings
    settings.init();
    logger.info('Settings initialized');

    // Create data directory if it doesn't exist
    const userDataPath = app.getPath('userData');
    const appDataPath = path.join(userDataPath, 'data');

    if (!fs.existsSync(appDataPath)) {
      fs.mkdirSync(appDataPath, { recursive: true });
      logger.info(`Created data directory: ${appDataPath}`);
    }

    // Create the main window
    createWindow();
    logger.info('Main window created successfully');
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    dialog.showErrorBox(
      'Initialization Error',
      'Failed to initialize the application. Please check the logs for more details.'
    );
    app.quit();
  }
}

// This method will be called when Electron has finished initialization
// and is ready to create browser windows
app.whenReady().then(initializeApp);

// Handle second instance
if (!gotTheLock) {
  logger.info('Another instance is already running, quitting...');
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
      logger.info('Focused existing window for second instance');
    }
  });
}

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  logger.info('All windows closed');
  // On macOS it is common for applications to stay open
  // until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  logger.info('App activated');
  // On macOS it's common to re-create a window when the dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle app before quit
app.on('before-quit', () => {
  logger.info('Application is quitting...');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  dialog.showErrorBox(
    'Unexpected Error',
    'An unexpected error occurred. The application will attempt to continue running.'
  );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection:', reason);
});
