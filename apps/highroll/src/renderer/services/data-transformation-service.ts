/**
 * Data Transformation Service
 * 
 * Provides functionality for transforming data from external APIs
 * into a consistent format for the application.
 */

import { 
  TeamComp, 
  Item, 
  Augment, 
  Champion 
} from '../../shared/types';
import { 
  MetaTftApi, 
  TacticsToolsApi 
} from '../../shared/api-types';
import { 
  DataSource, 
  TeamCompModel, 
  ItemModel, 
  AugmentModel,
  TransformationOptions,
  DEFAULT_TRANSFORMATION_OPTIONS
} from '../../shared/data-models';
import dataValidationService from './data-validation-service';

/**
 * Service for transforming data from external APIs
 */
class DataTransformationService {
  /**
   * Transform team compositions from Meta TFT
   * @param data Meta TFT team compositions data
   * @param options Transformation options
   * @returns Transformed team composition model
   */
  public transformMetaTftTeamComps(
    data: MetaTftApi.TeamCompsResponse,
    options: TransformationOptions = DEFAULT_TRANSFORMATION_OPTIONS
  ): TeamCompModel {
    const { validateData, normalizeNames, includeMetadata, source } = {
      ...DEFAULT_TRANSFORMATION_OPTIONS,
      ...options
    };
    
    // Transform team compositions
    const teamComps: TeamComp[] = data.comps.map(comp => {
      // Transform units
      const units = comp.units.map(unit => {
        const champion: Champion = {
          id: unit.id,
          name: normalizeNames ? this.normalizeChampionName(unit.name) : unit.name,
          cost: unit.cost,
          items: unit.items.map(itemId => ({ id: itemId, name: this.getItemNameFromId(itemId) }))
        };
        
        return champion;
      });
      
      // Create team composition
      const teamComp: TeamComp = {
        id: comp.id,
        name: comp.name,
        units,
        traits: comp.traits.map(trait => trait.name),
        items: comp.items.flatMap(item => 
          item.items.map(itemId => ({ id: itemId, name: this.getItemNameFromId(itemId) }))
        ),
        avgPlacement: comp.avgPlacement,
        playRate: comp.playRate,
        winRate: comp.winRate
      };
      
      return teamComp;
    });
    
    // Create model
    const model: TeamCompModel = {
      data: teamComps,
      metadata: {
        source: source || DataSource.META_TFT,
        timestamp: Date.now(),
        patch: data.patch,
        version: '1.0.0'
      }
    };
    
    // Validate model if requested
    if (validateData) {
      const validationResult = dataValidationService.validateTeamCompModel(model);
      
      if (!validationResult.isValid) {
        console.warn('Team composition model validation failed:', validationResult.errors);
      }
    }
    
    return model;
  }
  
  /**
   * Transform team compositions from Tactics.Tools
   * @param data Tactics.Tools team compositions data
   * @param options Transformation options
   * @returns Transformed team composition model
   */
  public transformTacticsToolsTeamComps(
    data: TacticsToolsApi.TeamCompsResponse,
    options: TransformationOptions = DEFAULT_TRANSFORMATION_OPTIONS
  ): TeamCompModel {
    const { validateData, normalizeNames, includeMetadata, source } = {
      ...DEFAULT_TRANSFORMATION_OPTIONS,
      ...options
    };
    
    // Transform team compositions
    const teamComps: TeamComp[] = data.comps.map(comp => {
      // Transform champions to units
      const units = comp.champions.map(champion => {
        const unit: Champion = {
          id: champion.id,
          name: normalizeNames ? this.normalizeChampionName(champion.name) : champion.name,
          cost: champion.cost,
          items: champion.items.map(item => ({ 
            id: item.id, 
            name: normalizeNames ? this.normalizeItemName(item.name) : item.name 
          }))
        };
        
        return unit;
      });
      
      // Create team composition
      const teamComp: TeamComp = {
        id: comp.id,
        name: comp.name,
        units,
        traits: comp.traits.map(trait => trait.name),
        items: comp.champions.flatMap(champion => 
          champion.items.map(item => ({ 
            id: item.id, 
            name: normalizeNames ? this.normalizeItemName(item.name) : item.name 
          }))
        ),
        avgPlacement: comp.avgPlacement,
        playRate: comp.frequency,
        winRate: comp.winRate
      };
      
      return teamComp;
    });
    
    // Create model
    const model: TeamCompModel = {
      data: teamComps,
      metadata: {
        source: source || DataSource.TACTICS_TOOLS,
        timestamp: Date.now(),
        patch: data.patch,
        version: '1.0.0'
      }
    };
    
    // Validate model if requested
    if (validateData) {
      const validationResult = dataValidationService.validateTeamCompModel(model);
      
      if (!validationResult.isValid) {
        console.warn('Team composition model validation failed:', validationResult.errors);
      }
    }
    
    return model;
  }
  
  /**
   * Transform items from Meta TFT
   * @param data Meta TFT items data
   * @param options Transformation options
   * @returns Transformed item model
   */
  public transformMetaTftItems(
    data: any, // Replace with proper type when available
    options: TransformationOptions = DEFAULT_TRANSFORMATION_OPTIONS
  ): ItemModel {
    const { validateData, normalizeNames, includeMetadata, source } = {
      ...DEFAULT_TRANSFORMATION_OPTIONS,
      ...options
    };
    
    // TODO: Implement item transformation from Meta TFT
    // This is a placeholder implementation
    
    // Create model
    const model: ItemModel = {
      data: [],
      metadata: {
        source: source || DataSource.META_TFT,
        timestamp: Date.now(),
        patch: data.patch,
        version: '1.0.0'
      }
    };
    
    // Validate model if requested
    if (validateData) {
      const validationResult = dataValidationService.validateItemModel(model);
      
      if (!validationResult.isValid) {
        console.warn('Item model validation failed:', validationResult.errors);
      }
    }
    
    return model;
  }
  
  /**
   * Transform items from Tactics.Tools
   * @param data Tactics.Tools items data
   * @param options Transformation options
   * @returns Transformed item model
   */
  public transformTacticsToolsItems(
    data: any, // Replace with proper type when available
    options: TransformationOptions = DEFAULT_TRANSFORMATION_OPTIONS
  ): ItemModel {
    const { validateData, normalizeNames, includeMetadata, source } = {
      ...DEFAULT_TRANSFORMATION_OPTIONS,
      ...options
    };
    
    // TODO: Implement item transformation from Tactics.Tools
    // This is a placeholder implementation
    
    // Create model
    const model: ItemModel = {
      data: [],
      metadata: {
        source: source || DataSource.TACTICS_TOOLS,
        timestamp: Date.now(),
        patch: data.patch,
        version: '1.0.0'
      }
    };
    
    // Validate model if requested
    if (validateData) {
      const validationResult = dataValidationService.validateItemModel(model);
      
      if (!validationResult.isValid) {
        console.warn('Item model validation failed:', validationResult.errors);
      }
    }
    
    return model;
  }
  
  /**
   * Transform augments from Meta TFT
   * @param data Meta TFT augments data
   * @param options Transformation options
   * @returns Transformed augment model
   */
  public transformMetaTftAugments(
    data: MetaTftApi.AugmentsResponse,
    options: TransformationOptions = DEFAULT_TRANSFORMATION_OPTIONS
  ): AugmentModel {
    const { validateData, normalizeNames, includeMetadata, source } = {
      ...DEFAULT_TRANSFORMATION_OPTIONS,
      ...options
    };
    
    // Transform augments
    const augments: Augment[] = data.augments.map(augment => ({
      id: augment.id,
      name: normalizeNames ? this.normalizeAugmentName(augment.name) : augment.name,
      tier: augment.tier
    }));
    
    // Create model
    const model: AugmentModel = {
      data: augments,
      metadata: {
        source: source || DataSource.META_TFT,
        timestamp: Date.now(),
        patch: data.patch,
        version: '1.0.0'
      }
    };
    
    // Validate model if requested
    if (validateData) {
      const validationResult = dataValidationService.validateAugmentModel(model);
      
      if (!validationResult.isValid) {
        console.warn('Augment model validation failed:', validationResult.errors);
      }
    }
    
    return model;
  }
  
  /**
   * Transform augments from Tactics.Tools
   * @param data Tactics.Tools augments data
   * @param options Transformation options
   * @returns Transformed augment model
   */
  public transformTacticsToolsAugments(
    data: TacticsToolsApi.AugmentsResponse,
    options: TransformationOptions = DEFAULT_TRANSFORMATION_OPTIONS
  ): AugmentModel {
    const { validateData, normalizeNames, includeMetadata, source } = {
      ...DEFAULT_TRANSFORMATION_OPTIONS,
      ...options
    };
    
    // Transform augments
    const augments: Augment[] = data.augments.map(augment => ({
      id: augment.id,
      name: normalizeNames ? this.normalizeAugmentName(augment.name) : augment.name,
      tier: augment.tier
    }));
    
    // Create model
    const model: AugmentModel = {
      data: augments,
      metadata: {
        source: source || DataSource.TACTICS_TOOLS,
        timestamp: Date.now(),
        patch: data.patch,
        version: '1.0.0'
      }
    };
    
    // Validate model if requested
    if (validateData) {
      const validationResult = dataValidationService.validateAugmentModel(model);
      
      if (!validationResult.isValid) {
        console.warn('Augment model validation failed:', validationResult.errors);
      }
    }
    
    return model;
  }
  
  /**
   * Normalize a champion name
   * @param name Champion name to normalize
   * @returns Normalized champion name
   */
  private normalizeChampionName(name: string): string {
    // Remove TFT set prefix if present
    name = name.replace(/^TFT\d+_/, '');
    
    // Replace underscores with spaces
    name = name.replace(/_/g, ' ');
    
    // Capitalize first letter of each word
    name = name.replace(/\b\w/g, c => c.toUpperCase());
    
    return name;
  }
  
  /**
   * Normalize an item name
   * @param name Item name to normalize
   * @returns Normalized item name
   */
  private normalizeItemName(name: string): string {
    // Remove TFT item prefix if present
    name = name.replace(/^TFT_Item_/, '');
    
    // Replace underscores with spaces
    name = name.replace(/_/g, ' ');
    
    // Capitalize first letter of each word
    name = name.replace(/\b\w/g, c => c.toUpperCase());
    
    return name;
  }
  
  /**
   * Normalize an augment name
   * @param name Augment name to normalize
   * @returns Normalized augment name
   */
  private normalizeAugmentName(name: string): string {
    // Remove TFT augment prefix if present
    name = name.replace(/^TFT\d+_Augment_/, '');
    
    // Replace underscores with spaces
    name = name.replace(/_/g, ' ');
    
    // Capitalize first letter of each word
    name = name.replace(/\b\w/g, c => c.toUpperCase());
    
    return name;
  }
  
  /**
   * Get an item name from its ID
   * @param id Item ID
   * @returns Item name
   */
  private getItemNameFromId(id: string): string {
    // TODO: Implement item name lookup from ID
    // This is a placeholder implementation
    return this.normalizeItemName(id);
  }
}

// Export a singleton instance
export default new DataTransformationService();
