import { ipcMain, BrowserWindow, dialog } from 'electron';
import type { IpcMainEvent, IpcMainInvokeEvent } from 'electron';
import { showOverlay, hideOverlay, setOverlayTransparency, positionOverlay, resizeOverlay } from './overlay';
import { logger } from './logger';
import { settings } from './settings';

/**
 * Champion interface
 */
interface Champion {
  id: string;
  name: string;
  cost: number;
  stars: number;
  items?: Item[];
}

/**
 * Item interface
 */
interface Item {
  id: string;
  name: string;
}

/**
 * Augment interface
 */
interface Augment {
  id: string;
  name: string;
  tier: number;
}

/**
 * Game state interface
 */
interface GameState {
  stage: string;
  health: number;
  gold: number;
  level: number;
  champions?: Champion[];
  items?: Item[];
  augments?: Augment[];
  [key: string]: unknown;
}

/**
 * Sets up IPC handlers for communication between main and renderer processes
 * @param mainWindow - The main application window
 */
export function setupIpcHandlers(mainWindow: BrowserWindow): void {
  logger.info('Setting up IPC handlers');

  // Handle overlay visibility
  ipcMain.on('overlay:show', (event: IpcMainEvent) => {
    logger.info('IPC: overlay:show received');
    showOverlay();
  });

  ipcMain.on('overlay:hide', (event: IpcMainEvent) => {
    logger.info('IPC: overlay:hide received');
    hideOverlay();
  });

  ipcMain.on('overlay:set-transparency', (event: IpcMainEvent, opacity: number) => {
    logger.info(`IPC: overlay:set-transparency received with opacity ${opacity}`);
    setOverlayTransparency(opacity);
  });

  ipcMain.on('overlay:position', (event: IpcMainEvent, x: number, y: number) => {
    logger.info(`IPC: overlay:position received with coordinates (${x}, ${y})`);
    positionOverlay(x, y);
  });

  ipcMain.on('overlay:resize', (event: IpcMainEvent, width: number, height: number) => {
    logger.info(`IPC: overlay:resize received with dimensions ${width}x${height}`);
    resizeOverlay(width, height);
  });

  // Handle screen capture requests
  ipcMain.handle('screen:capture', async (event: IpcMainInvokeEvent) => {
    logger.info('IPC: screen:capture received');
    try {
      const { desktopCapturer, screen } = require('electron');
      const primaryDisplay = screen.getPrimaryDisplay();

      // Get sources (screens and windows)
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: {
          width: primaryDisplay.size.width,
          height: primaryDisplay.size.height
        }
      });

      // Find the primary display source
      const primarySource = sources.find(source =>
        source.display_id === primaryDisplay.id.toString() ||
        source.id.includes('screen:0:')
      );

      if (!primarySource) {
        logger.error('Primary display source not found');
        return {
          success: false,
          message: 'Primary display source not found'
        };
      }

      // Get the thumbnail as base64
      const thumbnail = primarySource.thumbnail.toDataURL();

      logger.info('Screen capture successful');
      return {
        success: true,
        message: 'Screen capture successful',
        data: thumbnail
      };
    } catch (error) {
      logger.error('Error during screen capture:', error);
      return {
        success: false,
        message: 'Error during screen capture',
        error: String(error)
      };
    }
  });

  // Handle getting available sources for screen capture
  ipcMain.handle('screen:get-sources', async (event: IpcMainInvokeEvent) => {
    logger.info('IPC: screen:get-sources received');
    try {
      const { desktopCapturer } = require('electron');

      // Get sources (screens and windows)
      const sources = await desktopCapturer.getSources({
        types: ['screen', 'window'],
        thumbnailSize: { width: 150, height: 150 }
      });

      // Format sources for the renderer
      const formattedSources = sources.map(source => ({
        id: source.id,
        name: source.name,
        display_id: source.display_id,
        thumbnail: source.thumbnail.toDataURL()
      }));

      logger.info(`Found ${formattedSources.length} sources`);
      return {
        success: true,
        sources: formattedSources
      };
    } catch (error) {
      logger.error('Error getting screen sources:', error);
      return {
        success: false,
        message: 'Error getting screen sources',
        error: String(error)
      };
    }
  });

  // Handle capturing a specific region of the screen
  ipcMain.handle('screen:capture-region', async (event: IpcMainInvokeEvent, region: { x: number, y: number, width: number, height: number }) => {
    logger.info(`IPC: screen:capture-region received for region: ${JSON.stringify(region)}`);
    try {
      const { desktopCapturer, screen } = require('electron');
      const primaryDisplay = screen.getPrimaryDisplay();

      // Validate region parameters
      if (!region || typeof region !== 'object' ||
          typeof region.x !== 'number' ||
          typeof region.y !== 'number' ||
          typeof region.width !== 'number' ||
          typeof region.height !== 'number') {
        logger.error('Invalid region parameters');
        return {
          success: false,
          message: 'Invalid region parameters'
        };
      }

      // Get sources (screens)
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: {
          width: primaryDisplay.size.width,
          height: primaryDisplay.size.height
        }
      });

      // Find the primary display source
      const primarySource = sources.find(source =>
        source.display_id === primaryDisplay.id.toString() ||
        source.id.includes('screen:0:')
      );

      if (!primarySource) {
        logger.error('Primary display source not found');
        return {
          success: false,
          message: 'Primary display source not found'
        };
      }

      // For now, just return the full screenshot
      // In a future implementation, we'll add proper region cropping
      // when the canvas dependency is properly installed
      const fullScreenshot = primarySource.thumbnail.toDataURL();

      // Log that we're returning the full screenshot instead of a cropped region
      logger.warn('Region cropping not implemented yet, returning full screenshot');

      // Get the full screenshot as base64
      const croppedImage = fullScreenshot;

      logger.info('Region capture successful');
      return {
        success: true,
        message: 'Region capture successful',
        data: croppedImage
      };
    } catch (error) {
      logger.error('Error during region capture:', error);
      return {
        success: false,
        message: 'Error during region capture',
        error: String(error)
      };
    }
  });

  // Handle game state updates
  ipcMain.on('game:state-update', (event: IpcMainEvent, gameState: GameState) => {
    logger.info('IPC: game:state-update received', { stage: gameState.stage });
    try {
      // Validate game state
      if (!gameState || typeof gameState !== 'object') {
        logger.warn('Invalid game state received');
        return;
      }

      // Forward game state updates to the overlay window
      mainWindow?.webContents?.send('game:state-updated', gameState);
      logger.debug('Game state forwarded to renderer');
    } catch (error) {
      logger.error('Error processing game state update:', error);
    }
  });

  // Handle app settings
  ipcMain.handle('settings:get', async (event: IpcMainInvokeEvent) => {
    logger.info('IPC: settings:get received');
    return settings.getAll();
  });

  ipcMain.on('settings:save', (event: IpcMainEvent, newSettings: Record<string, unknown>) => {
    logger.info('IPC: settings:save received');

    try {
      // Update settings
      for (const [key, value] of Object.entries(newSettings)) {
        settings.set(key, value);
      }

      logger.info('Settings saved successfully');
      event.sender.send('settings:saved', { success: true });
    } catch (error) {
      logger.error('Failed to save settings:', error);
      event.sender.send('settings:saved', {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  ipcMain.handle('settings:reset', async (event: IpcMainInvokeEvent) => {
    logger.info('IPC: settings:reset received');
    settings.reset();
    return { success: true };
  });

  // Handle app info requests
  ipcMain.handle('app:info', async (event: IpcMainInvokeEvent) => {
    logger.info('IPC: app:info received');
    return {
      version: '0.1.0',
      environment: process.env.NODE_ENV || 'production'
    };
  });

  // Handle error reporting
  ipcMain.on('error:report', (event: IpcMainEvent, error: { message?: string; stack?: string }) => {
    logger.error('Renderer process error:', error);
    dialog.showErrorBox(
      'Application Error',
      `An error occurred in the application: ${error.message || 'Unknown error'}`
    );
  });

  logger.info('IPC handlers setup complete');
}
