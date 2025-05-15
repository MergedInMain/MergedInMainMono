// Game state constants
export const GAME_STAGES = {
  CAROUSEL: 'carousel',
  PLANNING: 'planning',
  COMBAT: 'combat',
  AUGMENT_SELECTION: 'augment_selection',
};

// Item constants
export const ITEM_TYPES = {
  BASIC: 'basic',
  COMBINED: 'combined',
  SPECIAL: 'special',
  ORNN: 'ornn',
};

// Champion cost tiers
export const CHAMPION_TIERS = {
  TIER_1: 1,
  TIER_2: 2,
  TIER_3: 3,
  TIER_4: 4,
  TIER_5: 5,
};

// Trait activation thresholds
export const TRAIT_THRESHOLDS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
  CHROMATIC: 'chromatic',
};

// API endpoints
export const API_ENDPOINTS = {
  META_TFT: 'https://api.metatft.com/tft',
  TACTICS_TOOLS: 'https://api.tactics.tools/tft',
  RIOT_GAMES: 'https://na1.api.riotgames.com/tft',
};

// Local storage keys
export const STORAGE_KEYS = {
  SETTINGS: 'settings',
  CACHED_DATA: 'cached_data',
  LAST_UPDATE: 'last_update',
};

// Default settings
export const DEFAULT_SETTINGS = {
  overlayOpacity: 0.8,
  overlayPosition: { x: 0, y: 0 },
  overlaySize: { width: 400, height: 600 },
  captureInterval: 5000, // ms
  dataRefreshInterval: 86400000, // 24 hours in ms
  hotkeys: {
    toggleOverlay: 'Alt+T',
    captureScreen: 'Alt+C',
  },
};

// Screen capture regions
export const CAPTURE_REGIONS = {
  BOARD: { x: 0.2, y: 0.2, width: 0.6, height: 0.6 }, // Relative to screen size
  BENCH: { x: 0.2, y: 0.8, width: 0.6, height: 0.1 },
  GOLD: { x: 0.9, y: 0.1, width: 0.1, height: 0.1 },
  LEVEL: { x: 0.1, y: 0.1, width: 0.1, height: 0.1 },
  AUGMENTS: { x: 0.4, y: 0.4, width: 0.2, height: 0.2 },
};
