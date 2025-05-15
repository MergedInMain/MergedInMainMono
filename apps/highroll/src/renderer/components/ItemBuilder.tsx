import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setRecommendedItems, setLoading, setError } from '../store/recommendationsSlice';
import { analyzeGameState } from '../services/analyzer';
import { Item } from '../../shared/types';

const ItemBuilder: React.FC = () => {
  const dispatch = useDispatch();
  const gameState = useSelector((state: RootState) => state.game.gameState);
  const { recommendedItems, loading, error } = useSelector((state: RootState) => state.recommendations);
  const teamComps = useSelector((state: RootState) => state.recommendations.teamComps);

  // Analyze game state when it changes
  useEffect(() => {
    const analyzeCurrentGameState = async () => {
      if (!gameState) return;

      dispatch(setLoading(true));
      try {
        const recommendations = await analyzeGameState(gameState);
        dispatch(setRecommendedItems(recommendations.items));
      } catch (err) {
        dispatch(setError((err as Error).message));
      } finally {
        dispatch(setLoading(false));
      }
    };

    analyzeCurrentGameState();
  }, [gameState, dispatch]);

  // Group items by champion
  const itemsByChampion = recommendedItems.reduce((acc: Record<string, any[]>, item) => {
    const champion = item.champion || 'General';
    if (!acc[champion]) {
      acc[champion] = [];
    }
    acc[champion].push(item);
    return acc;
  }, {});

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

  // Current items inventory
  const currentItems = gameState.items || [];

  return (
    <div className="space-y-4">
      {/* Current Items */}
      <div className="bg-gray-800 bg-opacity-70 rounded p-3">
        <h3 className="text-lg font-bold mb-2">Current Items</h3>
        {currentItems.length > 0 ? (
          <div className="grid grid-cols-8 gap-2">
            {currentItems.map((item: Item, index: number) => (
              <div
                key={`${item.id}-${index}`}
                className="p-2 rounded bg-gray-700 text-center"
                title={item.name}
              >
                <div className="w-8 h-8 mx-auto rounded-full bg-yellow-600"></div>
                <div className="text-xs mt-1 truncate">{item.name}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No items detected.</p>
        )}
      </div>

      {/* Item Recommendations */}
      <div className="bg-gray-800 bg-opacity-70 rounded p-3">
        <h3 className="text-lg font-bold mb-2">Recommended Items</h3>
        
        {Object.keys(itemsByChampion).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(itemsByChampion).map(([champion, items]) => (
              <div key={champion} className="border-t border-gray-700 pt-2 first:border-0 first:pt-0">
                <h4 className="font-medium mb-1">{champion}</h4>
                <div className="grid grid-cols-4 gap-2">
                  {items.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="p-2 rounded bg-gray-700 text-center"
                      title={item.name}
                    >
                      <div className="w-8 h-8 mx-auto rounded-full bg-yellow-600"></div>
                      <div className="text-xs mt-1 truncate">{item.name}</div>
                      <div className="text-xs text-gray-400">
                        Priority: {item.priority}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            No item recommendations available. Try selecting a team composition first.
          </p>
        )}
      </div>

      {/* Item Combinations Guide */}
      <div className="bg-gray-800 bg-opacity-70 rounded p-3">
        <h3 className="text-lg font-bold mb-2">Item Combinations</h3>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 rounded bg-gray-700">
            <div className="flex items-center justify-center space-x-1">
              <div className="w-4 h-4 rounded-full bg-blue-600"></div>
              <span>+</span>
              <div className="w-4 h-4 rounded-full bg-red-600"></div>
              <span>=</span>
              <div className="w-4 h-4 rounded-full bg-purple-600"></div>
            </div>
            <div className="text-center mt-1">Giant Slayer</div>
          </div>
          <div className="p-2 rounded bg-gray-700">
            <div className="flex items-center justify-center space-x-1">
              <div className="w-4 h-4 rounded-full bg-blue-600"></div>
              <span>+</span>
              <div className="w-4 h-4 rounded-full bg-green-600"></div>
              <span>=</span>
              <div className="w-4 h-4 rounded-full bg-teal-600"></div>
            </div>
            <div className="text-center mt-1">Titan's Resolve</div>
          </div>
          <div className="p-2 rounded bg-gray-700">
            <div className="flex items-center justify-center space-x-1">
              <div className="w-4 h-4 rounded-full bg-red-600"></div>
              <span>+</span>
              <div className="w-4 h-4 rounded-full bg-green-600"></div>
              <span>=</span>
              <div className="w-4 h-4 rounded-full bg-yellow-600"></div>
            </div>
            <div className="text-center mt-1">Zeke's Herald</div>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Hover over items to see their names and effects.
        </p>
      </div>
    </div>
  );
};

export default ItemBuilder;
