/**
 * Application-wide constants
 */

// IPC Channels
export const IPC_CHANNELS = {
  // Overlay controls
  OVERLAY_SHOW: 'overlay:show',
  OVERLAY_HIDE: 'overlay:hide',
  OVERLAY_SET_TRANSPARENCY: 'overlay:set-transparency',
  
  // Screen capture
  SCREEN_CAPTURE: 'screen:capture',
  
  // Game state
  GAME_STATE_UPDATE: 'game:state-update',
  GAME_STATE_UPDATED: 'game:state-updated',
};

// Default settings
export const DEFAULT_SETTINGS = {
  overlay: {
    opacity: 0.8,
    position: { x: 0, y: 0 },
    visible: false,
  },
  application: {
    launchOnStartup: false,
    minimizeToTray: true,
  },
  data: {
    source: 'combined',
    refreshFrequency: 'daily',
  },
};

// Application paths
export const APP_PATHS = {
  DATA_DIR: 'data',
  CACHE_DIR: 'cache',
  LOGS_DIR: 'logs',
};

// Data refresh intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  DAILY: 24 * 60 * 60 * 1000,
  WEEKLY: 7 * 24 * 60 * 60 * 1000,
};

// External API endpoints
export const API_ENDPOINTS = {
  META_TFT: 'https://api.metatft.com/tft',
  TACTICS_TOOLS: 'https://api.tactics.tools/tft',
  RIOT_GAMES: 'https://developer.riotgames.com/apis',
};

// Game state update frequency (in milliseconds)
export const GAME_STATE_UPDATE_INTERVAL = 1000;

// Screen capture regions
export const SCREEN_REGIONS = {
  BOARD: { x: 0, y: 0, width: 0, height: 0 }, // To be calibrated
  BENCH: { x: 0, y: 0, width: 0, height: 0 }, // To be calibrated
  ITEMS: { x: 0, y: 0, width: 0, height: 0 }, // To be calibrated
  GOLD: { x: 0, y: 0, width: 0, height: 0 }, // To be calibrated
  LEVEL: { x: 0, y: 0, width: 0, height: 0 }, // To be calibrated
  AUGMENTS: { x: 0, y: 0, width: 0, height: 0 }, // To be calibrated
};
