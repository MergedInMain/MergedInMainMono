# FundMoney

FundMoney is a minimalistic multi-platform budgeting app with calendar features for tracking expenses and income.

## Features

- Track expenses and income
- Calendar view for visualizing transactions
- Categorize transactions
- Multiple account support
- Budget tracking

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
bun dev
```

Or to run just this app:

```bash
# From the monorepo root
bun dev --filter=fundmoney

# Or from the app directory
cd apps/fundmoney
bun dev
```

### Building

```bash
# From the monorepo root
bun build --filter=fundmoney
```

## Mobile Development

This is an Expo React Native app that can be run on iOS, Android, and web.

```bash
# Run on iOS
bun ios

# Run on Android
bun android

# Run on web
bun web
```

## Testing with Sample Data

The app includes sample data for testing. You can load this data from the home screen by clicking the "Load Test Data" button.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
