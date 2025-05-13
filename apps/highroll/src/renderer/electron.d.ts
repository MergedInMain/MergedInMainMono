import { GameState } from '../shared/types';

declare global {
  interface Window {
    electron: {
      // Overlay controls
      showOverlay: () => void;
      hideOverlay: () => void;
      setOverlayTransparency: (opacity: number) => void;
      
      // Screen capture
      captureScreen: () => Promise<string>; // Returns base64 encoded image
      
      // Game state
      updateGameState: (gameState: GameState) => void;
      onGameStateUpdated: (callback: (event: Electron.IpcRendererEvent, gameState: GameState) => void) => void;
    };
  }
}

export {};
