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
  try {
    if (process.env.NODE_ENV === 'development') {
      // In development mode, try to load from webpack dev server
      const devServerUrl = 'http://localhost:9000/main_window';
      logger.info(`Loading URL: ${devServerUrl}`);

      // First try loading from the webpack dev server
      mainWindow.loadURL(devServerUrl)
        .catch((err) => {
          // Detailed error logging for webpack dev server issues
          logger.error('Failed to load from webpack dev server:', err);

          // Create detailed error information for debugging
          let errorDetails = '';
          let errorTitle = 'Webpack Dev Server Error';
          let possibleSolutions = '';

          // Analyze the error type to provide more specific debugging information
          if (err.code === 'ERR_CONNECTION_REFUSED') {
            errorTitle = 'Webpack Dev Server Connection Refused';
            errorDetails = 'The application could not connect to the webpack dev server.';

            logger.error('Webpack dev server connection refused. Possible causes:');
            logger.error('1. Webpack dev server is not running');
            logger.error('2. Webpack dev server is running on a different port (expected: 9000)');
            logger.error('3. Firewall is blocking the connection');

            possibleSolutions = `
              <h3>Possible Solutions:</h3>
              <ol>
                <li>Make sure webpack dev server is running</li>
                <li>Check if webpack dev server is running on port 9000</li>
                <li>Check firewall settings</li>
                <li>Run the webpack-debug script: npm run webpack-debug</li>
              </ol>
            `;

            // Check if webpack dev server is running by attempting to fetch its status
            fetch('http://localhost:9000/status', { method: 'HEAD' })
              .then(() => {
                logger.info('Webpack dev server is running, but the main_window endpoint might be misconfigured');
                errorDetails += ' The server is running, but the main_window endpoint might be misconfigured.';
              })
              .catch(fetchErr => {
                logger.error('Webpack dev server status check failed:', fetchErr);
                errorDetails += ' The server is not running or not accessible.';
              });
          } else if (err.code === 'ERR_ABORTED') {
            errorTitle = 'Webpack Dev Server Request Aborted';
            errorDetails = 'The request to the webpack dev server was aborted.';

            logger.error('Request to webpack dev server was aborted. Possible causes:');
            logger.error('1. Webpack compilation errors');
            logger.error('2. Webpack dev server restarting');
            logger.error('3. Network interruption');

            possibleSolutions = `
              <h3>Possible Solutions:</h3>
              <ol>
                <li>Check webpack compilation errors in the terminal</li>
                <li>Wait for webpack dev server to finish restarting</li>
                <li>Check network connectivity</li>
                <li>Run the webpack-debug script: npm run webpack-debug</li>
              </ol>
            `;
          } else if (err.code === 'ERR_FAILED') {
            errorTitle = 'Webpack Dev Server Request Failed';
            errorDetails = 'The request to the webpack dev server failed.';

            logger.error('Request to webpack dev server failed. Possible causes:');
            logger.error('1. Incorrect webpack configuration');
            logger.error('2. Entry points not properly defined');
            logger.error('3. HTML template issues');

            possibleSolutions = `
              <h3>Possible Solutions:</h3>
              <ol>
                <li>Check webpack configuration files</li>
                <li>Verify entry points in webpack.renderer.config.js</li>
                <li>Check HTML templates</li>
                <li>Run the webpack-debug script: npm run webpack-debug</li>
              </ol>
            `;

            // Check webpack configuration
            try {
              const webpackConfigPath = path.join(__dirname, '../../webpack.renderer.config.js');
              const webpackDevServerPath = path.join(__dirname, '../../webpack.dev.js');

              if (fs.existsSync(webpackConfigPath)) {
                logger.info('Webpack renderer config exists at:', webpackConfigPath);
              } else {
                logger.error('Webpack renderer config not found at:', webpackConfigPath);
                errorDetails += ' Webpack renderer config file not found.';
              }

              if (fs.existsSync(webpackDevServerPath)) {
                logger.info('Webpack dev server config exists at:', webpackDevServerPath);
              } else {
                logger.error('Webpack dev server config not found at:', webpackDevServerPath);
                errorDetails += ' Webpack dev server config file not found.';
              }
            } catch (configErr) {
              logger.error('Error checking webpack configuration:', configErr);
              errorDetails += ' Error checking webpack configuration files.';
            }
          } else {
            errorTitle = 'Unknown Webpack Error';
            errorDetails = `An unknown error occurred: ${err.message}`;

            possibleSolutions = `
              <h3>Possible Solutions:</h3>
              <ol>
                <li>Check the application logs for more details</li>
                <li>Restart the application</li>
                <li>Run the webpack-debug script: npm run webpack-debug</li>
              </ol>
            `;
          }

          // Check if the webpack output directory exists and has the expected files
          const webpackOutputDir = path.join(__dirname, '../../.webpack/renderer/main_window');
          try {
            if (fs.existsSync(webpackOutputDir)) {
              logger.info('Webpack output directory exists:', webpackOutputDir);
              const files = fs.readdirSync(webpackOutputDir);
              logger.info('Files in webpack output directory:', files);

              if (!files.includes('index.html')) {
                logger.error('index.html not found in webpack output directory');
                errorDetails += ' index.html not found in webpack output directory.';
              }
              if (!files.includes('index.js')) {
                logger.error('index.js not found in webpack output directory');
                errorDetails += ' index.js not found in webpack output directory.';
              }
            } else {
              logger.error('Webpack output directory does not exist:', webpackOutputDir);
              errorDetails += ' Webpack output directory does not exist.';
            }
          } catch (fsErr) {
            logger.error('Error checking webpack output directory:', fsErr);
            errorDetails += ' Error checking webpack output directory.';
          }

          // Show error dialog with detailed information
          dialog.showErrorBox(errorTitle,
            `${errorDetails}\n\nCheck the console for more detailed information.`);

          // Create a detailed HTML error page
          const errorHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <title>Webpack Error - HighRoll</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                  margin: 0;
                  padding: 20px;
                  background-color: #1e1e1e;
                  color: #ffffff;
                }
                .error-container {
                  max-width: 800px;
                  margin: 0 auto;
                  background-color: #252525;
                  border-radius: 8px;
                  padding: 20px;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                h1 {
                  color: #ff5252;
                  margin-top: 0;
                }
                h2 {
                  color: #ff7b7b;
                }
                h3 {
                  color: #ffb74d;
                }
                pre {
                  background-color: #1a1a1a;
                  padding: 10px;
                  border-radius: 4px;
                  overflow-x: auto;
                }
                .error-message {
                  color: #ff5252;
                  font-weight: bold;
                }
                .error-code {
                  color: #ffb74d;
                  font-family: monospace;
                }
                button {
                  background-color: #0078d4;
                  color: white;
                  border: none;
                  padding: 8px 16px;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 14px;
                  margin-top: 20px;
                }
                button:hover {
                  background-color: #005a9e;
                }
              </style>
            </head>
            <body>
              <div class="error-container">
                <h1>Webpack Dev Server Error</h1>
                <h2>${errorTitle}</h2>
                <p>${errorDetails}</p>
                <h3>Error Details</h3>
                <pre class="error-code">${err.toString()}</pre>
                <p class="error-message">Error Code: ${err.code || 'Unknown'}</p>
                ${possibleSolutions}
                <h3>Debug Commands</h3>
                <pre>npm run webpack-debug    # Run webpack debug utility
npm run dev-verbose     # Run with verbose logging</pre>
                <button onclick="window.location.reload()">Reload Application</button>
              </div>
            </body>
            </html>
          `;

          // Fallback to loading the error HTML
          if (mainWindow) {
            mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`);
          }

          // Also try to load from file system as a last resort
          const devPath = path.join(__dirname, '../../.webpack/renderer/main_window/index.html');
          logger.info(`Attempting fallback: Loading file: ${devPath}`);

          // Check if the file exists before trying to load it
          if (fs.existsSync(devPath)) {
            logger.info(`Fallback file exists: ${devPath}`);
            // Don't actually load it yet, show the error page first
          } else {
            logger.error(`Fallback file does not exist: ${devPath}`);
          }

          return Promise.reject(new Error('Webpack dev server error'));
        });
    } else {
      // In production mode, load from file
      mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }
  } catch (error) {
    logger.error('Failed to load HTML file:', error);

    // Show error dialog
    dialog.showErrorBox('Failed to Load Application',
      `An error occurred while loading the application: ${error instanceof Error ? error.message : String(error)}\n\nCheck the logs for more details.`);

    // Fallback to a simple HTML content with error details
    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Error - HighRoll</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #1e1e1e;
            color: #ffffff;
          }
          .error-container {
            max-width: 800px;
            margin: 0 auto;
            background-color: #252525;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #ff5252;
          }
          pre {
            background-color: #1a1a1a;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
          }
          button {
            background-color: #0078d4;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin-top: 20px;
          }
          button:hover {
            background-color: #005a9e;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1>Failed to Load Application</h1>
          <p>An error occurred while loading the application:</p>
          <pre>${error instanceof Error ? error.toString() : String(error)}</pre>
          <p>Please check the logs for more details.</p>
          <button onclick="window.location.reload()">Reload Application</button>
        </div>
      </body>
      </html>
    `;

    mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`);
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
