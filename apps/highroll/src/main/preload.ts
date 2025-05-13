import { contextBridge, ipcRenderer } from 'electron';
import type { IpcRendererEvent } from 'electron';

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
 * Type for game state update callback
 */
type GameStateCallback = (event: IpcRendererEvent, gameState: GameState) => void;

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    // Overlay controls
    showOverlay: (): void => {
      ipcRenderer.send('overlay:show');
    },

    hideOverlay: (): void => {
      ipcRenderer.send('overlay:hide');
    },

    setOverlayTransparency: (opacity: number): void => {
      ipcRenderer.send('overlay:set-transparency', opacity);
    },

    positionOverlay: (x: number, y: number): void => {
      ipcRenderer.send('overlay:position', x, y);
    },

    resizeOverlay: (width: number, height: number): void => {
      ipcRenderer.send('overlay:resize', width, height);
    },

    // Screen capture
    captureScreen: (): Promise<{ success: boolean; message: string; data?: string }> => {
      return ipcRenderer.invoke('screen:capture');
    },

    getSources: (): Promise<{ success: boolean; sources?: Array<{ id: string; name: string; display_id: string; thumbnail: string }>; message?: string; error?: string }> => {
      return ipcRenderer.invoke('screen:get-sources');
    },

    captureRegion: (region: { x: number; y: number; width: number; height: number }): Promise<{ success: boolean; message: string; data?: string; error?: string }> => {
      return ipcRenderer.invoke('screen:capture-region', region);
    },

    // Game state
    updateGameState: (gameState: GameState): void => {
      ipcRenderer.send('game:state-update', gameState);
    },

    onGameStateUpdated: (callback: GameStateCallback): void => {
      // Wrap the callback to avoid exposing the event object directly
      const wrappedCallback = (event: IpcRendererEvent, gameState: GameState) => {
        callback(event, gameState);
      };

      ipcRenderer.on('game:state-updated', wrappedCallback);
    },

    // Settings
    getSettings: (): Promise<Record<string, unknown>> => {
      return ipcRenderer.invoke('settings:get');
    },

    saveSettings: (settings: Record<string, unknown>): void => {
      ipcRenderer.send('settings:save', settings);
    },

    resetSettings: (): Promise<{ success: boolean }> => {
      return ipcRenderer.invoke('settings:reset');
    },

    onSettingsSaved: (callback: (result: { success: boolean; error?: string }) => void): void => {
      ipcRenderer.on('settings:saved', (_event, result) => callback(result));
    },

    // App info
    getAppInfo: (): Promise<{ version: string; environment: string }> => {
      return ipcRenderer.invoke('app:info');
    },

    // Error reporting
    reportError: (error: Error | string): void => {
      const errorObj = typeof error === 'string'
        ? { message: error }
        : { message: error.message, stack: error.stack };

      ipcRenderer.send('error:report', errorObj);
    }
  }
);

// Log that preload script has executed
console.log('Preload script has been loaded');
