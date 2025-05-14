/**
 * Data Validation Service
 * 
 * Provides functionality for validating data integrity.
 * Ensures that data models conform to expected schemas and contain valid values.
 */

import { 
  TeamComp, 
  Champion, 
  Item, 
  Augment 
} from '../../shared/types';
import { 
  DataValidationResult, 
  DataValidationError,
  TeamCompModel,
  ItemModel,
  AugmentModel
} from '../../shared/data-models';

/**
 * Service for validating data integrity
 */
class DataValidationService {
  /**
   * Validate a team composition
   * @param teamComp Team composition to validate
   * @returns Validation result
   */
  public validateTeamComp(teamComp: TeamComp): DataValidationResult {
    const errors: DataValidationError[] = [];
    
    // Check required fields
    if (!teamComp.id) {
      errors.push({
        field: 'id',
        message: 'Team composition ID is required'
      });
    }
    
    if (!teamComp.name) {
      errors.push({
        field: 'name',
        message: 'Team composition name is required'
      });
    }
    
    // Validate units
    if (!teamComp.units || !Array.isArray(teamComp.units)) {
      errors.push({
        field: 'units',
        message: 'Team composition must have units array'
      });
    } else {
      // Check if units array is empty
      if (teamComp.units.length === 0) {
        errors.push({
          field: 'units',
          message: 'Team composition must have at least one unit'
        });
      }
      
      // Validate each unit
      teamComp.units.forEach((unit, index) => {
        if (!unit.id) {
          errors.push({
            field: `units[${index}].id`,
            message: 'Unit ID is required'
          });
        }
        
        if (!unit.name) {
          errors.push({
            field: `units[${index}].name`,
            message: 'Unit name is required'
          });
        }
        
        if (typeof unit.cost !== 'number' || unit.cost < 1 || unit.cost > 5) {
          errors.push({
            field: `units[${index}].cost`,
            message: 'Unit cost must be a number between 1 and 5',
            value: unit.cost
          });
        }
      });
    }
    
    // Validate traits
    if (!teamComp.traits || !Array.isArray(teamComp.traits)) {
      errors.push({
        field: 'traits',
        message: 'Team composition must have traits array'
      });
    }
    
    // Validate metrics
    if (typeof teamComp.avgPlacement !== 'number' || teamComp.avgPlacement < 1 || teamComp.avgPlacement > 8) {
      errors.push({
        field: 'avgPlacement',
        message: 'Average placement must be a number between 1 and 8',
        value: teamComp.avgPlacement
      });
    }
    
    if (typeof teamComp.playRate !== 'number' || teamComp.playRate < 0 || teamComp.playRate > 100) {
      errors.push({
        field: 'playRate',
        message: 'Play rate must be a number between 0 and 100',
        value: teamComp.playRate
      });
    }
    
    if (typeof teamComp.winRate !== 'number' || teamComp.winRate < 0 || teamComp.winRate > 100) {
      errors.push({
        field: 'winRate',
        message: 'Win rate must be a number between 0 and 100',
        value: teamComp.winRate
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate a team composition model
   * @param model Team composition model to validate
   * @returns Validation result
   */
  public validateTeamCompModel(model: TeamCompModel): DataValidationResult {
    const errors: DataValidationError[] = [];
    
    // Check required fields
    if (!model.data || !Array.isArray(model.data)) {
      errors.push({
        field: 'data',
        message: 'Team composition model must have data array'
      });
    } else {
      // Validate each team composition
      model.data.forEach((teamComp, index) => {
        const result = this.validateTeamComp(teamComp);
        
        if (!result.isValid) {
          result.errors.forEach(error => {
            errors.push({
              field: `data[${index}].${error.field}`,
              message: error.message,
              value: error.value
            });
          });
        }
      });
    }
    
    // Validate metadata
    if (!model.metadata) {
      errors.push({
        field: 'metadata',
        message: 'Team composition model must have metadata'
      });
    } else {
      if (!model.metadata.source) {
        errors.push({
          field: 'metadata.source',
          message: 'Metadata must have source'
        });
      }
      
      if (!model.metadata.timestamp) {
        errors.push({
          field: 'metadata.timestamp',
          message: 'Metadata must have timestamp'
        });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate an item
   * @param item Item to validate
   * @returns Validation result
   */
  public validateItem(item: Item): DataValidationResult {
    const errors: DataValidationError[] = [];
    
    // Check required fields
    if (!item.id) {
      errors.push({
        field: 'id',
        message: 'Item ID is required'
      });
    }
    
    if (!item.name) {
      errors.push({
        field: 'name',
        message: 'Item name is required'
      });
    }
    
    // Validate components if not a component item
    if (item.isComponent === false && (!item.components || !Array.isArray(item.components))) {
      errors.push({
        field: 'components',
        message: 'Non-component item must have components array'
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate an item model
   * @param model Item model to validate
   * @returns Validation result
   */
  public validateItemModel(model: ItemModel): DataValidationResult {
    const errors: DataValidationError[] = [];
    
    // Check required fields
    if (!model.data || !Array.isArray(model.data)) {
      errors.push({
        field: 'data',
        message: 'Item model must have data array'
      });
    } else {
      // Validate each item
      model.data.forEach((item, index) => {
        const result = this.validateItem(item);
        
        if (!result.isValid) {
          result.errors.forEach(error => {
            errors.push({
              field: `data[${index}].${error.field}`,
              message: error.message,
              value: error.value
            });
          });
        }
      });
    }
    
    // Validate metadata
    if (!model.metadata) {
      errors.push({
        field: 'metadata',
        message: 'Item model must have metadata'
      });
    } else {
      if (!model.metadata.source) {
        errors.push({
          field: 'metadata.source',
          message: 'Metadata must have source'
        });
      }
      
      if (!model.metadata.timestamp) {
        errors.push({
          field: 'metadata.timestamp',
          message: 'Metadata must have timestamp'
        });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate an augment
   * @param augment Augment to validate
   * @returns Validation result
   */
  public validateAugment(augment: Augment): DataValidationResult {
    const errors: DataValidationError[] = [];
    
    // Check required fields
    if (!augment.id) {
      errors.push({
        field: 'id',
        message: 'Augment ID is required'
      });
    }
    
    if (!augment.name) {
      errors.push({
        field: 'name',
        message: 'Augment name is required'
      });
    }
    
    if (!augment.tier) {
      errors.push({
        field: 'tier',
        message: 'Augment tier is required'
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate an augment model
   * @param model Augment model to validate
   * @returns Validation result
   */
  public validateAugmentModel(model: AugmentModel): DataValidationResult {
    const errors: DataValidationError[] = [];
    
    // Check required fields
    if (!model.data || !Array.isArray(model.data)) {
      errors.push({
        field: 'data',
        message: 'Augment model must have data array'
      });
    } else {
      // Validate each augment
      model.data.forEach((augment, index) => {
        const result = this.validateAugment(augment);
        
        if (!result.isValid) {
          result.errors.forEach(error => {
            errors.push({
              field: `data[${index}].${error.field}`,
              message: error.message,
              value: error.value
            });
          });
        }
      });
    }
    
    // Validate metadata
    if (!model.metadata) {
      errors.push({
        field: 'metadata',
        message: 'Augment model must have metadata'
      });
    } else {
      if (!model.metadata.source) {
        errors.push({
          field: 'metadata.source',
          message: 'Metadata must have source'
        });
      }
      
      if (!model.metadata.timestamp) {
        errors.push({
          field: 'metadata.timestamp',
          message: 'Metadata must have timestamp'
        });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export a singleton instance
export default new DataValidationService();
