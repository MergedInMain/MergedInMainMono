# Highroll TFT Overlay

A TeamFight Tactics (TFT) overlay application that provides real-time analysis and recommendations during gameplay.

## Features

- Real-time game state analysis
- Team composition recommendations
- Item optimization suggestions
- Augment recommendations
- Champion positioning advice
- Match history tracking
- Performance analytics

## Monorepo Integration

This application is part of the MergedInMainMono repository and follows the monorepo architecture. It is integrated with the TFT composition scraper service, which provides up-to-date team composition data from tactics.tools.

## Prerequisites

- Node.js 18+
- Bun 1.2.12+
- Electron 36+

## Development

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/MergedInMain/MergedInMainMono.git
   cd MergedInMainMono
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp apps/highroll/.env.example apps/highroll/.env
   ```

### Running the Application

To run the application in development mode:

```bash
# From the root of the monorepo
bun run dev:highroll

# Or from the highroll directory
cd apps/highroll
bun run dev
```

### Building the Application

To build the application:

```bash
# From the root of the monorepo
bun run build:highroll

# Or from the highroll directory
cd apps/highroll
bun run build
```

### Packaging the Application

To package the application for distribution:

```bash
# From the highroll directory
cd apps/highroll
bun run package
```

This will create installers for Windows, macOS, and Linux in the `release` directory.

## Integration with TFT Composition Scraper

The Highroll app integrates with the TFT composition scraper service to provide up-to-date team composition data. The service is located in the `services/tft-composition-scraper` directory.

To run the TFT composition scraper service:

```bash
# From the root of the monorepo
cd services/tft-composition-scraper
bun run dev
```

The service will be available at `http://localhost:3000/api`.

## License

MIT