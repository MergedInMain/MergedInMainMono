/**
 * Data models for the application
 * 
 * These models represent the transformed data from external APIs
 * that is used throughout the application.
 */

import { TeamComp, Champion, Item, Augment } from './types';

/**
 * Source of the data
 */
export enum DataSource {
  META_TFT = 'metatft',
  TACTICS_TOOLS = 'tactics',
  COMBINED = 'combined'
}

/**
 * Metadata for a data model
 */
export interface DataMetadata {
  source: DataSource;
  timestamp: number;
  patch?: string;
  version?: string;
}

/**
 * Base data model interface
 */
export interface DataModel<T> {
  data: T[];
  metadata: DataMetadata;
}

/**
 * Team composition data model
 */
export interface TeamCompModel extends DataModel<TeamComp> {
  data: TeamComp[];
  metadata: DataMetadata;
}

/**
 * Item data model
 */
export interface ItemModel extends DataModel<Item> {
  data: Item[];
  metadata: DataMetadata;
}

/**
 * Augment data model
 */
export interface AugmentModel extends DataModel<Augment> {
  data: Augment[];
  metadata: DataMetadata;
}

/**
 * Champion data model
 */
export interface ChampionModel extends DataModel<Champion> {
  data: Champion[];
  metadata: DataMetadata;
}

/**
 * Trait data model
 */
export interface TraitModel extends DataModel<Trait> {
  data: Trait[];
  metadata: DataMetadata;
}

/**
 * Trait interface
 */
export interface Trait {
  id: string;
  name: string;
  description?: string;
  innate?: string;
  bonuses: TraitBonus[];
}

/**
 * Trait bonus interface
 */
export interface TraitBonus {
  count: number;
  description: string;
}

/**
 * Data version interface
 */
export interface DataVersion {
  version: string;
  patch: string;
  timestamp: number;
  models: {
    teamComps?: boolean;
    items?: boolean;
    augments?: boolean;
    champions?: boolean;
    traits?: boolean;
  };
}

/**
 * Data validation error interface
 */
export interface DataValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * Data validation result interface
 */
export interface DataValidationResult {
  isValid: boolean;
  errors: DataValidationError[];
}

/**
 * Data transformation options
 */
export interface TransformationOptions {
  validateData?: boolean;
  normalizeNames?: boolean;
  includeMetadata?: boolean;
  source?: DataSource;
}

/**
 * Default transformation options
 */
export const DEFAULT_TRANSFORMATION_OPTIONS: TransformationOptions = {
  validateData: true,
  normalizeNames: true,
  includeMetadata: true
};
