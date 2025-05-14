# TFT Composition Scraper

A service for the Highroll program that scrapes and processes TFT (Teamfight Tactics) team composition data from tactics.tools.

## Features

- Scrapes top team compositions from tactics.tools
- Extracts key statistics for each composition (name, average placement, win rate, etc.)
- Collects information about required champions, items, and traits
- Stores data in a structured JSON format
- Implements rate limiting and error handling
- Provides a scheduler for periodic updates
- Exposes API endpoints to access the data

## Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

The service can be configured using environment variables or by modifying the `config.ts` file:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port for the API server | `3000` |
| `HOST` | Host for the API server | `localhost` |
| `TFT_PATCH_VERSION` | TFT patch version to scrape | `current` |
| `TFT_RANK_FILTER` | Rank filter for compositions | `Diamond+` |
| `MAX_COMPOSITIONS` | Maximum number of compositions to scrape | `20` |
| `REQUEST_DELAY` | Delay between requests in milliseconds | `2000` |
| `MAX_RETRIES` | Maximum number of retry attempts | `3` |
| `DATA_DIR` | Directory to store data | `./data` |
| `SCHEDULER_ENABLED` | Enable the scheduler | `false` |
| `CRON_EXPRESSION` | Cron expression for the scheduler | `0 0 * * *` (daily at midnight) |
| `TIMEZONE` | Timezone for the scheduler | `UTC` |
| `LOG_LEVEL` | Logging level | `info` |

## Usage

### Running the Service

```bash
# Start the service
npm start

# Run in development mode
npm run dev

# Run the scraper manually
npm run scrape
```

### API Endpoints

The service exposes the following API endpoints:

#### Get All Compositions

```
GET /api/compositions
```

Query parameters:
- `type`: Filter by composition type
- `minWinRate`: Filter by minimum win rate
- `maxAvgPlace`: Filter by maximum average placement
- `sortBy`: Sort by field (winRate, avgPlace, playRate, top4)
- `sortOrder`: Sort order (asc, desc)
- `limit`: Limit the number of results

#### Get Composition by ID

```
GET /api/compositions/:id
```

#### Search Compositions

```
GET /api/compositions/search?q=<query>
```

#### Manually Trigger Scraper

```
POST /api/scrape
```

#### Get Service Status

```
GET /api/status
```

#### Control Scheduler

```
POST /api/scheduler/start
POST /api/scheduler/stop
```

## Data Schema

The service uses a structured JSON schema for storing team composition data. See the [schema.json](./docs/schema.json) file for the complete schema definition.

### Example Composition Object

```json
{
  "id": "syndicate-twisted-fate-braum",
  "name": "Syndicate Twisted Fate & Braum",
  "type": "Syndicate",
  "stats": {
    "playRate": 0.27,
    "averagePlacement": 4.21,
    "top4Percentage": 57.2,
    "winPercentage": 8.83
  },
  "playstyle": {
    "type": "Level 6 Reroll",
    "description": "Consistent"
  },
  "units": [
    {
      "name": "Twisted Fate",
      "starLevel": 3,
      "isCore": true,
      "items": [
        {
          "name": "Guinsoo's Rageblade",
          "playRate": 91.1,
          "averagePlacement": 4.21,
          "placementDelta": -0.07
        },
        {
          "name": "Hextech Gunblade",
          "playRate": 73.8,
          "averagePlacement": 4.10,
          "placementDelta": -0.43
        },
        {
          "name": "Archangel's Staff",
          "playRate": 58.8,
          "averagePlacement": 4.17,
          "placementDelta": -0.12
        }
      ],
      "playRate": 100,
      "averagePlacement": 4.22
    },
    // More units...
  ],
  "traits": [
    {
      "name": "Syndicate",
      "activeLevel": 5,
      "totalLevel": 5,
      "playRate": 89.6,
      "averagePlacement": 4.12
    },
    // More traits...
  ],
  "lastUpdated": "2023-11-15T12:00:00.000Z",
  "teamBuilderUrl": "https://tactics.tools/team-builder/XCXAJVbBNWsCUXaYfZ"
}
```

## Integration with Highroll

To integrate this service with the Highroll project, you can:

1. Import the composition data using the API endpoints
2. Use the data to display team compositions in the Highroll UI
3. Filter and sort compositions based on user preferences
4. Show detailed information about each composition, including champions, items, and traits

Example code for fetching compositions:

```typescript
import axios from 'axios';

async function getTopCompositions(limit = 10) {
  try {
    const response = await axios.get('http://localhost:3000/api/compositions', {
      params: {
        sortBy: 'avgPlace',
        sortOrder: 'asc',
        limit
      }
    });
    
    return response.data.compositions;
  } catch (error) {
    console.error('Error fetching compositions:', error);
    return [];
  }
}
```

## Testing

```bash
# Run tests
npm test
```

## License

This project is part of the Highroll program and is subject to its licensing terms.
