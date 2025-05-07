import { Slot } from 'expo-router';
import { AppProvider } from '@/context/AppContext';
import { Stack } from 'expo-router/stack';

// This file serves as the root layout for the app
// It's required for static rendering in expo-router
export default function Root() {
  return (
    <AppProvider>
      {/* Use Stack as a fallback for static rendering */}
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="calendar" options={{ headerShown: false }} />
      </Stack>
      <Slot />
    </AppProvider>
  );
}

// Export static routes for expo-router
export const routeNames = ['index', 'calendar'];
