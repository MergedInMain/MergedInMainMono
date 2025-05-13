
## Project Overview

This document outlines the development of a Teamfight Tactics (TFT) overlay application that provides real-time analysis and recommendations during gameplay. The overlay will analyze the player's current game state including items, units, and economy to suggest optimal team compositions based on data from reputable TFT websites such as Meta TFT and tactics.tools.

## Core Features

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

## Technical Architecture

### 1. Application Structure

```plaintext
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

### 2. Technology Stack

- **Framework**: Electron (for cross-platform desktop app)
- **UI**: React with TypeScript
- **State Management**: Redux or Context API
- **Styling**: Tailwind CSS or styled-components
- **Game Integration**: Screen capture and image recognition (Tesseract.js or custom CV solution)
- **Data Storage**: Local SQLite for caching composition data

### 3. Game State Detection Methods

1. **Screen Capture Analysis**
    
    - Capture specific regions of the game screen
    - Use computer vision to detect units, items, and gold count
    - Process captured images to extract game state information
2. **Game Client API Integration (if available)**
    
    - Investigate potential direct integration with Riot Games API
    - Use available endpoints to retrieve current game state
    - Fall back to screen capture when API data is unavailable
3. **Hybrid Approach**
    
    - Combine multiple detection methods for increased accuracy
    - Implement error correction and validation logic
    - Allow manual corrections for edge cases

## Data Management

### 1. Data Sources

- **Meta TFT**: Team compositions, augment statistics, and item data
- **tactics.tools**: Detailed win rates, placement statistics, and meta analysis
- **Riot Games API**: Champion data, item information, and trait details

### 2. Data Refresh Strategy

- Fetch updated composition data once per day (or when new patch detected)
- Store data locally to minimize API calls and ensure offline functionality
- Implement version checking to update data when new patches are released

### 3. Data Processing Pipeline


```plaintext
External APIs → Data Fetcher → Data Transformer → Local Cache → Recommendation Engine → UI
```

## Recommendation Engine

### 1. Team Composition Algorithm

The recommendation engine will:

1. Analyze current board state (units, traits activated)
2. Compare with high-performing compositions from the data sources
3. Calculate similarity scores between current state and potential compositions
4. Consider remaining gold, player level, and estimated roll chances
5. Rank compositions by feasibility and expected performance

### 2. Item Optimization

- Map current items and components to optimal combinations
- Prioritize items for key carry units in recommended compositions
- Consider item flexibility and potential pivots

### 3. Augment Selection Logic

- Analyze synergy between augments and recommended compositions
- Calculate expected value of augment choices based on historical data
- Consider current game state and stage when making recommendations

## User Interface Design

### 1. Main Overlay Components

- **Team Composition Panel**: Displays recommended team comps with units and positioning
- **Item Builder**: Shows optimal item combinations and priorities
- **Augment Advisor**: Provides augment recommendations when choices are available
- **Economy Tracker**: Displays current gold, interest thresholds, and spending recommendations
- **Settings Panel**: Allows customization of overlay appearance and behavior

### 2. Visual Design Principles

- Minimalist interface that doesn't obstruct gameplay
- Clear visual hierarchy with important information easily accessible
- Consistent color coding for unit costs, trait activations, and recommendation strength
- Tooltips for additional information without cluttering the main interface

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

## Technical Challenges and Solutions

### 1. Screen Recognition Accuracy

**Challenge**: Accurately detecting units, items, and game state from screen captures.

**Solution**:

- Use template matching with a comprehensive library of unit and item images
- Implement confidence thresholds for detection results
- Allow manual corrections and feedback to improve recognition over time
- Consider implementing machine learning models for improved accuracy

### 2. Performance Optimization

**Challenge**: Ensuring the overlay doesn't impact game performance.

**Solution**:

- Optimize screen capture frequency and resolution
- Implement efficient image processing algorithms
- Use worker threads for CPU-intensive tasks
- Cache recognition results to reduce redundant processing

### 3. Game Client Updates

**Challenge**: Maintaining compatibility when TFT updates occur.

**Solution**:

- Design a modular system that can be quickly updated
- Implement version detection to adapt to game changes
- Create an update mechanism for recognition templates
- Monitor game patches and proactively update the application

## Security and Privacy Considerations

1. **Client-Side Processing**: All game state analysis happens locally on the user's machine
2. **Minimal Data Collection**: Only collect anonymous usage statistics with opt-in consent
3. **Transparency**: Open documentation about all data used by the application
4. **Compliance**: Ensure adherence to Riot Games' third-party application policies

## Future Enhancements

1. **Advanced Features**
    
    - Historical performance tracking and analysis
    - Opponent scouting and composition tracking
    - Probability calculations for finding specific units
2. **Expanded Integrations**
    
    - Integration with additional data sources
    - Support for multiple languages and regions
    - Synchronization with cloud services for settings backup
3. **Community Features**
    
    - User-contributed team compositions
    - Sharing of custom recommendations
    - Integration with educational content

## Conclusion

This TFT overlay application will provide players with valuable real-time insights and recommendations to improve their gameplay experience. By leveraging data from reputable sources and implementing sophisticated analysis algorithms, the overlay will help players make informed decisions about team compositions, items, and augments while maintaining a non-intrusive presence during gameplay.

The client-side architecture ensures privacy and performance while still providing up-to-date recommendations based on the latest meta information. With a phased implementation approach, the development team can systematically build and refine each component of the application to deliver a polished and valuable tool for TFT players.