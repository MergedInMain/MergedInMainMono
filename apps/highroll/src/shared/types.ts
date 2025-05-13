/**
 * Type definitions for the application
 */

export interface Position {
  row: number; // Row position (0-based)
  col: number; // Column position (0-based)
}

export interface Item {
  id: string; // Unique identifier for the item
  name: string; // Name of the item
  isComponent: boolean; // Whether the item is a component
  components: string[]; // Component items (if not a component)
  description: string; // Description of the item
}

export interface Unit {
  id: string; // Unique identifier for the unit
  name: string; // Name of the unit
  cost: number; // Cost of the unit (1-5)
  star: number; // Star level of the unit (1-3)
  traits: string[]; // Traits of the unit
  items: Item[]; // Items equipped on the unit
  position: Position; // Position of the unit on the board
}

export interface Economy {
  gold: number; // Current gold
  level: number; // Current player level
  xp: number; // Current player XP
  streak: number; // Current win/loss streak
}

export interface Augment {
  id: string; // Unique identifier for the augment
  name: string; // Name of the augment
  description: string; // Description of the augment
  tier: string; // Tier of the augment (silver, gold, prismatic)
}

export interface GameState {
  board: Unit[]; // Units currently on the board
  bench: Unit[]; // Units currently on the bench
  items: Item[]; // Items in inventory
  economy: Economy; // Player's economy information
  augments: Augment[]; // Player's current augments
  augmentChoices: Augment[]; // Available augment choices
}

export interface TeamComp {
  id: string; // Unique identifier for the team composition
  name: string; // Name of the team composition
  units: Unit[]; // Units in the team composition
  traits: string[]; // Active traits in the team composition
  items: Item[]; // Recommended items for the team composition
  avgPlacement: number; // Average placement of the team composition
  playRate: number; // Play rate of the team composition
  winRate: number; // Win rate of the team composition
}

export interface OverlaySettings {
  opacity: number; // Opacity of the overlay (0-1)
  position: Position; // Position of the overlay
  visible: boolean; // Whether the overlay is visible
}

export interface ApplicationSettings {
  launchOnStartup: boolean; // Whether to launch on system startup
  minimizeToTray: boolean; // Whether to minimize to system tray
}

export interface DataSettings {
  source: string; // Data source (metatft, tactics, combined)
  refreshFrequency: string; // Data refresh frequency (startup, daily, manual)
}

export interface Settings {
  overlay: OverlaySettings; // Overlay settings
  application: ApplicationSettings; // Application settings
  data: DataSettings; // Data settings
}
