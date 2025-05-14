/**
 * TFT Item Data
 * 
 * Contains information about items in Teamfight Tactics.
 * This data is used for item detection and game state analysis.
 */

import { Item } from './types';

/**
 * Item data interface with additional metadata for detection
 */
export interface ItemData extends Omit<Item, 'position'> {
  set: number;           // TFT set number
  isComponent: boolean;  // Whether the item is a component
  components?: string[]; // Component items (if not a component)
  imageUrl?: string;     // URL to item image
  stats?: Record<string, number | string>; // Item stats
}

/**
 * Map of item IDs to item data
 */
export const TFT_ITEMS: Record<string, ItemData> = {
  // Component Items
  'TFT_Item_BFSword': {
    id: 'TFT_Item_BFSword',
    name: 'B.F. Sword',
    set: 9,
    isComponent: true,
    description: 'Grants Attack Damage',
    stats: { 'AD': 10 }
  },
  'TFT_Item_RecurveBow': {
    id: 'TFT_Item_RecurveBow',
    name: 'Recurve Bow',
    set: 9,
    isComponent: true,
    description: 'Grants Attack Speed',
    stats: { 'AS': '15%' }
  },
  'TFT_Item_NeedlesslyLargeRod': {
    id: 'TFT_Item_NeedlesslyLargeRod',
    name: 'Needlessly Large Rod',
    set: 9,
    isComponent: true,
    description: 'Grants Ability Power',
    stats: { 'AP': 15 }
  },
  'TFT_Item_TearOfTheGoddess': {
    id: 'TFT_Item_TearOfTheGoddess',
    name: 'Tear of the Goddess',
    set: 9,
    isComponent: true,
    description: 'Grants Mana',
    stats: { 'Mana': 15 }
  },
  'TFT_Item_ChainVest': {
    id: 'TFT_Item_ChainVest',
    name: 'Chain Vest',
    set: 9,
    isComponent: true,
    description: 'Grants Armor',
    stats: { 'Armor': 20 }
  },
  'TFT_Item_NegatronCloak': {
    id: 'TFT_Item_NegatronCloak',
    name: 'Negatron Cloak',
    set: 9,
    isComponent: true,
    description: 'Grants Magic Resist',
    stats: { 'MR': 20 }
  },
  'TFT_Item_GiantsBelt': {
    id: 'TFT_Item_GiantsBelt',
    name: "Giant's Belt",
    set: 9,
    isComponent: true,
    description: 'Grants Health',
    stats: { 'HP': 150 }
  },
  'TFT_Item_SparringGloves': {
    id: 'TFT_Item_SparringGloves',
    name: 'Sparring Gloves',
    set: 9,
    isComponent: true,
    description: 'Grants Critical Strike Chance and Dodge Chance',
    stats: { 'Crit': '10%', 'Dodge': '10%' }
  },
  'TFT_Item_Spatula': {
    id: 'TFT_Item_Spatula',
    name: 'Spatula',
    set: 9,
    isComponent: true,
    description: 'Used to create trait items',
  },

  // Combined Items
  'TFT_Item_DeathBlade': {
    id: 'TFT_Item_DeathBlade',
    name: 'Deathblade',
    set: 9,
    isComponent: false,
    components: ['TFT_Item_BFSword', 'TFT_Item_BFSword'],
    description: 'Grants bonus Attack Damage that stacks when killing enemies',
    stats: { 'AD': 50 }
  },
  'TFT_Item_GiantSlayer': {
    id: 'TFT_Item_GiantSlayer',
    name: 'Giant Slayer',
    set: 9,
    isComponent: false,
    components: ['TFT_Item_BFSword', 'TFT_Item_RecurveBow'],
    description: 'Attacks deal bonus damage to high-health targets',
    stats: { 'AD': 15, 'AS': '15%' }
  },
  'TFT_Item_HextechGunblade': {
    id: 'TFT_Item_HextechGunblade',
    name: 'Hextech Gunblade',
    set: 9,
    isComponent: false,
    components: ['TFT_Item_BFSword', 'TFT_Item_NeedlesslyLargeRod'],
    description: 'Heals for a percentage of damage dealt',
    stats: { 'AD': 20, 'AP': 20, 'Omnivamp': '25%' }
  },
  'TFT_Item_SpearOfShojin': {
    id: 'TFT_Item_SpearOfShojin',
    name: 'Spear of Shojin',
    set: 9,
    isComponent: false,
    components: ['TFT_Item_BFSword', 'TFT_Item_TearOfTheGoddess'],
    description: 'Attacks restore mana',
    stats: { 'AD': 15, 'Mana': 15 }
  },
  'TFT_Item_GuardianAngel': {
    id: 'TFT_Item_GuardianAngel',
    name: 'Guardian Angel',
    set: 9,
    isComponent: false,
    components: ['TFT_Item_BFSword', 'TFT_Item_ChainVest'],
    description: 'Revives champion after death',
    stats: { 'AD': 15, 'Armor': 20 }
  },
  'TFT_Item_BloodThirster': {
    id: 'TFT_Item_BloodThirster',
    name: 'Bloodthirster',
    set: 9,
    isComponent: false,
    components: ['TFT_Item_BFSword', 'TFT_Item_NegatronCloak'],
    description: 'Grants lifesteal and a shield when low on health',
    stats: { 'AD': 15, 'MR': 20, 'Lifesteal': '25%' }
  },
  'TFT_Item_ZekesHerald': {
    id: 'TFT_Item_ZekesHerald',
    name: "Zeke's Herald",
    set: 9,
    isComponent: false,
    components: ['TFT_Item_BFSword', 'TFT_Item_GiantsBelt'],
    description: 'Grants Attack Speed to nearby allies',
    stats: { 'AD': 15, 'HP': 150 }
  },
  'TFT_Item_InfinityEdge': {
    id: 'TFT_Item_InfinityEdge',
    name: 'Infinity Edge',
    set: 9,
    isComponent: false,
    components: ['TFT_Item_BFSword', 'TFT_Item_SparringGloves'],
    description: 'Grants Critical Strike Chance and Critical Strike Damage',
    stats: { 'AD': 15, 'Crit': '20%', 'CritDamage': '40%' }
  },
  'TFT_Item_RapidFirecannon': {
    id: 'TFT_Item_RapidFirecannon',
    name: 'Rapid Firecannon',
    set: 9,
    isComponent: false,
    components: ['TFT_Item_RecurveBow', 'TFT_Item_RecurveBow'],
    description: 'Increases Attack Range and Attack Speed',
    stats: { 'AS': '35%', 'Range': '+1' }
  },
  'TFT_Item_GuinsoosRageblade': {
    id: 'TFT_Item_GuinsoosRageblade',
    name: "Guinsoo's Rageblade",
    set: 9,
    isComponent: false,
    components: ['TFT_Item_RecurveBow', 'TFT_Item_NeedlesslyLargeRod'],
    description: 'Attacks grant stacking Attack Speed',
    stats: { 'AS': '15%', 'AP': 15 }
  },
  'TFT_Item_StatikkShiv': {
    id: 'TFT_Item_StatikkShiv',
    name: 'Statikk Shiv',
    set: 9,
    isComponent: false,
    components: ['TFT_Item_RecurveBow', 'TFT_Item_TearOfTheGoddess'],
    description: 'Every third attack deals chain lightning damage',
    stats: { 'AS': '15%', 'Mana': 15 }
  },
  'TFT_Item_TitansResolve': {
    id: 'TFT_Item_TitansResolve',
    name: "Titan's Resolve",
    set: 9,
    isComponent: false,
    components: ['TFT_Item_RecurveBow', 'TFT_Item_ChainVest'],
    description: 'Grants stacking Armor and Magic Resist when attacking or taking damage',
    stats: { 'AS': '15%', 'Armor': 20 }
  },
  'TFT_Item_RunaansHurricane': {
    id: 'TFT_Item_RunaansHurricane',
    name: "Runaan's Hurricane",
    set: 9,
    isComponent: false,
    components: ['TFT_Item_RecurveBow', 'TFT_Item_NegatronCloak'],
    description: 'Attacks hit additional enemies for reduced damage',
    stats: { 'AS': '15%', 'MR': 20 }
  },
  'TFT_Item_ZzRotPortal': {
    id: 'TFT_Item_ZzRotPortal',
    name: "Zz'Rot Portal",
    set: 9,
    isComponent: false,
    components: ['TFT_Item_RecurveBow', 'TFT_Item_GiantsBelt'],
    description: 'On death, creates a Construct that taunts nearby enemies',
    stats: { 'AS': '15%', 'HP': 150 }
  },
  'TFT_Item_LastWhisper': {
    id: 'TFT_Item_LastWhisper',
    name: 'Last Whisper',
    set: 9,
    isComponent: false,
    components: ['TFT_Item_RecurveBow', 'TFT_Item_SparringGloves'],
    description: 'Critical hits reduce target Armor',
    stats: { 'AS': '15%', 'Crit': '20%' }
  },
  'TFT_Item_RabadonsDeathcap': {
    id: 'TFT_Item_RabadonsDeathcap',
    name: "Rabadon's Deathcap",
    set: 9,
    isComponent: false,
    components: ['TFT_Item_NeedlesslyLargeRod', 'TFT_Item_NeedlesslyLargeRod'],
    description: 'Increases Ability Power',
    stats: { 'AP': 75 }
  },
  'TFT_Item_ArchangelsStaff': {
    id: 'TFT_Item_ArchangelsStaff',
    name: "Archangel's Staff",
    set: 9,
    isComponent: false,
    components: ['TFT_Item_NeedlesslyLargeRod', 'TFT_Item_TearOfTheGoddess'],
    description: 'Grants Ability Power over time',
    stats: { 'AP': 20, 'Mana': 15 }
  },
  'TFT_Item_LocketOfTheIronSolari': {
    id: 'TFT_Item_LocketOfTheIronSolari',
    name: 'Locket of the Iron Solari',
    set: 9,
    isComponent: false,
    components: ['TFT_Item_NeedlesslyLargeRod', 'TFT_Item_ChainVest'],
    description: 'Grants a shield to nearby allies',
    stats: { 'AP': 15, 'Armor': 20 }
  },
  'TFT_Item_IonicSpark': {
    id: 'TFT_Item_IonicSpark',
    name: 'Ionic Spark',
    set: 9,
    isComponent: false,
    components: ['TFT_Item_NeedlesslyLargeRod', 'TFT_Item_NegatronCloak'],
    description: 'Reduces nearby enemies Magic Resist and damages them when they cast spells',
    stats: { 'AP': 15, 'MR': 20 }
  },
  'TFT_Item_MorelloNomicon': {
    id: 'TFT_Item_MorelloNomicon',
    name: 'Morellonomicon',
    set: 9,
    isComponent: false,
    components: ['TFT_Item_NeedlesslyLargeRod', 'TFT_Item_GiantsBelt'],
    description: 'Spells burn enemies, dealing damage over time and reducing healing',
    stats: { 'AP': 15, 'HP': 150 }
  },
  'TFT_Item_JeweledGauntlet': {
    id: 'TFT_Item_JeweledGauntlet',
    name: 'Jeweled Gauntlet',
    set: 9,
    isComponent: false,
    components: ['TFT_Item_NeedlesslyLargeRod', 'TFT_Item_SparringGloves'],
    description: 'Abilities can critically strike',
    stats: { 'AP': 15, 'Crit': '20%' }
  }
};

/**
 * Get all items for a specific set
 * @param set TFT set number
 * @returns Array of items for the specified set
 */
export function getItemsBySet(set: number): ItemData[] {
  return Object.values(TFT_ITEMS).filter(item => item.set === set);
}

/**
 * Get component items
 * @returns Array of component items
 */
export function getComponentItems(): ItemData[] {
  return Object.values(TFT_ITEMS).filter(item => item.isComponent);
}

/**
 * Get combined items
 * @returns Array of combined items
 */
export function getCombinedItems(): ItemData[] {
  return Object.values(TFT_ITEMS).filter(item => !item.isComponent);
}

/**
 * Get items that can be built from a specific component
 * @param componentId Component item ID
 * @returns Array of items that use the specified component
 */
export function getItemsUsingComponent(componentId: string): ItemData[] {
  return Object.values(TFT_ITEMS).filter(
    item => item.components?.includes(componentId)
  );
}

/**
 * Get item by ID
 * @param id Item ID
 * @returns Item data or undefined if not found
 */
export function getItemById(id: string): ItemData | undefined {
  return TFT_ITEMS[id];
}

/**
 * Get item by name
 * @param name Item name
 * @returns Item data or undefined if not found
 */
export function getItemByName(name: string): ItemData | undefined {
  return Object.values(TFT_ITEMS).find(
    item => item.name.toLowerCase() === name.toLowerCase()
  );
}
