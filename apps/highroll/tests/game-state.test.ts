import { captureAndAnalyzeScreen, cleanup } from '../src/renderer/services/game-state';
import { GameState } from '../src/shared/types';

// Mock Electron's ipcRenderer
jest.mock('electron', () => ({
  ipcRenderer: {
    invoke: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
  },
}));

// Mock Tesseract.js
jest.mock('tesseract.js', () => ({
  createWorker: jest.fn().mockResolvedValue({
    recognize: jest.fn().mockResolvedValue({
      data: { text: '50' },
    }),
    terminate: jest.fn(),
  }),
}));

describe('Game State Detection', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await cleanup();
  });

  test('captureAndAnalyzeScreen should return game state on successful capture', async () => {
    // Mock successful screen capture
    const { ipcRenderer } = require('electron');
    ipcRenderer.invoke.mockResolvedValue({
      success: true,
      imagePath: '/path/to/image.png',
    });

    const gameState = await captureAndAnalyzeScreen();

    expect(ipcRenderer.invoke).toHaveBeenCalledWith('capture-screen');
    expect(gameState).not.toBeNull();
    expect(gameState).toHaveProperty('stage');
    expect(gameState).toHaveProperty('playerLevel');
    expect(gameState).toHaveProperty('gold');
  });

  test('captureAndAnalyzeScreen should return null on failed capture', async () => {
    // Mock failed screen capture
    const { ipcRenderer } = require('electron');
    ipcRenderer.invoke.mockResolvedValue({
      success: false,
      error: 'Screen capture failed',
    });

    const gameState = await captureAndAnalyzeScreen();

    expect(ipcRenderer.invoke).toHaveBeenCalledWith('capture-screen');
    expect(gameState).toBeNull();
  });
});
