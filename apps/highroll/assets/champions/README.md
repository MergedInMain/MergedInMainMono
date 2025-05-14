# Champion Images for Detection

This directory contains champion images used for template matching in the champion detection system.

## Image Requirements

- Images should be PNG format with transparent background
- Each image should be named according to the champion ID (e.g., `TFT9_Ahri.png`)
- Images should be cropped to include only the champion portrait
- Recommended size: 128x128 pixels
- Images should be from the current TFT set

## How to Add Images

1. Obtain champion portraits from official sources or extract them from the game
2. Crop and resize the images to focus on the champion's face/portrait
3. Save the images with the correct naming convention
4. Place them in this directory

## Image Processing

The champion detection system uses these images as templates for matching against screen captures. The system will:

1. Load all images from this directory
2. Convert them to the appropriate format for template matching
3. Use them to identify champions on the board and bench

## Current Set

The current implementation is designed for TFT Set 9. When a new set is released, update the images in this directory and update the `TFT_CHAMPIONS` data in `src/shared/champion-data.ts`.

## Example Image Structure

```
assets/champions/
├── README.md
├── TFT9_Ahri.png
├── TFT9_Akali.png
├── TFT9_Aphelios.png
└── ...
```

## Resources

- [Riot Games Developer Portal](https://developer.riotgames.com/)
- [Community Dragon](https://raw.communitydragon.org/) (unofficial resource for game assets)
- [TFT Set Documentation](https://www.leagueoflegends.com/en-us/news/game-updates/teamfight-tactics-set-9-remix-rumble-overview/)
