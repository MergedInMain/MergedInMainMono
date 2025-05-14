/**
 * Game State Manager Service
 * 
 * Provides centralized state management for the TFT overlay application.
 * Handles state changes, history tracking, and error recovery.
 */

import { GameState, Champion, Item, Augment } from '../../shared/types';
import { GameStage, GameEvent } from './game-state-tracking';

/**
 * State change event types
 */
export enum StateChangeType {
  INITIAL = 'initial',
  UPDATE = 'update',
  RESET = 'reset',
  ERROR = 'error',
  MANUAL = 'manual'
}

/**
 * State change event interface
 */
export interface StateChangeEvent {
  type: StateChangeType;
  timestamp: number;
  state: GameState;
  previousState?: GameState;
  source?: string;
  changes?: Partial<Record<keyof GameState, boolean>>;
}

/**
 * State validation result interface
 */
interface StateValidationResult {
  isValid: boolean;
  errors: string[];
  correctedState?: GameState;
}

/**
 * Game state manager options
 */
interface GameStateManagerOptions {
  maxHistorySize?: number;
  enableValidation?: boolean;
  autoCorrectErrors?: boolean;
  persistState?: boolean;
}

/**
 * Default manager options
 */
const DEFAULT_OPTIONS: GameStateManagerOptions = {
  maxHistorySize: 50,
  enableValidation: true,
  autoCorrectErrors: true,
  persistState: true
};

/**
 * Type for state change listeners
 */
type StateChangeListener = (event: StateChangeEvent) => void;

/**
 * Service for managing game state
 */
class GameStateManager {
  private currentState: GameState | null = null;
  private stateHistory: StateChangeEvent[] = [];
  private listeners: StateChangeListener[] = [];
  private options: GameStateManagerOptions;
  private isInitialized: boolean = false;

  constructor(options: GameStateManagerOptions = DEFAULT_OPTIONS) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Initialize the game state manager
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      // Load persisted state if enabled
      if (this.options.persistState) {
        await this.loadPersistedState();
      }
      
      this.isInitialized = true;
      console.log('Game state manager initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize game state manager:', error);
      return false;
    }
  }

  /**
   * Get the current game state
   * @returns Current game state or null if not initialized
   */
  public getCurrentState(): GameState | null {
    return this.currentState;
  }

  /**
   * Update the game state
   * @param newState New game state
   * @param source Source of the update
   * @returns Updated game state
   */
  public updateState(newState: GameState, source: string = 'detection'): GameState {
    // Validate the new state if validation is enabled
    if (this.options.enableValidation) {
      const validationResult = this.validateState(newState);
      
      if (!validationResult.isValid) {
        console.warn(`Invalid game state detected: ${validationResult.errors.join(', ')}`);
        
        // Auto-correct errors if enabled
        if (this.options.autoCorrectErrors && validationResult.correctedState) {
          newState = validationResult.correctedState;
          console.log('Game state auto-corrected');
        }
      }
    }
    
    // Detect changes between current and new state
    const changes = this.detectStateChanges(this.currentState, newState);
    
    // Create state change event
    const event: StateChangeEvent = {
      type: this.currentState ? StateChangeType.UPDATE : StateChangeType.INITIAL,
      timestamp: Date.now(),
      state: { ...newState }, // Clone to prevent mutations
      previousState: this.currentState ? { ...this.currentState } : undefined,
      source,
      changes
    };
    
    // Update current state
    this.currentState = { ...newState };
    
    // Add to history
    this.addToHistory(event);
    
    // Notify listeners
    this.notifyListeners(event);
    
    // Persist state if enabled
    if (this.options.persistState) {
      this.persistState();
    }
    
    return this.currentState;
  }

  /**
   * Reset the game state
   * @returns Empty game state
   */
  public resetState(): GameState {
    // Create empty game state
    const emptyState: GameState = {
      stage: '1-1',
      health: 100,
      gold: 0,
      level: 1,
      board: [],
      bench: [],
      champions: [],
      items: [],
      augments: [],
      augmentChoices: [],
      economy: {
        gold: 0,
        level: 1,
        health: 100,
        xp: 0,
        streak: 0
      }
    };
    
    // Create state change event
    const event: StateChangeEvent = {
      type: StateChangeType.RESET,
      timestamp: Date.now(),
      state: emptyState,
      previousState: this.currentState ? { ...this.currentState } : undefined,
      source: 'manual'
    };
    
    // Update current state
    this.currentState = emptyState;
    
    // Add to history
    this.addToHistory(event);
    
    // Notify listeners
    this.notifyListeners(event);
    
    // Persist state if enabled
    if (this.options.persistState) {
      this.persistState();
    }
    
    return this.currentState;
  }

  /**
   * Manually set a specific property in the game state
   * @param property Property to update
   * @param value New value
   * @returns Updated game state
   */
  public setStateProperty<K extends keyof GameState>(
    property: K,
    value: GameState[K]
  ): GameState | null {
    if (!this.currentState) {
      console.warn('Cannot set property on null state');
      return null;
    }
    
    // Create updated state
    const updatedState = {
      ...this.currentState,
      [property]: value
    };
    
    // Create state change event
    const event: StateChangeEvent = {
      type: StateChangeType.MANUAL,
      timestamp: Date.now(),
      state: updatedState,
      previousState: { ...this.currentState },
      source: 'manual',
      changes: { [property]: true } as Partial<Record<keyof GameState, boolean>>
    };
    
    // Update current state
    this.currentState = updatedState;
    
    // Add to history
    this.addToHistory(event);
    
    // Notify listeners
    this.notifyListeners(event);
    
    // Persist state if enabled
    if (this.options.persistState) {
      this.persistState();
    }
    
    return this.currentState;
  }

  /**
   * Undo the last state change
   * @returns Previous game state or null if no history
   */
  public undoStateChange(): GameState | null {
    // Check if we have history to undo
    if (this.stateHistory.length <= 1) {
      console.warn('No state changes to undo');
      return this.currentState;
    }
    
    // Remove the most recent event
    this.stateHistory.shift();
    
    // Get the previous event
    const previousEvent = this.stateHistory[0];
    
    if (!previousEvent) {
      return this.currentState;
    }
    
    // Update current state to previous state
    this.currentState = { ...previousEvent.state };
    
    // Create state change event
    const event: StateChangeEvent = {
      type: StateChangeType.MANUAL,
      timestamp: Date.now(),
      state: this.currentState,
      source: 'undo'
    };
    
    // Notify listeners
    this.notifyListeners(event);
    
    // Persist state if enabled
    if (this.options.persistState) {
      this.persistState();
    }
    
    return this.currentState;
  }

  /**
   * Get the state history
   * @returns Array of state change events
   */
  public getStateHistory(): StateChangeEvent[] {
    return [...this.stateHistory];
  }

  /**
   * Add a state change listener
   * @param listener Function to call when state changes
   * @returns Function to remove the listener
   */
  public addStateChangeListener(listener: StateChangeListener): () => void {
    this.listeners.push(listener);
    
    // Return function to remove the listener
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Validate a game state
   * @param state Game state to validate
   * @returns Validation result
   */
  private validateState(state: GameState): StateValidationResult {
    const errors: string[] = [];
    let correctedState: GameState | undefined;
    
    // Check for required properties
    if (!state.stage) {
      errors.push('Missing stage');
    }
    
    if (state.health === undefined) {
      errors.push('Missing health');
    } else if (state.health < 0 || state.health > 100) {
      errors.push(`Invalid health value: ${state.health}`);
      
      // Auto-correct health
      if (!correctedState) correctedState = { ...state };
      correctedState.health = Math.max(0, Math.min(100, state.health));
    }
    
    if (state.gold === undefined) {
      errors.push('Missing gold');
    } else if (state.gold < 0) {
      errors.push(`Invalid gold value: ${state.gold}`);
      
      // Auto-correct gold
      if (!correctedState) correctedState = { ...state };
      correctedState.gold = Math.max(0, state.gold);
    }
    
    if (state.level === undefined) {
      errors.push('Missing level');
    } else if (state.level < 1 || state.level > 9) {
      errors.push(`Invalid level value: ${state.level}`);
      
      // Auto-correct level
      if (!correctedState) correctedState = { ...state };
      correctedState.level = Math.max(1, Math.min(9, state.level));
    }
    
    // Check economy object
    if (!state.economy) {
      errors.push('Missing economy');
    } else {
      if (state.economy.gold === undefined) {
        errors.push('Missing economy.gold');
      } else if (state.economy.gold < 0) {
        errors.push(`Invalid economy.gold value: ${state.economy.gold}`);
        
        // Auto-correct economy.gold
        if (!correctedState) correctedState = { ...state };
        if (!correctedState.economy) correctedState.economy = { ...state.economy };
        correctedState.economy.gold = Math.max(0, state.economy.gold);
      }
      
      if (state.economy.level === undefined) {
        errors.push('Missing economy.level');
      } else if (state.economy.level < 1 || state.economy.level > 9) {
        errors.push(`Invalid economy.level value: ${state.economy.level}`);
        
        // Auto-correct economy.level
        if (!correctedState) correctedState = { ...state };
        if (!correctedState.economy) correctedState.economy = { ...state.economy };
        correctedState.economy.level = Math.max(1, Math.min(9, state.economy.level));
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      correctedState
    };
  }

  /**
   * Detect changes between two game states
   * @param oldState Previous game state
   * @param newState New game state
   * @returns Object with changed properties
   */
  private detectStateChanges(
    oldState: GameState | null,
    newState: GameState
  ): Partial<Record<keyof GameState, boolean>> {
    const changes: Partial<Record<keyof GameState, boolean>> = {};
    
    // If no old state, everything is changed
    if (!oldState) {
      Object.keys(newState).forEach(key => {
        changes[key as keyof GameState] = true;
      });
      return changes;
    }
    
    // Check primitive properties
    if (oldState.stage !== newState.stage) changes.stage = true;
    if (oldState.health !== newState.health) changes.health = true;
    if (oldState.gold !== newState.gold) changes.gold = true;
    if (oldState.level !== newState.level) changes.level = true;
    
    // Check economy
    if (oldState.economy?.gold !== newState.economy?.gold ||
        oldState.economy?.level !== newState.economy?.level ||
        oldState.economy?.health !== newState.economy?.health ||
        oldState.economy?.xp !== newState.economy?.xp ||
        oldState.economy?.streak !== newState.economy?.streak) {
      changes.economy = true;
    }
    
    // Check arrays (simple length check for now)
    if ((oldState.board?.length || 0) !== (newState.board?.length || 0)) changes.board = true;
    if ((oldState.bench?.length || 0) !== (newState.bench?.length || 0)) changes.bench = true;
    if ((oldState.champions?.length || 0) !== (newState.champions?.length || 0)) changes.champions = true;
    if ((oldState.items?.length || 0) !== (newState.items?.length || 0)) changes.items = true;
    if ((oldState.augments?.length || 0) !== (newState.augments?.length || 0)) changes.augments = true;
    if ((oldState.augmentChoices?.length || 0) !== (newState.augmentChoices?.length || 0)) changes.augmentChoices = true;
    
    return changes;
  }

  /**
   * Add a state change event to the history
   * @param event State change event
   */
  private addToHistory(event: StateChangeEvent): void {
    // Add to the beginning of the array (most recent first)
    this.stateHistory.unshift(event);
    
    // Limit history size
    if (this.options.maxHistorySize && this.stateHistory.length > this.options.maxHistorySize) {
      this.stateHistory = this.stateHistory.slice(0, this.options.maxHistorySize);
    }
  }

  /**
   * Notify all listeners of a state change
   * @param event State change event
   */
  private notifyListeners(event: StateChangeEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in state change listener:', error);
      }
    });
  }

  /**
   * Persist the current state to local storage
   */
  private persistState(): void {
    try {
      if (this.currentState) {
        localStorage.setItem('highroll_game_state', JSON.stringify(this.currentState));
        localStorage.setItem('highroll_state_timestamp', Date.now().toString());
      }
    } catch (error) {
      console.error('Error persisting game state:', error);
    }
  }

  /**
   * Load persisted state from local storage
   */
  private async loadPersistedState(): Promise<void> {
    try {
      const stateJson = localStorage.getItem('highroll_game_state');
      const timestamp = localStorage.getItem('highroll_state_timestamp');
      
      if (stateJson && timestamp) {
        const state = JSON.parse(stateJson) as GameState;
        const timestampValue = parseInt(timestamp, 10);
        
        // Check if the state is recent (within the last hour)
        const isRecent = Date.now() - timestampValue < 60 * 60 * 1000;
        
        if (isRecent) {
          // Create state change event
          const event: StateChangeEvent = {
            type: StateChangeType.INITIAL,
            timestamp: timestampValue,
            state,
            source: 'persistence'
          };
          
          // Update current state
          this.currentState = state;
          
          // Add to history
          this.addToHistory(event);
          
          console.log('Loaded persisted game state');
        } else {
          console.log('Persisted game state is too old, not loading');
        }
      }
    } catch (error) {
      console.error('Error loading persisted game state:', error);
    }
  }

  /**
   * Get a mock game state for testing
   * @returns Mock game state
   */
  public getMockState(): GameState {
    return {
      stage: '3-2',
      health: 76,
      gold: 32,
      level: 6,
      board: [
        { id: 'TFT9_Ahri', name: 'Ahri', cost: 4, stars: 2, traits: ['Spirit', 'Mage'] },
        { id: 'TFT9_Lux', name: 'Lux', cost: 3, stars: 2, traits: ['Dawnbringer', 'Mystic'] }
      ],
      bench: [
        { id: 'TFT9_Viego', name: 'Viego', cost: 5, stars: 1, traits: ['Forgotten', 'Assassin'] },
        { id: 'TFT9_Karma', name: 'Karma', cost: 4, stars: 1, traits: ['Dawnbringer', 'Invoker'] }
      ],
      champions: [
        { id: 'TFT9_Ahri', name: 'Ahri', cost: 4, stars: 2, traits: ['Spirit', 'Mage'] },
        { id: 'TFT9_Lux', name: 'Lux', cost: 3, stars: 2, traits: ['Dawnbringer', 'Mystic'] },
        { id: 'TFT9_Viego', name: 'Viego', cost: 5, stars: 1, traits: ['Forgotten', 'Assassin'] },
        { id: 'TFT9_Karma', name: 'Karma', cost: 4, stars: 1, traits: ['Dawnbringer', 'Invoker'] }
      ],
      items: [
        { id: 'TFT_Item_BFSword', name: 'B.F. Sword', isComponent: true },
        { id: 'TFT_Item_RecurveBow', name: 'Recurve Bow', isComponent: true }
      ],
      augments: [
        { id: 'TFT9_Augment_CombatTraining', name: 'Combat Training', tier: 1 }
      ],
      augmentChoices: [],
      economy: {
        gold: 32,
        level: 6,
        health: 76,
        xp: 24,
        streak: 2
      }
    };
  }
}

export default new GameStateManager();
