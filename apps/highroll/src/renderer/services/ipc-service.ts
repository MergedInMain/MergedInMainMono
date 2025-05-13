/**
 * IPC Service for communication between renderer and main processes
 *
 * This service provides a clean API for sending messages to and receiving messages from
 * the main Electron process. It handles error handling, timeouts, and provides type safety.
 */

import { v4 as uuidv4 } from 'uuid';
import { IPC_CHANNELS } from '../../shared/constants';
import { GameState, Settings, ScreenPosition } from '../../shared/types';
import {
  IpcRequest,
  IpcResponse,
  ScreenSource,
  GameStateUpdatedNotification,
  SettingsSavedNotification
} from '../../shared/ipc-types';

// Default timeout for IPC requests in milliseconds
const DEFAULT_TIMEOUT = 10000;

// Type for IPC response callbacks
type ResponseCallback<T extends IpcResponse> = (response: T) => void;

// Type for IPC notification callbacks
type NotificationCallback<T> = (data: T) => void;

// Interface for pending requests
interface PendingRequest<T extends IpcResponse> {
  resolve: (value: T) => void;
  reject: (reason: Error) => void;
  timeoutId: NodeJS.Timeout;
}

// Interface for IPC log entry
export interface IpcLogEntry {
  id: string;
  timestamp: Date;
  direction: 'sent' | 'received';
  channel: string;
  data?: any;
  status: 'success' | 'error';
  error?: string;
}

// Type for IPC log listeners
type LogCallback = (log: IpcLogEntry) => void;

/**
 * IPC Service class for handling communication with the main process
 */
class IpcService {
  private pendingRequests: Map<string, PendingRequest<any>> = new Map();
  private gameStateListeners: Set<NotificationCallback<GameState>> = new Set();
  private settingsSavedListeners: Set<NotificationCallback<{ success: boolean; error?: string }>> = new Set();
  private logListeners: Set<LogCallback> = new Set();
  private logs: IpcLogEntry[] = [];
  private maxLogs: number = 100;

  constructor() {
    this.setupListeners();
  }

  /**
   * Set up listeners for IPC events from the main process
   */
  private setupListeners(): void {
    // Listen for game state updates
    if (window.electron && window.electron.onGameStateUpdated) {
      window.electron.onGameStateUpdated((_, gameState) => {
        this.addLog({
          direction: 'received',
          channel: 'game:state-updated',
          data: gameState,
          status: 'success'
        });
        this.notifyGameStateListeners(gameState);
      });
    }

    // Listen for settings saved events
    if (window.electron && window.electron.onSettingsSaved) {
      window.electron.onSettingsSaved((result) => {
        this.addLog({
          direction: 'received',
          channel: 'settings:saved',
          data: result,
          status: result.success ? 'success' : 'error',
          error: result.error
        });
        this.notifySettingsSavedListeners(result);
      });
    }
  }

  /**
   * Add a log entry and notify listeners
   * @param log The log entry to add
   */
  private addLog(log: Omit<IpcLogEntry, 'id' | 'timestamp'>): void {
    const logEntry: IpcLogEntry = {
      id: uuidv4(),
      timestamp: new Date(),
      ...log
    };

    // Add to logs array
    this.logs.push(logEntry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Notify listeners
    this.notifyLogListeners(logEntry);
  }

  /**
   * Notify all log listeners of a new log entry
   * @param log The log entry
   */
  private notifyLogListeners(log: IpcLogEntry): void {
    this.logListeners.forEach(listener => {
      try {
        listener(log);
      } catch (error) {
        console.error('Error in log listener:', error);
      }
    });
  }

  /**
   * Generate a unique request ID
   * @returns A unique request ID
   */
  private generateRequestId(): string {
    return uuidv4();
  }

  /**
   * Create a timeout for an IPC request
   * @param requestId The request ID
   * @param timeout The timeout duration in milliseconds
   * @returns A timeout ID
   */
  private createTimeout(requestId: string, timeout: number): NodeJS.Timeout {
    return setTimeout(() => {
      const pendingRequest = this.pendingRequests.get(requestId);
      if (pendingRequest) {
        pendingRequest.reject(new Error(`IPC request timed out after ${timeout}ms`));
        this.pendingRequests.delete(requestId);
      }
    }, timeout);
  }

  /**
   * Notify all game state listeners of a new game state
   * @param gameState The new game state
   */
  private notifyGameStateListeners(gameState: GameState): void {
    this.gameStateListeners.forEach(listener => {
      try {
        listener(gameState);
      } catch (error) {
        console.error('Error in game state listener:', error);
      }
    });
  }

  /**
   * Notify all settings saved listeners of a settings saved event
   * @param result The result of the settings save operation
   */
  private notifySettingsSavedListeners(result: { success: boolean; error?: string }): void {
    this.settingsSavedListeners.forEach(listener => {
      try {
        listener(result);
      } catch (error) {
        console.error('Error in settings saved listener:', error);
      }
    });
  }

  /**
   * Show the overlay window
   */
  public showOverlay(): void {
    if (window.electron && window.electron.showOverlay) {
      this.addLog({
        direction: 'sent',
        channel: 'overlay:show',
        status: 'success'
      });
      window.electron.showOverlay();
    } else {
      console.error('showOverlay is not available in the electron API');
      this.addLog({
        direction: 'sent',
        channel: 'overlay:show',
        status: 'error',
        error: 'showOverlay is not available in the electron API'
      });
    }
  }

  /**
   * Hide the overlay window
   */
  public hideOverlay(): void {
    if (window.electron && window.electron.hideOverlay) {
      window.electron.hideOverlay();
    } else {
      console.error('hideOverlay is not available in the electron API');
    }
  }

  /**
   * Toggle the overlay window visibility
   */
  public toggleOverlay(): void {
    if (window.electron && window.electron.toggleOverlay) {
      window.electron.toggleOverlay();
    } else {
      console.error('toggleOverlay is not available in the electron API');
    }
  }

  /**
   * Set the transparency of the overlay window
   * @param opacity The opacity value (0-1)
   */
  public setOverlayTransparency(opacity: number): void {
    if (window.electron && window.electron.setOverlayTransparency) {
      window.electron.setOverlayTransparency(opacity);
    } else {
      console.error('setOverlayTransparency is not available in the electron API');
    }
  }

  /**
   * Position the overlay window
   * @param x The x coordinate
   * @param y The y coordinate
   */
  public positionOverlay(x: number, y: number): void {
    if (window.electron && window.electron.positionOverlay) {
      window.electron.positionOverlay(x, y);
    } else {
      console.error('positionOverlay is not available in the electron API');
    }
  }

  /**
   * Resize the overlay window
   * @param width The width in pixels
   * @param height The height in pixels
   */
  public resizeOverlay(width: number, height: number): void {
    if (window.electron && window.electron.resizeOverlay) {
      window.electron.resizeOverlay(width, height);
    } else {
      console.error('resizeOverlay is not available in the electron API');
    }
  }

  /**
   * Set the click-through state of the overlay window
   * @param enabled Whether click-through is enabled
   */
  public setClickThrough(enabled: boolean): void {
    if (window.electron && window.electron.setClickThrough) {
      window.electron.setClickThrough(enabled);
    } else {
      console.error('setClickThrough is not available in the electron API');
    }
  }

  /**
   * Toggle the click-through state of the overlay window
   */
  public toggleClickThrough(): void {
    if (window.electron && window.electron.toggleClickThrough) {
      window.electron.toggleClickThrough();
    } else {
      console.error('toggleClickThrough is not available in the electron API');
    }
  }

  /**
   * Get the click-through state of the overlay window
   * @returns A promise that resolves to the click-through state
   */
  public async getClickThroughState(): Promise<boolean> {
    if (window.electron && window.electron.getClickThroughState) {
      return window.electron.getClickThroughState();
    } else {
      console.error('getClickThroughState is not available in the electron API');
      return false;
    }
  }

  /**
   * Capture the screen
   * @returns A promise that resolves to the screen capture result
   */
  public async captureScreen(): Promise<{ success: boolean; message: string; data?: string }> {
    if (window.electron && window.electron.captureScreen) {
      return window.electron.captureScreen();
    } else {
      console.error('captureScreen is not available in the electron API');
      return { success: false, message: 'captureScreen is not available' };
    }
  }

  /**
   * Get available screen sources
   * @returns A promise that resolves to the screen sources
   */
  public async getSources(): Promise<{ success: boolean; sources?: ScreenSource[]; message?: string; error?: string }> {
    if (window.electron && window.electron.getSources) {
      return window.electron.getSources();
    } else {
      console.error('getSources is not available in the electron API');
      return { success: false, message: 'getSources is not available' };
    }
  }

  /**
   * Capture a specific region of the screen
   * @param region The region to capture
   * @returns A promise that resolves to the region capture result
   */
  public async captureRegion(region: { x: number; y: number; width: number; height: number }): Promise<{ success: boolean; message: string; data?: string; error?: string }> {
    if (window.electron && window.electron.captureRegion) {
      return window.electron.captureRegion(region);
    } else {
      console.error('captureRegion is not available in the electron API');
      return { success: false, message: 'captureRegion is not available' };
    }
  }

  /**
   * Update the game state
   * @param gameState The new game state
   */
  public updateGameState(gameState: GameState): void {
    if (window.electron && window.electron.updateGameState) {
      this.addLog({
        direction: 'sent',
        channel: 'game:state-update',
        data: gameState,
        status: 'success'
      });
      window.electron.updateGameState(gameState);
    } else {
      console.error('updateGameState is not available in the electron API');
      this.addLog({
        direction: 'sent',
        channel: 'game:state-update',
        data: gameState,
        status: 'error',
        error: 'updateGameState is not available in the electron API'
      });
    }
  }

  /**
   * Register a listener for game state updates
   * @param callback The callback to call when the game state is updated
   * @returns A function to unregister the listener
   */
  public onGameStateUpdated(callback: NotificationCallback<GameState>): () => void {
    this.gameStateListeners.add(callback);
    return () => {
      this.gameStateListeners.delete(callback);
    };
  }

  /**
   * Get application settings
   * @returns A promise that resolves to the application settings
   */
  public async getSettings(): Promise<Record<string, unknown>> {
    if (window.electron && window.electron.getSettings) {
      return window.electron.getSettings();
    } else {
      console.error('getSettings is not available in the electron API');
      return {};
    }
  }

  /**
   * Save application settings
   * @param settings The settings to save
   */
  public saveSettings(settings: Record<string, unknown>): void {
    if (window.electron && window.electron.saveSettings) {
      window.electron.saveSettings(settings);
    } else {
      console.error('saveSettings is not available in the electron API');
    }
  }

  /**
   * Reset application settings to defaults
   * @returns A promise that resolves to the reset result
   */
  public async resetSettings(): Promise<{ success: boolean }> {
    if (window.electron && window.electron.resetSettings) {
      return window.electron.resetSettings();
    } else {
      console.error('resetSettings is not available in the electron API');
      return { success: false };
    }
  }

  /**
   * Register a listener for settings saved events
   * @param callback The callback to call when settings are saved
   * @returns A function to unregister the listener
   */
  public onSettingsSaved(callback: NotificationCallback<{ success: boolean; error?: string }>): () => void {
    this.settingsSavedListeners.add(callback);
    return () => {
      this.settingsSavedListeners.delete(callback);
    };
  }

  /**
   * Get application info
   * @returns A promise that resolves to the application info
   */
  public async getAppInfo(): Promise<{ version: string; environment: string }> {
    if (window.electron && window.electron.getAppInfo) {
      return window.electron.getAppInfo();
    } else {
      console.error('getAppInfo is not available in the electron API');
      return { version: 'unknown', environment: 'unknown' };
    }
  }

  /**
   * Report an error to the main process
   * @param error The error to report
   */
  public reportError(error: Error | string): void {
    if (window.electron && window.electron.reportError) {
      const errorObj = typeof error === 'string' ? { message: error } : { message: error.message, stack: error.stack };

      this.addLog({
        direction: 'sent',
        channel: 'error:report',
        data: errorObj,
        status: 'success'
      });

      window.electron.reportError(error);
    } else {
      console.error('reportError is not available in the electron API');

      this.addLog({
        direction: 'sent',
        channel: 'error:report',
        data: typeof error === 'string' ? { message: error } : { message: error.message, stack: error.stack },
        status: 'error',
        error: 'reportError is not available in the electron API'
      });
    }
  }

  /**
   * Register a listener for IPC logs
   * @param callback The callback to call when a new log entry is added
   * @returns A function to unregister the listener
   */
  public onLog(callback: LogCallback): () => void {
    this.logListeners.add(callback);
    return () => {
      this.logListeners.delete(callback);
    };
  }

  /**
   * Get all logs
   * @returns All logs
   */
  public getLogs(): IpcLogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear all logs
   */
  public clearLogs(): void {
    this.logs = [];
  }

  /**
   * Set the maximum number of logs to keep
   * @param maxLogs The maximum number of logs to keep
   */
  public setMaxLogs(maxLogs: number): void {
    this.maxLogs = maxLogs;

    // Trim logs if necessary
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }
}

// Create and export a singleton instance of the IPC service
const ipcService = new IpcService();
export default ipcService;
