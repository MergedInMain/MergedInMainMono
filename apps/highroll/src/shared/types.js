/**
 * Type definitions for the application
 */

/**
 * @typedef {Object} GameState
 * @property {Array<Unit>} board - Units currently on the board
 * @property {Array<Unit>} bench - Units currently on the bench
 * @property {Array<Item>} items - Items in inventory
 * @property {Economy} economy - Player's economy information
 * @property {Array<Augment>} augments - Player's current augments
 * @property {Array<Augment>} augmentChoices - Available augment choices
 */

/**
 * @typedef {Object} Unit
 * @property {string} id - Unique identifier for the unit
 * @property {string} name - Name of the unit
 * @property {number} cost - Cost of the unit (1-5)
 * @property {number} star - Star level of the unit (1-3)
 * @property {Array<string>} traits - Traits of the unit
 * @property {Array<Item>} items - Items equipped on the unit
 * @property {Position} position - Position of the unit on the board
 */

/**
 * @typedef {Object} Item
 * @property {string} id - Unique identifier for the item
 * @property {string} name - Name of the item
 * @property {boolean} isComponent - Whether the item is a component
 * @property {Array<string>} components - Component items (if not a component)
 * @property {string} description - Description of the item
 */

/**
 * @typedef {Object} Economy
 * @property {number} gold - Current gold
 * @property {number} level - Current player level
 * @property {number} xp - Current player XP
 * @property {number} streak - Current win/loss streak
 */

/**
 * @typedef {Object} Augment
 * @property {string} id - Unique identifier for the augment
 * @property {string} name - Name of the augment
 * @property {string} description - Description of the augment
 * @property {string} tier - Tier of the augment (silver, gold, prismatic)
 */

/**
 * @typedef {Object} Position
 * @property {number} row - Row position (0-based)
 * @property {number} col - Column position (0-based)
 */

/**
 * @typedef {Object} TeamComp
 * @property {string} id - Unique identifier for the team composition
 * @property {string} name - Name of the team composition
 * @property {Array<Unit>} units - Units in the team composition
 * @property {Array<string>} traits - Active traits in the team composition
 * @property {Array<Item>} items - Recommended items for the team composition
 * @property {number} avgPlacement - Average placement of the team composition
 * @property {number} playRate - Play rate of the team composition
 * @property {number} winRate - Win rate of the team composition
 */

/**
 * @typedef {Object} Settings
 * @property {OverlaySettings} overlay - Overlay settings
 * @property {ApplicationSettings} application - Application settings
 * @property {DataSettings} data - Data settings
 */

/**
 * @typedef {Object} OverlaySettings
 * @property {number} opacity - Opacity of the overlay (0-1)
 * @property {Position} position - Position of the overlay
 * @property {boolean} visible - Whether the overlay is visible
 */

/**
 * @typedef {Object} ApplicationSettings
 * @property {boolean} launchOnStartup - Whether to launch on system startup
 * @property {boolean} minimizeToTray - Whether to minimize to system tray
 */

/**
 * @typedef {Object} DataSettings
 * @property {string} source - Data source (metatft, tactics, combined)
 * @property {string} refreshFrequency - Data refresh frequency (startup, daily, manual)
 */
