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

declare global {
  interface Window {
    electron: {
      // Overlay controls
      showOverlay: () => void;
      hideOverlay: () => void;
      setOverlayTransparency: (opacity: number) => void;
      positionOverlay: (x: number, y: number) => void;
      resizeOverlay: (width: number, height: number) => void;

      // Screen capture
      captureScreen: () => Promise<{ success: boolean; message: string; data?: string }>;

      // Game state
      updateGameState: (gameState: GameState) => void;
      onGameStateUpdated: (callback: GameStateCallback) => void;

      // Settings
      getSettings: () => Promise<Record<string, unknown>>;
      saveSettings: (settings: Record<string, unknown>) => void;
      resetSettings: () => Promise<{ success: boolean }>;
      onSettingsSaved: (callback: (result: { success: boolean; error?: string }) => void) => void;

      // App info
      getAppInfo: () => Promise<{ version: string; environment: string }>;

      // Error reporting
      reportError: (error: Error | string) => void;
    };
  }
}

export {};
