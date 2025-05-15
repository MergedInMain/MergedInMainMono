import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setTeamComps, setLoading, setError } from '../store/recommendationsSlice';
import { analyzeGameState } from '../services/analyzer';
import { TeamComp, Unit } from '../../shared/types';

const TeamCompPanel: React.FC = () => {
  const dispatch = useDispatch();
  const gameState = useSelector((state: RootState) => state.game.gameState);
  const { teamComps, loading, error } = useSelector((state: RootState) => state.recommendations);
  const [selectedComp, setSelectedComp] = useState<TeamComp | null>(null);

  // Analyze game state when it changes
  useEffect(() => {
    const analyzeCurrentGameState = async () => {
      if (!gameState) return;

      dispatch(setLoading(true));
      try {
        const recommendations = await analyzeGameState(gameState);
        dispatch(setTeamComps(recommendations.teamComps));
        
        // Select the first comp by default
        if (recommendations.teamComps.length > 0) {
          setSelectedComp(recommendations.teamComps[0]);
        }
      } catch (err) {
        dispatch(setError((err as Error).message));
      } finally {
        dispatch(setLoading(false));
      }
    };

    analyzeCurrentGameState();
  }, [gameState, dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 bg-opacity-50 p-4 rounded">
        <h3 className="text-lg font-bold text-red-300">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

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

  if (teamComps.length === 0) {
    return (
      <div className="bg-gray-800 bg-opacity-50 p-4 rounded text-center">
        <p>No team compositions found.</p>
        <p className="text-sm text-gray-400 mt-2">
          Try capturing the screen again when you have more units on the board.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Team Comp Selection */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {teamComps.map((comp) => (
          <button
            key={comp.id}
            className={`px-3 py-2 rounded whitespace-nowrap ${
              selectedComp?.id === comp.id
                ? 'bg-blue-600'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            onClick={() => setSelectedComp(comp)}
          >
            {comp.name}
            <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-gray-800">
              {comp.tier}
            </span>
          </button>
        ))}
      </div>

      {/* Selected Comp Details */}
      {selectedComp && (
        <div className="bg-gray-800 bg-opacity-70 rounded p-3">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold">{selectedComp.name}</h3>
            <div className="flex space-x-2 text-xs">
              <span className="px-2 py-1 rounded bg-gray-700">
                Win: {(selectedComp.winRate * 100).toFixed(1)}%
              </span>
              <span className="px-2 py-1 rounded bg-gray-700">
                Avg Place: {selectedComp.placement.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Traits */}
          <div className="mb-3">
            <h4 className="text-sm font-semibold mb-1">Traits</h4>
            <div className="flex flex-wrap gap-1">
              {selectedComp.traits.map((trait: any) => (
                <span
                  key={trait.name}
                  className={`text-xs px-2 py-1 rounded bg-gray-700 trait-${trait.style.toLowerCase()}`}
                >
                  {trait.name} {trait.count}
                </span>
              ))}
            </div>
          </div>

          {/* Units */}
          <div>
            <h4 className="text-sm font-semibold mb-1">Units</h4>
            <div className="grid grid-cols-4 gap-2">
              {selectedComp.units.map((unit: any) => (
                <div
                  key={unit.name}
                  className={`p-2 rounded bg-gray-700 text-center cost-${unit.cost || 1}`}
                >
                  <div className="font-medium">{unit.name}</div>
                  {unit.items && unit.items.length > 0 && (
                    <div className="flex justify-center mt-1 space-x-1">
                      {unit.items.slice(0, 3).map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="w-4 h-4 rounded-full bg-yellow-600"
                          title={item.name}
                        ></div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Positioning (simplified) */}
          <div className="mt-3">
            <h4 className="text-sm font-semibold mb-1">Positioning</h4>
            <div className="grid grid-cols-7 gap-1 bg-gray-900 p-2 rounded">
              {Array.from({ length: 28 }).map((_, idx) => {
                const row = Math.floor(idx / 7);
                const col = idx % 7;
                const unit = selectedComp.units.find(
                  (u: any) => u.position?.row === row && u.position?.col === col
                );
                
                return (
                  <div
                    key={idx}
                    className={`aspect-square rounded ${
                      unit ? `bg-gray-700 cost-${unit.cost || 1}` : 'bg-gray-800'
                    }`}
                  >
                    {unit && (
                      <div className="text-xs text-center h-full flex items-center justify-center">
                        {unit.name.substring(0, 3)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamCompPanel;
