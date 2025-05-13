# HighRoll - TFT Overlay Application

HighRoll is a Teamfight Tactics (TFT) overlay application that provides real-time analysis and recommendations during gameplay. The overlay analyzes the player's current game state including items, units, and economy to suggest optimal team compositions based on data from reputable TFT websites.

## Features

1. **Overlay Interface**
   - Non-intrusive overlay that displays on top of the TFT game
   - Toggleable visibility with customizable transparency
   - Resizable and repositionable window
   - Minimal performance impact on game

2. **Game State Analysis**
   - Item inventory tracking and analysis
   - Current units on board and bench detection
   - Economy tracking (gold, player level, win/loss streak)
   - Current augments and available augment choices

3. **Team Composition Recommendations**
   - Suggest optimal team comps based on current units and items
   - Display transition paths to reach recommended compositions
   - Show win rates and placement statistics for recommended comps
   - Prioritize recommendations based on contested units in the lobby

4. **Augment Analysis**
   - Recommend augments based on current/planned team composition
   - Show statistical performance of augments with specific comps
   - Provide augment tier lists relevant to player's game state

5. **Item Optimization**
   - Suggest optimal item combinations for current and planned units
   - Display best-in-slot items for key carry champions
   - Recommend item priority from carousel rounds

## Technology Stack

- **Framework**: Electron (for cross-platform desktop app)
- **UI**: React with TypeScript
- **State Management**: Redux or Context API
- **Styling**: Tailwind CSS or styled-components
- **Game Integration**: Screen capture and image recognition (Tesseract.js or custom CV solution)
- **Data Storage**: Local SQLite for caching composition data

## Getting Started

### Prerequisites

- Node.js (>= 18)
- Bun (>= 1.2.0)

### Development

From the monorepo root:

```bash
# Install dependencies
bun install

# Start the development server
bun dev --filter=highroll
```

Or from the app directory:

```bash
cd apps/highroll
bun dev
```

### Building

```bash
# From the monorepo root
bun build --filter=highroll
```

## Project Structure

```
HighRoll/
├── src/
│   ├── main/
│   │   ├── main.js           # Electron main process
│   │   ├── overlay.js        # Overlay window management
│   │   └── ipc-handlers.js   # IPC communication handlers
│   ├── renderer/
│   │   ├── components/       # React components
│   │   ├── services/
│   │   │   ├── game-state.js # Game state detection
│   │   │   ├── data-api.js   # Data fetching and caching
│   │   │   └── analyzer.js   # Recommendation engine
│   │   ├── store/            # State management
│   │   └── index.js          # Renderer entry point
│   └── shared/
│       ├── constants.js      # Shared constants
│       └── types.js          # Type definitions
├── assets/                   # Images and icons
├── data/                     # Local data cache
├── tests/                    # Test suite
└── package.json
```

## Implementation Plan

### Phase 1: Core Infrastructure (Weeks 1-2)
- Set up Electron application framework
- Implement basic overlay functionality
- Create data fetching and caching systems
- Build screen capture and image recognition modules

### Phase 2: Game State Detection (Weeks 3-4)
- Implement unit recognition on board and bench
- Develop item detection algorithm
- Create economy tracking system
- Build trait activation detection

### Phase 3: Recommendation Engine (Weeks 5-6)
- Develop team composition recommendation algorithm
- Implement item optimization logic
- Create augment selection advisor
- Build positioning recommendation system

### Phase 4: UI Development (Weeks 7-8)
- Design and implement main overlay interface
- Create interactive components for user input
- Develop settings and configuration panels
- Optimize UI performance and responsiveness

### Phase 5: Testing and Optimization (Weeks 9-10)
- Comprehensive testing across different game scenarios
- Performance optimization for minimal game impact
- User testing and feedback collection
- Bug fixing and stability improvements
