// Preload script for the main window
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    // Overlay controls
    showOverlay: () => ipcRenderer.send('overlay:show'),
    hideOverlay: () => ipcRenderer.send('overlay:hide'),
    setOverlayTransparency: (opacity) => ipcRenderer.send('overlay:set-transparency', opacity),
    
    // Screen capture
    captureScreen: () => ipcRenderer.invoke('screen:capture'),
    
    // Game state
    updateGameState: (gameState) => ipcRenderer.send('game:state-update', gameState),
    onGameStateUpdated: (callback) => ipcRenderer.on('game:state-updated', callback)
  }
);
