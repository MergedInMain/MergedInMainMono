/**
 * Application constants
 */

// Application version
export const APP_VERSION = '0.1.0';

// IPC channels
export const IPC_CHANNELS = {
  OVERLAY: {
    SHOW: 'overlay:show',
    HIDE: 'overlay:hide',
    SET_TRANSPARENCY: 'overlay:set-transparency'
  },
  SCREEN: {
    CAPTURE: 'screen:capture'
  },
  GAME: {
    STATE_UPDATE: 'game:state-update',
    STATE_UPDATED: 'game:state-updated'
  }
};

// Data sources
export const DATA_SOURCES = {
  META_TFT: 'metatft',
  TACTICS_TOOLS: 'tactics',
  COMBINED: 'combined'
};

// Data refresh frequencies
export const REFRESH_FREQUENCIES = {
  STARTUP: 'startup',
  DAILY: 'daily',
  MANUAL: 'manual'
};

// Default settings
export const DEFAULT_SETTINGS = {
  overlay: {
    opacity: 0.8,
    position: { x: 0, y: 0 },
    visible: false
  },
  application: {
    launchOnStartup: false,
    minimizeToTray: true
  },
  data: {
    source: DATA_SOURCES.COMBINED,
    refreshFrequency: REFRESH_FREQUENCIES.DAILY
  }
};
