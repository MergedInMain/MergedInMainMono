import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setRecommendedAugments, setLoading, setError } from '../store/recommendationsSlice';
import { analyzeGameState } from '../services/analyzer';
import { fetchAugments } from '../services/data-api';
import type { Augment, RecommendedAugment } from '../../shared/types';

// Define a union type for both augment types
type AugmentType = Augment | RecommendedAugment;

const AugmentAdvisor: React.FC = () => {
  const dispatch = useDispatch();
  const gameState = useSelector((state: RootState) => state.game.gameState);
  const { recommendedAugments, loading, error } = useSelector((state: RootState) => state.recommendations);
  const [allAugments, setAllAugments] = useState<Augment[]>([]);
  const [selectedAugment, setSelectedAugment] = useState<AugmentType | null>(null);

  // Fetch all augments from tactics.tools
  useEffect(() => {
    const getAllAugments = async () => {
      try {
        const response = await fetchAugments();
        if (response.success && response.data) {
          setAllAugments(response.data);
        }
      } catch (err) {
        console.error('Error fetching all augments:', err);
      }
    };

    getAllAugments();
  }, []);

  // Analyze game state when it changes
  useEffect(() => {
    const analyzeCurrentGameState = async () => {
      if (!gameState) return;

      dispatch(setLoading(true));
      try {
        const recommendations = await analyzeGameState(gameState);

        // Enhance augment data with details from allAugments
        const enhancedAugments = recommendations.augments.map(augment => {
          const fullAugmentData = allAugments.find(a => a.id === augment.id || a.name === augment.name);
          return {
            ...augment,
            description: fullAugmentData?.description || augment.description || '',
            synergies: fullAugmentData?.synergies || augment.synergies || [],
          };
        });

        dispatch(setRecommendedAugments(enhancedAugments));
      } catch (err) {
        dispatch(setError((err as Error).message));
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (allAugments.length > 0) {
      analyzeCurrentGameState();
    }
  }, [gameState, dispatch, allAugments]);

  // Group augments by tier
  const augmentsByTier = recommendedAugments.reduce((acc: Record<string, any[]>, augment) => {
    const tier = augment.tier || 'silver';
    if (!acc[tier]) {
      acc[tier] = [];
    }
    acc[tier].push(augment);
    return acc;
  }, {});

  // Handle augment selection for details view
  const handleAugmentClick = (augment: Augment | RecommendedAugment) => {
    setSelectedAugment(augment);
  };

  // Close augment details modal
  const closeAugmentDetails = () => {
    setSelectedAugment(null);
  };

  // Calculate synergy with current team composition
  const calculateSynergy = (augment: Augment | RecommendedAugment) => {
    if (!gameState || !augment.synergies || augment.synergies.length === 0) {
      return 0;
    }

    let synergyScore = 0;
    const currentTraits = gameState.traits || [];
    const currentUnits = gameState.units || [];

    // Check trait synergies
    augment.synergies.forEach((synergy: string) => {
      const matchingTrait = currentTraits.find(trait => trait.name === synergy);
      if (matchingTrait && matchingTrait.active) {
        synergyScore += 2;
      }
    });

    // Check unit synergies (if any augment specifically synergizes with a unit)
    currentUnits.forEach(unit => {
      if (augment.synergies && augment.synergies.includes(unit.name)) {
        synergyScore += 1;
      }
    });

    return Math.min(5, synergyScore); // Cap at 5
  };

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

  // Current augments
  const currentAugments = gameState.augments || [];

  return (
    <div className="space-y-4">
      {/* Current Augments */}
      <div className="bg-gray-800 bg-opacity-70 rounded p-3">
        <h3 className="text-lg font-bold mb-2">Current Augments</h3>
        {currentAugments.length > 0 ? (
          <div className="space-y-2">
            {currentAugments.map((augment: Augment) => (
              <div
                key={augment.id}
                className={`p-2 rounded bg-gray-700 border-l-4 augment-${augment.tier.toLowerCase()} cursor-pointer hover:bg-gray-600`}
                onClick={() => handleAugmentClick(augment)}
              >
                <div className="font-medium">{augment.name}</div>
                <div className="text-sm text-gray-400">{augment.description}</div>
                {augment.synergies && augment.synergies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {augment.synergies.map((synergy: string, index: number) => (
                      <span key={index} className="text-xs px-1 py-0.5 bg-gray-600 rounded">
                        {synergy}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No augments detected.</p>
        )}
      </div>

      {/* Augment Recommendations */}
      <div className="bg-gray-800 bg-opacity-70 rounded p-3">
        <h3 className="text-lg font-bold mb-2">Recommended Augments</h3>
        <p className="text-sm text-gray-400 mb-2">
          Based on data from <a href="https://tactics.tools/team-compositions" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">tactics.tools</a>
        </p>

        {Object.keys(augmentsByTier).length > 0 ? (
          <div className="space-y-3">
            {['prismatic', 'gold', 'silver'].map((tier) => {
              if (!augmentsByTier[tier]) return null;

              return (
                <div key={tier} className="border-t border-gray-700 pt-2 first:border-0 first:pt-0">
                  <h4 className={`font-medium mb-1 augment-${tier}`}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1)} Augments
                  </h4>
                  <div className="space-y-2">
                    {augmentsByTier[tier].map((augment) => {
                      const synergyScore = calculateSynergy(augment);
                      return (
                        <div
                          key={augment.id}
                          className={`p-2 rounded bg-gray-700 border-l-4 augment-${tier} cursor-pointer hover:bg-gray-600`}
                          onClick={() => handleAugmentClick(augment)}
                        >
                          <div className="flex justify-between">
                            <div className="font-medium">{augment.name}</div>
                            <div className="flex items-center space-x-2">
                              <div className="text-xs px-2 py-0.5 bg-gray-600 rounded">
                                Synergy: {synergyScore}/5
                              </div>
                              <div className="text-xs px-2 py-0.5 bg-gray-600 rounded">
                                Priority: {augment.priority}
                              </div>
                            </div>
                          </div>
                          {augment.description && (
                            <div className="text-sm text-gray-400 mt-1">{augment.description}</div>
                          )}
                          {augment.synergies && augment.synergies.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {augment.synergies.map((synergy: string, index: number) => (
                                <span key={index} className="text-xs px-1 py-0.5 bg-gray-600 rounded">
                                  {synergy}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            No augment recommendations available. Try selecting a team composition first.
          </p>
        )}
      </div>

      {/* Augment Selection Tips */}
      <div className="bg-gray-800 bg-opacity-70 rounded p-3">
        <h3 className="text-lg font-bold mb-2">Augment Selection Tips</h3>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Choose augments that synergize with your current or planned team composition</li>
          <li>Prismatic (purple) augments are the strongest but may require specific team builds</li>
          <li>Consider augments that boost your economy if you're planning to roll heavily</li>
          <li>Trait augments are most valuable when you're already running that trait</li>
          <li>Some augments become stronger in the late game, while others help with early game</li>
          <li>Check <a href="https://tactics.tools/augments" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">tactics.tools/augments</a> for the latest augment statistics</li>
        </ul>
      </div>

      {/* Augment Details Modal */}
      {selectedAugment && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-gray-800 rounded-lg p-4 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold augment-${selectedAugment.tier}`}>{selectedAugment.name}</h3>
              <button
                onClick={closeAugmentDetails}
                className="text-gray-400 hover:text-white"
              >
                ✖️
              </button>
            </div>
            <div className={`border-l-4 augment-${selectedAugment.tier} pl-3 py-1 mb-3`}>
              <div className="text-sm">{selectedAugment.description}</div>
            </div>
            {selectedAugment.synergies && selectedAugment.synergies.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-semibold mb-1">Synergizes with:</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedAugment.synergies.map((synergy: string, index: number) => (
                    <span key={index} className="text-xs px-2 py-1 bg-gray-700 rounded">
                      {synergy}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-400">
              <div>Tier: {selectedAugment.tier}</div>
              <div>
                {'priority' in selectedAugment ? `Priority: ${selectedAugment.priority}/5` : ''}
              </div>
            </div>
            <div className="mt-4 text-center">
              <a
                href={`https://tactics.tools/augment/${selectedAugment.name.replace(/\s+/g, '-').toLowerCase()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline text-sm"
              >
                View detailed stats on tactics.tools
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AugmentAdvisor;
