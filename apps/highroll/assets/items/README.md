# Item Images for Detection

This directory contains item images used for template matching in the item detection system.

## Image Requirements

- Images should be PNG format with transparent background
- Each image should be named according to the item ID (e.g., `TFT_Item_RabadonsDeathcap.png`)
- Images should be cropped to include only the item icon
- Recommended size: 64x64 pixels
- Images should be from the current TFT set

## How to Add Images

1. Obtain item icons from official sources or extract them from the game
2. Crop and resize the images to focus on the item icon
3. Save the images with the correct naming convention
4. Place them in this directory

## Image Processing

The item detection system uses these images as templates for matching against screen captures. The system will:

1. Load all images from this directory
2. Convert them to the appropriate format for template matching
3. Use them to identify items on champions and in the inventory

## Current Set

The current implementation is designed for TFT Set 9. When a new set is released, update the images in this directory and update the `TFT_ITEMS` data in `src/shared/item-data.ts`.

## Example Image Structure

```
assets/items/
├── README.md
├── TFT_Item_BFSword.png
├── TFT_Item_RecurveBow.png
├── TFT_Item_NeedlesslyLargeRod.png
└── ...
```

## Resources

- [Riot Games Developer Portal](https://developer.riotgames.com/)
- [Community Dragon](https://raw.communitydragon.org/) (unofficial resource for game assets)
- [TFT Set Documentation](https://www.leagueoflegends.com/en-us/news/game-updates/teamfight-tactics-set-9-remix-rumble-overview/)
