import { analyzeGameState } from '../src/renderer/services/analyzer';
import { fetchTeamComps } from '../src/renderer/services/data-api';
import { GameState } from '../src/shared/types';

// Mock data-api
jest.mock('../src/renderer/services/data-api', () => ({
  fetchTeamComps: jest.fn(),
  fetchItems: jest.fn(),
  fetchAugments: jest.fn(),
}));

describe('Recommendation Engine', () => {
  const mockGameState: GameState = {
    stage: 'planning',
    playerLevel: 7,
    playerHealth: 80,
    gold: 50,
    streak: 2,
    units: [
      {
        id: 'TFT9_Ahri',
        name: 'Ahri',
        cost: 4,
        tier: 2,
        items: [
          { id: 'TFT_Item_Deathcap', name: 'Rabadon\'s Deathcap', type: 'combined' },
        ],
        traits: ['Spirit', 'Sorcerer'],
      },
    ],
    bench: [],
    items: [],
    augments: [],
    traits: [
      { id: 'Spirit', name: 'Spirit', count: 2, active: true, style: 'bronze' },
      { id: 'Sorcerer', name: 'Sorcerer', count: 1, active: false, style: 'none' },
    ],
  };

  const mockTeamComps = [
    {
      id: 'comp1',
      name: 'Spirit Sorcerers',
      tier: 'S',
      units: [
        { name: 'Ahri', cost: 4, priority: 1 },
        { name: 'Yuumi', cost: 3, priority: 2 },
      ],
      traits: [
        { name: 'Spirit', count: 4, style: 'gold' },
        { name: 'Sorcerer', count: 4, style: 'gold' },
      ],
      augments: [
        { name: 'Spirit Heart', tier: 'silver' },
        { name: 'Spell Sword', tier: 'gold' },
      ],
      items: [],
      placement: 3.2,
      winRate: 0.15,
      playRate: 0.08,
      difficulty: 3,
    },
    {
      id: 'comp2',
      name: 'Duelists',
      tier: 'A',
      units: [
        { name: 'Fiora', cost: 1, priority: 1 },
        { name: 'Yasuo', cost: 4, priority: 2 },
      ],
      traits: [
        { name: 'Duelist', count: 6, style: 'gold' },
      ],
      augments: [
        { name: 'Duelist Heart', tier: 'silver' },
      ],
      items: [],
      placement: 3.8,
      winRate: 0.12,
      playRate: 0.06,
      difficulty: 2,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (fetchTeamComps as jest.Mock).mockResolvedValue({
      success: true,
      data: mockTeamComps,
    });
  });

  test('analyzeGameState should return recommendations based on current game state', async () => {
    const recommendations = await analyzeGameState(mockGameState);

    expect(fetchTeamComps).toHaveBeenCalled();
    expect(recommendations).toHaveProperty('teamComps');
    expect(recommendations).toHaveProperty('items');
    expect(recommendations).toHaveProperty('augments');
    
    // Spirit Sorcerers should be ranked higher due to having Ahri
    expect(recommendations.teamComps[0].name).toBe('Spirit Sorcerers');
  });

  test('analyzeGameState should handle API errors gracefully', async () => {
    (fetchTeamComps as jest.Mock).mockResolvedValue({
      success: false,
      error: 'API error',
    });

    const recommendations = await analyzeGameState(mockGameState);

    expect(fetchTeamComps).toHaveBeenCalled();
    expect(recommendations.teamComps).toEqual([]);
    expect(recommendations.items).toEqual([]);
    expect(recommendations.augments).toEqual([]);
  });
});
