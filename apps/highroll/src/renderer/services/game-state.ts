import { GameState, Champion, Item, Augment } from '../../shared/types';
import { GAME_STATE_UPDATE_INTERVAL } from '../../shared/constants';
import championDetectionService from './champion-detection';
import itemDetectionService from './item-detection';
import gameStateTrackingService, { GameStage, GameEvent } from './game-state-tracking';
import gameStateManager, { StateChangeType } from './game-state-manager';

/**
 * Service for managing game state detection and updates
 */
class GameStateService {
  private intervalId: number | null = null;
  private isRunning = false;

  /**
   * Start the game state detection process
   */
  public async startDetection(): Promise<void> {
    if (this.isRunning) return;

    try {
      // Initialize services
      await Promise.all([
        championDetectionService.initialize(),
        itemDetectionService.initialize(),
        gameStateTrackingService.initialize(),
        gameStateManager.initialize()
      ]);

      console.log('All game state services initialized');

      this.isRunning = true;
      this.intervalId = window.setInterval(async () => {
        try {
          // Capture the screen
          const captureResult = await window.electron.captureScreen();

          if (captureResult.success && captureResult.data) {
            // Process the screen capture to extract game state
            const gameState = await this.processScreenCapture(captureResult.data);

            // Update the game state manager
            gameStateManager.updateState(gameState, 'detection');

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

      // Set up state change listener
      gameStateManager.addStateChangeListener((event) => {
        // Log state changes
        console.log(`Game state changed: ${event.type}`,
          event.changes ? Object.keys(event.changes).join(', ') : '');

        // If the state was manually updated, send it to the main process
        if (event.type === StateChangeType.MANUAL || event.type === StateChangeType.RESET) {
          if (event.state) {
            window.electron.updateGameState(event.state);
          }
        }
      });

    } catch (error) {
      console.error('Error starting game state detection:', error);
      window.electron.reportError(`Failed to start game state detection: ${error}`);
    }
  }

  /**
   * Stop the game state detection process
   */
  public stopDetection(): void {
    if (!this.isRunning || this.intervalId === null) return;

    window.clearInterval(this.intervalId);
    this.intervalId = null;
    this.isRunning = false;

    console.log('Game state detection stopped');
  }

  /**
   * Reset the game state
   */
  public resetState(): void {
    gameStateManager.resetState();
    console.log('Game state reset');
  }

  /**
   * Get the current game state
   * @returns Current game state or null if not initialized
   */
  public getCurrentState(): GameState | null {
    return gameStateManager.getCurrentState();
  }

  /**
   * Get the game state history
   * @returns Array of state change events
   */
  public getStateHistory() {
    return gameStateManager.getStateHistory();
  }

  /**
   * Undo the last state change
   * @returns Previous game state or null if no history
   */
  public undoStateChange(): GameState | null {
    return gameStateManager.undoStateChange();
  }

  /**
   * Manually update a specific property in the game state
   * @param property Property to update
   * @param value New value
   * @returns Updated game state
   */
  public updateStateProperty<K extends keyof GameState>(
    property: K,
    value: GameState[K]
  ): GameState | null {
    return gameStateManager.setStateProperty(property, value);
  }

  /**
   * Process a screen capture to extract game state
   * @param screenCapture Base64 encoded image
   * @returns Extracted game state
   */
  private async processScreenCapture(screenCapture: string): Promise<GameState> {
    try {
      // Initialize champion detection service if needed
      if (!championDetectionService.isInitialized) {
        await championDetectionService.initialize();
      }

      // Detect champions from the screen capture
      const detectionResult = await championDetectionService.detectChampions(screenCapture, {
        confidenceThreshold: 0.7,
        detectStarLevel: true,
        detectItems: true,
        region: 'all'
      });

      // Log detection results
      console.log(`Detected ${detectionResult.champions.length} champions with confidence ${detectionResult.confidence}`);
      console.log(`Processing time: ${detectionResult.processingTime}ms`);

      // Separate board and bench champions
      const boardChampions: Champion[] = detectionResult.champions.filter(
        champion => champion.position !== undefined
      );

      const benchChampions: Champion[] = detectionResult.champions.filter(
        champion => champion.position === undefined
      );

      // Detect items using the item detection service
      const itemDetectionResult = await itemDetectionService.detectItems(
        screenCapture,
        [...boardChampions, ...benchChampions],
        {
          confidenceThreshold: 0.7,
          detectOnChampions: true,
          detectInInventory: true,
          region: 'all'
        }
      );

      // Log item detection results
      console.log(`Detected ${itemDetectionResult.items.length} items with confidence ${itemDetectionResult.confidence}`);
      console.log(`Item processing time: ${itemDetectionResult.processingTime}ms`);
      console.log(`Inventory items: ${itemDetectionResult.inventoryItems.length}`);
      console.log(`Champions with items: ${itemDetectionResult.championItems.size}`);

      // Update champions with their detected items
      for (const [championId, championItems] of itemDetectionResult.championItems.entries()) {
        // Find the champion in our arrays
        const champion = [...boardChampions, ...benchChampions].find(c => c.id === championId);
        if (champion) {
          champion.items = championItems;
        }
      }

      // Track game state using the game state tracking service
      const trackingResult = await gameStateTrackingService.trackGameState(
        screenCapture,
        {
          confidenceThreshold: 0.7,
          detectGameStage: true,
          detectEvents: true
        }
      );

      // Log tracking results
      console.log(`Detected game stage: ${trackingResult.stage} (${trackingResult.gameStage})`);
      console.log(`Tracking processing time: ${trackingResult.processingTime}ms`);
      console.log(`Economy: Gold=${trackingResult.economy.gold}, Level=${trackingResult.economy.level}, Health=${trackingResult.economy.health}`);

      if (trackingResult.events.length > 0) {
        console.log(`Detected events: ${trackingResult.events.join(', ')}`);
      }

      // TODO: Implement detection for other game state elements
      // For now, use placeholder values for augments
      const augments: Augment[] = [];

      // Create the game state object
      const gameState: GameState = {
        stage: trackingResult.stage,
        health: trackingResult.economy.health,
        gold: trackingResult.economy.gold,
        level: trackingResult.economy.level,
        board: boardChampions,
        bench: benchChampions,
        champions: [...boardChampions, ...benchChampions],
        items: itemDetectionResult.inventoryItems,
        augments: augments,
        augmentChoices: [],
        economy: trackingResult.economy,
      };

      return gameState;
    } catch (error) {
      console.error('Error processing screen capture:', error);

      // Return a default game state in case of error
      return {
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
          streak: 0,
        },
      };
    }
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
