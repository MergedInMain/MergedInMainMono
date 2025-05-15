# Highroll App Integration into Monorepo

This document outlines the process of integrating the Highroll TFT Overlay application into the MergedInMainMono repository.

## Integration Steps

### 1. Directory Structure

The Highroll app is located in the `apps/highroll` directory, and the TFT composition scraper service is located in the `services/tft-composition-scraper` directory.

```
MergedInMainMono/
├── apps/
│   ├── docs/
│   ├── fundmoney/
│   ├── highroll/
│   │   ├── assets/
│   │   ├── data/
│   │   ├── dist/
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── main/
│   │   │   ├── renderer/
│   │   │   └── shared/
│   │   ├── tests/
│   │   ├── .env
│   │   ├── .env.example
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── ...
│   └── web/
├── packages/
│   ├── eslint-config/
│   ├── typescript-config/
│   └── ui/
├── services/
│   └── tft-composition-scraper/
│       ├── data/
│       ├── dist/
│       ├── docs/
│       ├── logs/
│       ├── src/
│       │   ├── api/
│       │   ├── models/
│       │   ├── scrapers/
│       │   └── utils/
│       ├── tests/
│       ├── .env
│       ├── package.json
│       ├── tsconfig.json
│       └── ...
├── package.json
├── turbo.json
└── ...
```

### 2. Package Configuration

#### Root package.json

Updated the root `package.json` to include the `services` directory in the workspaces:

```json
{
  "workspaces": [
    "apps/*",
    "packages/*",
    "services/*"
  ]
}
```

#### Highroll package.json

Updated the Highroll app's `package.json` to follow the monorepo naming convention and include the necessary dependencies and scripts:

```json
{
  "name": "@repo/highroll",
  "version": "1.0.0",
  "scripts": {
    "dev": "concurrently \"bun run dev:react\" \"bun run dev:electron\"",
    "build": "bun build src/main/main.js --outdir dist/main && bun build src/renderer/index.tsx --outdir dist/renderer",
    "lint": "eslint . --ext .ts,.tsx",
    "check-types": "tsc --noEmit"
  },
  "devDependencies": {
    "@repo/eslint-config": "*",
    "@repo/typescript-config": "*"
  }
}
```

#### TFT Composition Scraper package.json

Updated the TFT composition scraper service's `package.json` to follow the monorepo naming convention and include the necessary dependencies and scripts:

```json
{
  "name": "@repo/tft-composition-scraper",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "dev": "ts-node src/index.ts",
    "lint": "eslint . --ext .ts",
    "check-types": "tsc --noEmit"
  },
  "devDependencies": {
    "@repo/eslint-config": "*",
    "@repo/typescript-config": "*"
  }
}
```

### 3. TypeScript Configuration

#### Highroll tsconfig.json

Updated the Highroll app's `tsconfig.json` to extend from the monorepo's base tsconfig:

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### TFT Composition Scraper tsconfig.json

Updated the TFT composition scraper service's `tsconfig.json` to extend from the monorepo's base tsconfig:

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

### 4. Turborepo Configuration

Updated the `turbo.json` file to include the Highroll app and TFT composition scraper service:

```json
{
  "tasks": {
    "highroll": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["tft-composition-scraper#dev"]
    },
    "tft-composition-scraper": {
      "cache": false,
      "persistent": true
    }
  },
  "pipeline": {
    "dev:highroll": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["tft-composition-scraper#dev"]
    },
    "build:highroll": {
      "dependsOn": ["^build", "tft-composition-scraper#build"]
    }
  }
}
```

### 5. Service Integration

Created a new module in the Highroll app to connect to the TFT composition scraper service:

```typescript
// apps/highroll/src/renderer/services/tft-scraper-api.ts

import { TeamComp, ApiResponse } from '../../shared/types';

// Constants
const TFT_SCRAPER_API_URL = process.env.TFT_SCRAPER_API_URL || 'http://localhost:3000/api';

/**
 * Fetch team compositions from the TFT composition scraper service
 */
export const fetchTeamCompositions = async (options = {}): Promise<ApiResponse<TeamComp[]>> => {
  // Implementation
};

/**
 * Search for team compositions by name or champion
 */
export const searchTeamCompositions = async (query: string): Promise<ApiResponse<TeamComp[]>> => {
  // Implementation
};

/**
 * Manually trigger the scraper to update the data
 */
export const triggerScraper = async (): Promise<ApiResponse<{ message: string; count: number }>> => {
  // Implementation
};

/**
 * Get the status of the scraper service
 */
export const getScraperStatus = async (): Promise<ApiResponse<{
  status: string;
  lastUpdate: string | null;
  patchVersion: string | null;
  compositionCount: number;
  nextScheduledRun: string | null;
}>> => {
  // Implementation
};
```

### 6. Environment Configuration

Created `.env` and `.env.example` files for the Highroll app to configure the TFT composition scraper service URL:

```
# TFT Composition Scraper Service URL
TFT_SCRAPER_API_URL=http://localhost:3000/api

# Environment
NODE_ENV=development
```

## Running the Integrated Application

To run the integrated application:

```bash
# From the root of the monorepo
bun run dev:highroll

# Or from the highroll directory
cd apps/highroll
bun run dev
```

This will start both the Highroll app and the TFT composition scraper service.

## Building the Integrated Application

To build the integrated application:

```bash
# From the root of the monorepo
bun run build:highroll

# Or from the highroll directory
cd apps/highroll
bun run build
```

This will build both the Highroll app and the TFT composition scraper service.

## Conclusion

The Highroll app has been successfully integrated into the MergedInMainMono repository. The app can now be developed, built, and deployed as part of the monorepo, and it can communicate with the TFT composition scraper service to provide up-to-date team composition data.