import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const EconomyTracker: React.FC = () => {
  const gameState = useSelector((state: RootState) => state.game.gameState);

  if (!gameState) {
    return (
      <div className="bg-gray-800 bg-opacity-50 p-4 rounded text-center">
        <p>Waiting for game data...</p>
        <p className="text-sm text-gray-400 mt-2">
          Press the capture button to analyze the current game state.
        </p>
      </div>
    );
  }

  const { gold, playerLevel, streak } = gameState;
  
  // Calculate interest thresholds
  const interestThresholds = [10, 20, 30, 40, 50];
  const currentInterest = Math.min(5, Math.floor(gold / 10));
  const nextInterestThreshold = interestThresholds.find(threshold => gold < threshold) || 50;
  
  // Calculate XP needed for next level
  const xpNeededForNextLevel = playerLevel >= 9 ? 0 : (playerLevel + 1) * 4;
  
  // Calculate roll chances for each cost tier based on player level
  const rollChances = getRollChancesByLevel(playerLevel);
  
  // Calculate streak bonus
  const streakBonus = getStreakBonus(streak);

  return (
    <div className="space-y-4">
      {/* Current Economy Status */}
      <div className="bg-gray-800 bg-opacity-70 rounded p-3">
        <h3 className="text-lg font-bold mb-2">Economy Status</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 rounded bg-gray-700">
            <div className="text-sm text-gray-400">Gold</div>
            <div className="text-2xl font-bold text-yellow-500">{gold}</div>
          </div>
          <div className="p-2 rounded bg-gray-700">
            <div className="text-sm text-gray-400">Interest</div>
            <div className="text-2xl font-bold text-blue-500">+{currentInterest}</div>
          </div>
          <div className="p-2 rounded bg-gray-700">
            <div className="text-sm text-gray-400">Level</div>
            <div className="text-2xl font-bold">{playerLevel}</div>
          </div>
          <div className="p-2 rounded bg-gray-700">
            <div className="text-sm text-gray-400">Streak Bonus</div>
            <div className="text-2xl font-bold text-green-500">+{streakBonus}</div>
          </div>
        </div>
      </div>

      {/* Interest Thresholds */}
      <div className="bg-gray-800 bg-opacity-70 rounded p-3">
        <h3 className="text-lg font-bold mb-2">Interest Thresholds</h3>
        <div className="relative h-6 bg-gray-700 rounded overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-blue-600"
            style={{ width: `${(gold / 50) * 100}%` }}
          ></div>
          {interestThresholds.map(threshold => (
            <div
              key={threshold}
              className="absolute top-0 h-full border-l border-gray-500"
              style={{ left: `${(threshold / 50) * 100}%` }}
            >
              <span className="absolute -top-6 -left-2 text-xs">{threshold}</span>
            </div>
          ))}
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-sm font-medium">
            {gold < 50 ? `${nextInterestThreshold - gold} gold to next interest` : 'Max interest'}
          </div>
        </div>
      </div>

      {/* Level Up Cost */}
      <div className="bg-gray-800 bg-opacity-70 rounded p-3">
        <h3 className="text-lg font-bold mb-2">Level Up</h3>
        {playerLevel < 9 ? (
          <div className="flex items-center">
            <div className="flex-1">
              <div className="text-sm">Level {playerLevel} → {playerLevel + 1}</div>
              <div className="text-xs text-gray-400">Cost: 4 XP</div>
            </div>
            <button className="px-3 py-1 bg-blue-600 rounded text-sm">
              Buy XP (4 gold)
            </button>
          </div>
        ) : (
          <div className="text-sm text-gray-400">
            Maximum level reached.
          </div>
        )}
      </div>

      {/* Roll Chances */}
      <div className="bg-gray-800 bg-opacity-70 rounded p-3">
        <h3 className="text-lg font-bold mb-2">Roll Chances</h3>
        <div className="grid grid-cols-5 gap-1">
          {Object.entries(rollChances).map(([cost, chance]) => (
            <div key={cost} className={`p-2 rounded bg-gray-700 text-center cost-${cost}`}>
              <div className="text-sm font-medium">{cost}★</div>
              <div className="text-lg font-bold">{chance}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Economy Tips */}
      <div className="bg-gray-800 bg-opacity-70 rounded p-3">
        <h3 className="text-lg font-bold mb-2">Economy Tips</h3>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Try to maintain at least 50 gold for maximum interest</li>
          <li>Consider rolling down at level 7 or 8 for key units</li>
          <li>Win/loss streaks provide bonus gold, avoid breaking them</li>
          <li>Each round of interest is worth more than a single unit upgrade</li>
          <li>Plan your economy around key power spikes (levels 6, 7, 8)</li>
        </ul>
      </div>
    </div>
  );
};

// Helper function to get roll chances by player level
const getRollChancesByLevel = (level: number): Record<number, number> => {
  const rollChances: Record<number, Record<number, number>> = {
    1: { 1: 100, 2: 0, 3: 0, 4: 0, 5: 0 },
    2: { 1: 100, 2: 0, 3: 0, 4: 0, 5: 0 },
    3: { 1: 75, 2: 25, 3: 0, 4: 0, 5: 0 },
    4: { 1: 55, 2: 30, 3: 15, 4: 0, 5: 0 },
    5: { 1: 45, 2: 33, 3: 20, 4: 2, 5: 0 },
    6: { 1: 35, 2: 35, 3: 25, 4: 5, 5: 0 },
    7: { 1: 22, 2: 35, 3: 30, 4: 12, 5: 1 },
    8: { 1: 15, 2: 25, 3: 35, 4: 20, 5: 5 },
    9: { 1: 10, 2: 15, 3: 30, 4: 30, 5: 15 },
  };
  
  return rollChances[Math.min(9, Math.max(1, level))];
};

// Helper function to get streak bonus
const getStreakBonus = (streak: number): number => {
  if (streak <= 1) return 0;
  if (streak === 2) return 1;
  if (streak === 3) return 2;
  if (streak === 4) return 3;
  return 4; // 5+ streak
};

export default EconomyTracker;
