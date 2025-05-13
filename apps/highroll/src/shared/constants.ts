/**
 * Application-wide constants
 */

// IPC Channels
export const IPC_CHANNELS = {
  // Overlay controls
  OVERLAY_SHOW: 'overlay:show',
  OVERLAY_HIDE: 'overlay:hide',
  OVERLAY_TOGGLE: 'overlay:toggle',
  OVERLAY_SET_TRANSPARENCY: 'overlay:set-transparency',
  OVERLAY_POSITION: 'overlay:position',
  OVERLAY_RESIZE: 'overlay:resize',
  OVERLAY_SET_CLICK_THROUGH: 'overlay:set-click-through',
  OVERLAY_TOGGLE_CLICK_THROUGH: 'overlay:toggle-click-through',
  OVERLAY_GET_CLICK_THROUGH_STATE: 'overlay:get-click-through-state',

  // Screen capture
  SCREEN_CAPTURE: 'screen:capture',

  // Game state
  GAME_STATE_UPDATE: 'game:state-update',
  GAME_STATE_UPDATED: 'game:state-updated',

  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_SAVE: 'settings:save',
  SETTINGS_RESET: 'settings:reset',
  SETTINGS_SAVED: 'settings:saved',

  // App info
  APP_INFO: 'app:info',

  // Error reporting
  ERROR_REPORT: 'error:report',
};

// Default settings
export const DEFAULT_SETTINGS = {
  overlay: {
    opacity: 0.8,
    position: { x: 0, y: 0 },
    visible: false,
    alwaysOnTop: true,
  },
  application: {
    launchOnStartup: false,
    minimizeToTray: true,
    checkForUpdates: true,
  },
  data: {
    source: 'combined',
    refreshFrequency: 'daily',
  },
  developer: {
    enableDevTools: process.env.NODE_ENV === 'development',
    logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
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
