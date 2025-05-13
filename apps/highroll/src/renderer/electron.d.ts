import type { IpcRendererEvent } from 'electron';
import { GameState } from '../shared/types';

/**
 * Screen source interface
 */
interface ScreenSource {
  id: string;
  name: string;
  display_id: string;
  thumbnail: string;
}

/**
 * Type for game state update callback
 */
type GameStateCallback = (event: IpcRendererEvent, gameState: GameState) => void;

/**
 * Type for settings saved callback
 */
type SettingsSavedCallback = (result: { success: boolean; error?: string }) => void;

declare global {
  interface Window {
    electron: {
      // Overlay controls
      showOverlay: () => void;
      hideOverlay: () => void;
      toggleOverlay: () => void;
      setOverlayTransparency: (opacity: number) => void;
      positionOverlay: (x: number, y: number) => void;
      resizeOverlay: (width: number, height: number) => void;
      setClickThrough: (enabled: boolean) => void;
      toggleClickThrough: () => void;
      getClickThroughState: () => Promise<boolean>;

      // Screen capture
      captureScreen: () => Promise<{ success: boolean; message: string; data?: string }>;
      getSources: () => Promise<{ success: boolean; sources?: ScreenSource[]; message?: string; error?: string }>;
      captureRegion: (region: { x: number; y: number; width: number; height: number }) => Promise<{ success: boolean; message: string; data?: string; error?: string }>;

      // Game state
      updateGameState: (gameState: GameState) => void;
      onGameStateUpdated: (callback: GameStateCallback) => void;

      // Settings
      getSettings: () => Promise<Record<string, unknown>>;
      saveSettings: (settings: Record<string, unknown>) => void;
      resetSettings: () => Promise<{ success: boolean }>;
      onSettingsSaved: (callback: SettingsSavedCallback) => void;

      // App info
      getAppInfo: () => Promise<{ version: string; environment: string }>;

      // Error reporting
      reportError: (error: Error | string) => void;
    };
  }
}

export {};
