import { GameState, TeamComp, RecommendedItem, RecommendedAugment, Unit, Item, Augment } from '../../shared/types';
import { fetchTeamComps, fetchItems, fetchAugments } from './data-api';

// Analyze the current game state and recommend team compositions
export const analyzeGameState = async (gameState: GameState): Promise<{
  teamComps: TeamComp[];
  items: RecommendedItem[];
  augments: RecommendedAugment[];
}> => {
  try {
    // Fetch team compositions data
    const teamCompsResponse = await fetchTeamComps();
    
    if (!teamCompsResponse.success || !teamCompsResponse.data) {
      throw new Error('Failed to fetch team compositions data');
    }
    
    const teamComps = teamCompsResponse.data;
    
    // Calculate similarity scores for each team composition
    const scoredComps = calculateSimilarityScores(gameState, teamComps);
    
    // Get top recommended team compositions
    const recommendedComps = scoredComps.slice(0, 3);
    
    // Get recommended items based on current units and recommended comps
    const recommendedItems = recommendItems(gameState, recommendedComps);
    
    // Get recommended augments based on current units and recommended comps
    const recommendedAugments = recommendAugments(gameState, recommendedComps);
    
    return {
      teamComps: recommendedComps,
      items: recommendedItems,
      augments: recommendedAugments,
    };
  } catch (error) {
    console.error('Error analyzing game state:', error);
    return {
      teamComps: [],
      items: [],
      augments: [],
    };
  }
};

// Calculate similarity scores between current game state and potential team compositions
const calculateSimilarityScores = (gameState: GameState, teamComps: TeamComp[]): TeamComp[] => {
  // This function calculates how similar the current board is to each potential team comp
  // Factors to consider:
  // 1. Units already on board
  // 2. Traits already activated
  // 3. Items already built
  // 4. Player level and gold (for feasibility)
  
  const scoredComps = teamComps.map(comp => {
    let score = 0;
    
    // Score based on units already on board
    score += calculateUnitScore(gameState.units, comp.units);
    
    // Score based on traits already activated
    score += calculateTraitScore(gameState.traits, comp.traits);
    
    // Score based on items already built
    score += calculateItemScore(gameState.units, comp.units);
    
    // Score based on feasibility (player level, gold)
    score += calculateFeasibilityScore(gameState, comp);
    
    // Return the comp with its score
    return {
      ...comp,
      similarityScore: score,
    };
  });
  
  // Sort by similarity score (highest first)
  return scoredComps
    .sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0));
};

// Calculate score based on units already on board
const calculateUnitScore = (currentUnits: Unit[], compUnits: any[]): number => {
  let score = 0;
  
  // For each unit in the comp, check if it's already on the board
  compUnits.forEach(compUnit => {
    const matchingUnit = currentUnits.find(unit => unit.name === compUnit.name);
    if (matchingUnit) {
      // Base score for having the unit
      score += 10;
      
      // Bonus for star level
      score += (matchingUnit.tier - 1) * 5;
    }
  });
  
  return score;
};

// Calculate score based on traits already activated
const calculateTraitScore = (currentTraits: any[], compTraits: any[]): number => {
  let score = 0;
  
  // For each trait in the comp, check if it's already activated
  compTraits.forEach(compTrait => {
    const matchingTrait = currentTraits.find(trait => trait.name === compTrait.name);
    if (matchingTrait && matchingTrait.active) {
      // Score based on trait level
      score += 5 * matchingTrait.count;
    }
  });
  
  return score;
};

// Calculate score based on items already built
const calculateItemScore = (currentUnits: Unit[], compUnits: any[]): number => {
  let score = 0;
  
  // For each unit in the comp, check if it already has recommended items
  compUnits.forEach(compUnit => {
    const matchingUnit = currentUnits.find(unit => unit.name === compUnit.name);
    if (matchingUnit) {
      // Check if the unit has any of the recommended items
      matchingUnit.items.forEach(item => {
        const isRecommended = compUnit.items?.some((recItem: any) => recItem.name === item.name);
        if (isRecommended) {
          score += 5;
        }
      });
    }
  });
  
  return score;
};

// Calculate score based on feasibility (player level, gold)
const calculateFeasibilityScore = (gameState: GameState, comp: TeamComp): number => {
  let score = 0;
  
  // Higher level means more units can be fielded
  score += gameState.playerLevel * 2;
  
  // More gold means more rolling potential
  score += Math.min(gameState.gold, 50) / 5;
  
  return score;
};

// Recommend items based on current units and recommended comps
const recommendItems = (gameState: GameState, recommendedComps: TeamComp[]): RecommendedItem[] => {
  const recommendedItems: RecommendedItem[] = [];
  
  // Get the highest priority units from the recommended comps
  const priorityUnits = recommendedComps.flatMap(comp => 
    comp.units
      .filter((unit: any) => unit.priority <= 2) // Only high priority units
      .map((unit: any) => ({
        name: unit.name,
        items: unit.items,
        priority: unit.priority,
      }))
  );
  
  // Deduplicate units by name, keeping the highest priority one
  const uniquePriorityUnits = priorityUnits.reduce((acc: any[], unit) => {
    const existingUnit = acc.find(u => u.name === unit.name);
    if (!existingUnit || existingUnit.priority > unit.priority) {
      if (existingUnit) {
        // Replace existing unit
        const index = acc.indexOf(existingUnit);
        acc[index] = unit;
      } else {
        // Add new unit
        acc.push(unit);
      }
    }
    return acc;
  }, []);
  
  // For each priority unit, recommend its items
  uniquePriorityUnits.forEach(unit => {
    unit.items?.forEach((item: any, index: number) => {
      recommendedItems.push({
        id: `${unit.name}-${item.name}-${index}`,
        name: item.name,
        priority: unit.priority,
        champion: unit.name,
      });
    });
  });
  
  return recommendedItems;
};

// Recommend augments based on current units and recommended comps
const recommendAugments = (gameState: GameState, recommendedComps: TeamComp[]): RecommendedAugment[] => {
  // Extract all augments from recommended comps
  const allAugments = recommendedComps.flatMap(comp => comp.augments || []);
  
  // Count occurrences of each augment
  const augmentCounts = allAugments.reduce((counts: Record<string, number>, augment: any) => {
    const key = augment.name;
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
  
  // Convert to recommended augments, sorted by frequency
  const recommendedAugments = Object.entries(augmentCounts)
    .map(([name, count]) => {
      const augment = allAugments.find((a: any) => a.name === name);
      return {
        id: name,
        name,
        tier: augment?.tier || 'silver',
        priority: Math.min(5, Math.ceil((count / recommendedComps.length) * 5)),
      };
    })
    .sort((a, b) => b.priority - a.priority);
  
  return recommendedAugments;
};
