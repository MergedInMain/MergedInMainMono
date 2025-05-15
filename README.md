# MergedInMainMono Repository

This monorepo includes various applications and services maintained by the MergedInMain team.

## What's inside?

This monorepo includes the following packages/apps:

### Apps

- `docs`: a [Next.js](https://nextjs.org/) app for documentation
- `web`: a [Next.js](https://nextjs.org/) app for the main website
- `fundmoney`: a [React Native](https://reactnative.dev/) app built with [Expo](https://expo.dev/)
- `highroll`: a [Electron](https://www.electronjs.org/) app for TeamFight Tactics (TFT) overlay

### Services

- `tft-composition-scraper`: a service for scraping and processing TFT team composition data from tactics.tools

### Packages

- `@repo/ui`: a React component library shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

## Highroll TFT Overlay

The Highroll TFT Overlay is an Electron application that provides real-time analysis and recommendations during TeamFight Tactics gameplay. It integrates with the TFT composition scraper service to provide up-to-date team composition data.

### Features

- Real-time game state analysis
- Team composition recommendations
- Item optimization suggestions
- Augment recommendations
- Champion positioning advice
- Match history tracking
- Performance analytics

### Running Highroll

To run the Highroll app:

```bash
# From the root of the monorepo
bun run dev:highroll

# Or from the highroll directory
cd apps/highroll
bun run dev
```

For more information, see the [Highroll README](./apps/highroll/README.md) and the [Highroll Integration Documentation](./docs/highroll-integration.md).

## TFT Composition Scraper

The TFT composition scraper is a service that scrapes and processes TFT team composition data from tactics.tools. It provides API endpoints for accessing the data.

### Features

- Scrapes top team compositions from tactics.tools
- Extracts key statistics for each composition
- Collects information about required champions, items, and traits
- Extracts team planner codes for direct import into the TFT game client
- Stores data in a structured JSON format
- Exposes API endpoints to access the data

### Running the TFT Composition Scraper

To run the TFT composition scraper service:

```bash
# From the root of the monorepo
cd services/tft-composition-scraper
bun run dev
```

For more information, see the [TFT Composition Scraper README](./services/tft-composition-scraper/README.md).

## Utilities

This monorepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Turborepo](https://turbo.build/repo) for monorepo management

## Build

To build all apps and packages, run the following command:

```bash
bun build
```

## Develop

To develop all apps and packages, run the following command:

```bash
bun dev
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)