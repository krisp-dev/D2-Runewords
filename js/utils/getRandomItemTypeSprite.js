import { ITEM_TYPE_SPRITES } from "../data/itemTypeSprites.js";
import { ITEM_TYPE_ALIASES } from "../data/itemTypeAliases.js";

// Given a runeword itemType array (e.g. ["Melee Weapons"]),
// returns a random matching sprite path.

export function getRandomItemTypeSprite(itemTypes) {
   const type = itemTypes[0];

   // Expand general types like "Melee Weapons" into concrete ones (Swords, Axes, etc.)
   const expandedTypes = ITEM_TYPE_ALIASES[type] || [type];

   // Pick one of those concrete types at random
   const concreteType =
      expandedTypes[Math.floor(Math.random() * expandedTypes.length)];

   // Get all sprite filenames for that concrete type
   const sprites = ITEM_TYPE_SPRITES[concreteType];

   if (!sprites || sprites.length === 0) {
      console.warn("No sprites found for item type:", concreteType);
      return null;
   }

   // Pick one of the available images (Sword 1.png, Sword 2.png, etc.)
   return sprites[Math.floor(Math.random() * sprites.length)];
}
