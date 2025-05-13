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
      // This will be implemented in Phase 2
      logger.warn('Screen capture not yet implemented');
      return { success: false, message: 'Screen capture not yet implemented' };
    } catch (error) {
      logger.error('Error during screen capture:', error);
      return { success: false, message: 'Error during screen capture', error: String(error) };
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
