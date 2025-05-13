/**
 * Type definitions for the application
 */

/**
 * Position interface for board positions
 */
export interface Position {
  row: number; // Row position (0-based)
  col: number; // Column position (0-based)
}

/**
 * Position interface for screen coordinates
 */
export interface ScreenPosition {
  x: number;
  y: number;
}

/**
 * Item interface
 */
export interface Item {
  id: string; // Unique identifier for the item
  name: string; // Name of the item
  isComponent?: boolean; // Whether the item is a component
  components?: string[]; // Component items (if not a component)
  description?: string; // Description of the item
}

/**
 * Champion/Unit interface
 */
export interface Champion {
  id: string; // Unique identifier for the champion
  name: string; // Name of the champion
  cost: number; // Cost of the champion (1-5)
  stars?: number; // Star level of the champion (1-3)
  star?: number; // Alternative property for star level
  traits?: string[]; // Traits of the champion
  items?: Item[]; // Items equipped on the champion
  position?: Position; // Position of the champion on the board
}

/**
 * Economy interface
 */
export interface Economy {
  gold: number; // Current gold
  level: number; // Current player level
  xp?: number; // Current player XP
  streak?: number; // Current win/loss streak
  health?: number; // Current player health
}

/**
 * Augment interface
 */
export interface Augment {
  id: string; // Unique identifier for the augment
  name: string; // Name of the augment
  description?: string; // Description of the augment
  tier: string | number; // Tier of the augment (silver, gold, prismatic) or (1, 2, 3)
}

/**
 * Game state interface
 */
export interface GameState {
  stage?: string; // Current game stage
  health?: number; // Current player health
  gold?: number; // Current gold
  level?: number; // Current player level
  board?: Champion[]; // Units currently on the board
  bench?: Champion[]; // Units currently on the bench
  champions?: Champion[]; // All champions (board + bench)
  items?: Item[]; // Items in inventory
  economy?: Economy; // Player's economy information
  augments?: Augment[]; // Player's current augments
  augmentChoices?: Augment[]; // Available augment choices
  [key: string]: unknown; // Allow additional properties
}

/**
 * Team composition interface
 */
export interface TeamComp {
  id: string; // Unique identifier for the team composition
  name: string; // Name of the team composition
  units: Champion[]; // Units in the team composition
  traits: string[]; // Active traits in the team composition
  items: Item[]; // Recommended items for the team composition
  avgPlacement: number; // Average placement of the team composition
  playRate: number; // Play rate of the team composition
  winRate: number; // Win rate of the team composition
}

/**
 * Overlay settings interface
 */
export interface OverlaySettings {
  opacity: number; // Opacity of the overlay (0-1)
  position: ScreenPosition; // Position of the overlay
  visible: boolean; // Whether the overlay is visible
  alwaysOnTop?: boolean; // Whether the overlay is always on top
}

/**
 * Application settings interface
 */
export interface ApplicationSettings {
  launchOnStartup: boolean; // Whether to launch on system startup
  minimizeToTray: boolean; // Whether to minimize to system tray
  checkForUpdates?: boolean; // Whether to check for updates
}

/**
 * Data settings interface
 */
export interface DataSettings {
  source: string; // Data source (metatft, tactics, combined)
  refreshFrequency: string; // Data refresh frequency (startup, daily, manual)
  lastRefresh?: string; // Last refresh timestamp
}

/**
 * Developer settings interface
 */
export interface DeveloperSettings {
  enableDevTools: boolean; // Whether to enable dev tools
  logLevel: string; // Log level (debug, info, warn, error)
}

/**
 * Settings interface
 */
export interface Settings {
  overlay: OverlaySettings; // Overlay settings
  application: ApplicationSettings; // Application settings
  data: DataSettings; // Data settings
  developer?: DeveloperSettings; // Developer settings
}
