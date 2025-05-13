import { GameState, Champion, Item, Augment } from '../../shared/types';
import { GAME_STATE_UPDATE_INTERVAL } from '../../shared/constants';

/**
 * Service for managing game state detection and updates
 */
class GameStateService {
  private intervalId: number | null = null;
  private isRunning = false;

  /**
   * Start the game state detection process
   */
  public startDetection(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.intervalId = window.setInterval(async () => {
      try {
        // Capture the screen
        const captureResult = await window.electron.captureScreen();

        if (captureResult.success && captureResult.data) {
          // Process the screen capture to extract game state
          const gameState = await this.processScreenCapture(captureResult.data);

          // Send the game state to the main process
          window.electron.updateGameState(gameState);
        } else {
          console.warn('Screen capture failed:', captureResult.message);
        }
      } catch (error) {
        console.error('Error detecting game state:', error);
        window.electron.reportError(`Game state detection error: ${error}`);
      }
    }, GAME_STATE_UPDATE_INTERVAL);
  }

  /**
   * Stop the game state detection process
   */
  public stopDetection(): void {
    if (!this.isRunning || this.intervalId === null) return;

    window.clearInterval(this.intervalId);
    this.intervalId = null;
    this.isRunning = false;
  }

  /**
   * Process a screen capture to extract game state
   * @param screenCapture Base64 encoded image
   * @returns Extracted game state
   */
  private async processScreenCapture(screenCapture: string): Promise<GameState> {
    // TODO: Implement image processing to extract game state
    // This is a placeholder implementation

    // Create empty arrays for champions on board and bench
    const boardChampions: Champion[] = [];
    const benchChampions: Champion[] = [];

    // Create empty arrays for items and augments
    const items: Item[] = [];
    const augments: Augment[] = [];

    // Create a placeholder game state
    const gameState: GameState = {
      stage: '1-1',
      health: 100,
      gold: 0,
      level: 1,
      board: boardChampions,
      bench: benchChampions,
      champions: [...boardChampions, ...benchChampions],
      items: items,
      augments: augments,
      augmentChoices: [],
      economy: {
        gold: 0,
        level: 1,
        health: 100,
        xp: 0,
        streak: 0,
      },
    };

    return gameState;
  }

  /**
   * Get a mock game state for testing
   * @returns Mock game state
   */
  public getMockGameState(): GameState {
    // Create some mock champions
    const boardChampions: Champion[] = [
      { id: 'TFT9_Ahri', name: 'Ahri', cost: 4, stars: 2, traits: ['Spirit', 'Mage'] },
      { id: 'TFT9_Lux', name: 'Lux', cost: 3, stars: 2, traits: ['Dawnbringer', 'Mystic'] },
    ];

    const benchChampions: Champion[] = [
      { id: 'TFT9_Viego', name: 'Viego', cost: 5, stars: 1, traits: ['Forgotten', 'Assassin'] },
      { id: 'TFT9_Karma', name: 'Karma', cost: 4, stars: 1, traits: ['Dawnbringer', 'Invoker'] },
    ];

    // Create some mock items
    const items: Item[] = [
      { id: 'TFT_Item_RabadonsDeathcap', name: 'Rabadon\'s Deathcap' },
      { id: 'TFT_Item_SpearOfShojin', name: 'Spear of Shojin' },
    ];

    // Create some mock augments
    const augments: Augment[] = [
      { id: 'TFT9_Augment_CombatTraining', name: 'Combat Training', tier: 1 },
    ];

    // Create a mock game state
    const gameState: GameState = {
      stage: '3-2',
      health: 76,
      gold: 32,
      level: 6,
      board: boardChampions,
      bench: benchChampions,
      champions: [...boardChampions, ...benchChampions],
      items: items,
      augments: augments,
      augmentChoices: [],
      economy: {
        gold: 32,
        level: 6,
        health: 76,
        xp: 24,
        streak: 2,
      },
    };

    return gameState;
  }
}

export default new GameStateService();
