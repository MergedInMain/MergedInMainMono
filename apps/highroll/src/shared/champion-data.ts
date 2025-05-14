/**
 * TFT Champion Data
 * 
 * Contains information about champions in Teamfight Tactics.
 * This data is used for champion detection and game state analysis.
 */

import { Champion } from './types';

/**
 * Champion data interface with additional metadata for detection
 */
export interface ChampionData extends Omit<Champion, 'stars' | 'items' | 'position'> {
  set: number;        // TFT set number
  traits: string[];   // Champion traits
  imageUrl?: string;  // URL to champion image
  splashUrl?: string; // URL to champion splash art
}

/**
 * Map of champion IDs to champion data
 */
export const TFT_CHAMPIONS: Record<string, ChampionData> = {
  // Set 9 Champions (Example data - would be updated for current set)
  'TFT9_Ahri': {
    id: 'TFT9_Ahri',
    name: 'Ahri',
    cost: 4,
    set: 9,
    traits: ['Spirit', 'Mage'],
  },
  'TFT9_Akali': {
    id: 'TFT9_Akali',
    name: 'Akali',
    cost: 4,
    set: 9,
    traits: ['K/DA', 'Assassin'],
  },
  'TFT9_Aphelios': {
    id: 'TFT9_Aphelios',
    name: 'Aphelios',
    cost: 4,
    set: 9,
    traits: ['Heartsteel', 'Marksman'],
  },
  'TFT9_Ashe': {
    id: 'TFT9_Ashe',
    name: 'Ashe',
    cost: 2,
    set: 9,
    traits: ['Freljord', 'Marksman'],
  },
  'TFT9_Bard': {
    id: 'TFT9_Bard',
    name: 'Bard',
    cost: 3,
    set: 9,
    traits: ['Wanderer', 'Support'],
  },
  'TFT9_Blitzcrank': {
    id: 'TFT9_Blitzcrank',
    name: 'Blitzcrank',
    cost: 2,
    set: 9,
    traits: ['Zaun', 'Brawler'],
  },
  'TFT9_Caitlyn': {
    id: 'TFT9_Caitlyn',
    name: 'Caitlyn',
    cost: 1,
    set: 9,
    traits: ['Piltover', 'Marksman'],
  },
  'TFT9_Darius': {
    id: 'TFT9_Darius',
    name: 'Darius',
    cost: 3,
    set: 9,
    traits: ['Noxus', 'Brawler'],
  },
  'TFT9_Ekko': {
    id: 'TFT9_Ekko',
    name: 'Ekko',
    cost: 3,
    set: 9,
    traits: ['True Damage', 'Assassin'],
  },
  'TFT9_Ezreal': {
    id: 'TFT9_Ezreal',
    name: 'Ezreal',
    cost: 1,
    set: 9,
    traits: ['Heartsteel', 'Marksman'],
  },
  'TFT9_Garen': {
    id: 'TFT9_Garen',
    name: 'Garen',
    cost: 1,
    set: 9,
    traits: ['Demacia', 'Vanguard'],
  },
  'TFT9_Gwen': {
    id: 'TFT9_Gwen',
    name: 'Gwen',
    cost: 4,
    set: 9,
    traits: ['Gothic', 'Duelist'],
  },
  'TFT9_Irelia': {
    id: 'TFT9_Irelia',
    name: 'Irelia',
    cost: 3,
    set: 9,
    traits: ['Ionia', 'Duelist'],
  },
  'TFT9_Jinx': {
    id: 'TFT9_Jinx',
    name: 'Jinx',
    cost: 2,
    set: 9,
    traits: ['Zaun', 'Marksman'],
  },
  'TFT9_Kaisa': {
    id: 'TFT9_Kaisa',
    name: 'Kai\'Sa',
    cost: 3,
    set: 9,
    traits: ['K/DA', 'Marksman'],
  },
  'TFT9_Karma': {
    id: 'TFT9_Karma',
    name: 'Karma',
    cost: 4,
    set: 9,
    traits: ['Dawnbringer', 'Invoker'],
  },
  'TFT9_Katarina': {
    id: 'TFT9_Katarina',
    name: 'Katarina',
    cost: 2,
    set: 9,
    traits: ['Noxus', 'Assassin'],
  },
  'TFT9_Kayle': {
    id: 'TFT9_Kayle',
    name: 'Kayle',
    cost: 1,
    set: 9,
    traits: ['Demacia', 'Marksman'],
  },
  'TFT9_Kennen': {
    id: 'TFT9_Kennen',
    name: 'Kennen',
    cost: 2,
    set: 9,
    traits: ['Ionia', 'Ninja'],
  },
  'TFT9_Lux': {
    id: 'TFT9_Lux',
    name: 'Lux',
    cost: 3,
    set: 9,
    traits: ['Dawnbringer', 'Mystic'],
  },
  'TFT9_Lulu': {
    id: 'TFT9_Lulu',
    name: 'Lulu',
    cost: 1,
    set: 9,
    traits: ['Yordle', 'Support'],
  },
  'TFT9_MissFortune': {
    id: 'TFT9_MissFortune',
    name: 'Miss Fortune',
    cost: 5,
    set: 9,
    traits: ['Bilgewater', 'Marksman'],
  },
  'TFT9_Nasus': {
    id: 'TFT9_Nasus',
    name: 'Nasus',
    cost: 1,
    set: 9,
    traits: ['Shurima', 'Vanguard'],
  },
  'TFT9_Poppy': {
    id: 'TFT9_Poppy',
    name: 'Poppy',
    cost: 1,
    set: 9,
    traits: ['Yordle', 'Vanguard'],
  },
  'TFT9_Pyke': {
    id: 'TFT9_Pyke',
    name: 'Pyke',
    cost: 2,
    set: 9,
    traits: ['Bilgewater', 'Assassin'],
  },
  'TFT9_Qiyana': {
    id: 'TFT9_Qiyana',
    name: 'Qiyana',
    cost: 3,
    set: 9,
    traits: ['True Damage', 'Assassin'],
  },
  'TFT9_Riven': {
    id: 'TFT9_Riven',
    name: 'Riven',
    cost: 3,
    set: 9,
    traits: ['Exile', 'Duelist'],
  },
  'TFT9_Samira': {
    id: 'TFT9_Samira',
    name: 'Samira',
    cost: 4,
    set: 9,
    traits: ['Noxus', 'Marksman'],
  },
  'TFT9_Senna': {
    id: 'TFT9_Senna',
    name: 'Senna',
    cost: 4,
    set: 9,
    traits: ['True Damage', 'Marksman'],
  },
  'TFT9_Sett': {
    id: 'TFT9_Sett',
    name: 'Sett',
    cost: 2,
    set: 9,
    traits: ['Heartsteel', 'Brawler'],
  },
  'TFT9_Sona': {
    id: 'TFT9_Sona',
    name: 'Sona',
    cost: 5,
    set: 9,
    traits: ['Pentakill', 'Invoker'],
  },
  'TFT9_Soraka': {
    id: 'TFT9_Soraka',
    name: 'Soraka',
    cost: 2,
    set: 9,
    traits: ['Star Guardian', 'Invoker'],
  },
  'TFT9_Syndra': {
    id: 'TFT9_Syndra',
    name: 'Syndra',
    cost: 5,
    set: 9,
    traits: ['Star Guardian', 'Mage'],
  },
  'TFT9_Viego': {
    id: 'TFT9_Viego',
    name: 'Viego',
    cost: 5,
    set: 9,
    traits: ['Forgotten', 'Assassin'],
  },
  'TFT9_Yasuo': {
    id: 'TFT9_Yasuo',
    name: 'Yasuo',
    cost: 5,
    set: 9,
    traits: ['True Damage', 'Duelist'],
  },
  'TFT9_Yone': {
    id: 'TFT9_Yone',
    name: 'Yone',
    cost: 4,
    set: 9,
    traits: ['Heartsteel', 'Duelist'],
  },
  'TFT9_Zed': {
    id: 'TFT9_Zed',
    name: 'Zed',
    cost: 3,
    set: 9,
    traits: ['Ninja', 'Assassin'],
  },
};

/**
 * Get all champions for a specific set
 * @param set TFT set number
 * @returns Array of champions for the specified set
 */
export function getChampionsBySet(set: number): ChampionData[] {
  return Object.values(TFT_CHAMPIONS).filter(champion => champion.set === set);
}

/**
 * Get champions by cost
 * @param cost Champion cost (1-5)
 * @returns Array of champions with the specified cost
 */
export function getChampionsByCost(cost: number): ChampionData[] {
  return Object.values(TFT_CHAMPIONS).filter(champion => champion.cost === cost);
}

/**
 * Get champions by trait
 * @param trait Champion trait
 * @returns Array of champions with the specified trait
 */
export function getChampionsByTrait(trait: string): ChampionData[] {
  return Object.values(TFT_CHAMPIONS).filter(champion => 
    champion.traits.some(t => t.toLowerCase() === trait.toLowerCase())
  );
}

/**
 * Get champion by ID
 * @param id Champion ID
 * @returns Champion data or undefined if not found
 */
export function getChampionById(id: string): ChampionData | undefined {
  return TFT_CHAMPIONS[id];
}

/**
 * Get champion by name
 * @param name Champion name
 * @returns Champion data or undefined if not found
 */
export function getChampionByName(name: string): ChampionData | undefined {
  return Object.values(TFT_CHAMPIONS).find(
    champion => champion.name.toLowerCase() === name.toLowerCase()
  );
}
