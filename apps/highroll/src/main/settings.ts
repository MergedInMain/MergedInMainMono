import Store from 'electron-store';
import { logger } from './logger';

/**
 * Default settings interface
 */
export interface Settings {
  overlay: {
    opacity: number;
    position: {
      x: number;
      y: number;
    };
    visible: boolean;
    alwaysOnTop: boolean;
  };
  application: {
    launchOnStartup: boolean;
    minimizeToTray: boolean;
    checkForUpdates: boolean;
  };
  data: {
    source: string;
    refreshFrequency: string;
    lastRefresh?: string;
  };
  developer?: {
    enableDevTools: boolean;
    logLevel: string;
  };
}

/**
 * Default settings
 */
const DEFAULT_SETTINGS: Settings = {
  overlay: {
    opacity: 0.8,
    position: { x: 0, y: 0 },
    visible: false,
    alwaysOnTop: true
  },
  application: {
    launchOnStartup: false,
    minimizeToTray: true,
    checkForUpdates: true
  },
  data: {
    source: 'combined',
    refreshFrequency: 'daily'
  },
  developer: {
    enableDevTools: process.env.NODE_ENV === 'development',
    logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
  }
};

/**
 * Settings store
 */
const store = new Store<Settings>({
  name: 'settings',
  defaults: DEFAULT_SETTINGS
});

/**
 * Initialize settings
 */
export function initSettings(): void {
  try {
    // Ensure all default settings exist
    const currentSettings = store.store;
    const mergedSettings = { ...DEFAULT_SETTINGS };

    // Only override defaults with existing settings
    if (currentSettings.overlay) {
      mergedSettings.overlay = { ...DEFAULT_SETTINGS.overlay, ...currentSettings.overlay };
    }
    if (currentSettings.application) {
      mergedSettings.application = { ...DEFAULT_SETTINGS.application, ...currentSettings.application };
    }
    if (currentSettings.data) {
      mergedSettings.data = { ...DEFAULT_SETTINGS.data, ...currentSettings.data };
    }
    if (currentSettings.developer) {
      mergedSettings.developer = { ...DEFAULT_SETTINGS.developer, ...currentSettings.developer };
    }

    // Save merged settings
    store.store = mergedSettings;
    logger.info('Settings initialized');
  } catch (error) {
    logger.error('Failed to initialize settings:', error);
    // Reset to defaults if there's an error
    store.store = DEFAULT_SETTINGS;
  }
}

/**
 * Get all settings
 * @returns All application settings
 */
export function getSettings(): Settings {
  return store.store;
}

/**
 * Get a specific setting
 * @param key - Setting key path (e.g., 'overlay.opacity')
 * @returns Setting value
 */
export function getSetting<T>(key: string): T {
  return store.get(key) as T;
}

/**
 * Set a specific setting
 * @param key - Setting key path (e.g., 'overlay.opacity')
 * @param value - New setting value
 */
export function setSetting<T>(key: string, value: T): void {
  store.set(key, value);
  logger.debug(`Setting updated: ${key} = ${JSON.stringify(value)}`);
}

/**
 * Reset settings to defaults
 */
export function resetSettings(): void {
  store.store = DEFAULT_SETTINGS;
  logger.info('Settings reset to defaults');
}

/**
 * Settings manager
 */
export const settings = {
  init: initSettings,
  getAll: getSettings,
  get: getSetting,
  set: setSetting,
  reset: resetSettings
};
