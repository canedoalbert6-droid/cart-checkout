import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { CartProvider, useCart } from '../src/context/CartContext';
import { initDB } from '../src/db/sqlite';
import { OfflineBanner } from '../src/components/OfflineBanner';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const [dbReady, setDbReady] = useState(false);
  const [initialOnboardingComplete, setInitialOnboardingComplete] = useState<boolean | null>(null);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    async function setup() {
      try {
        const db = await initDB();
        const setting = await db.getFirstAsync<{value: string}>('SELECT value FROM settings WHERE key = ?', ['onboarding_complete']);
        setInitialOnboardingComplete(setting?.value === 'true');
        setDbReady(true);
      } catch (e) {
        console.error("Failed to initialize DB", e);
      }
    }
    setup();
  }, []);

  useEffect(() => {
    if (loaded && dbReady && initialOnboardingComplete !== null) {
      SplashScreen.hideAsync();
    }
  }, [loaded, dbReady, initialOnboardingComplete]);

  if (!loaded || !dbReady || initialOnboardingComplete === null) {
    return null;
  }

  return (
    <CartProvider initialOnboardingComplete={initialOnboardingComplete}>
      <OfflineBanner />
      <RootLayoutNav />
    </CartProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { onboardingComplete } = useCart();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (onboardingComplete !== null) {
      const inOnboarding = segments[0] === 'onboarding';

      if (!onboardingComplete && !inOnboarding) {
        setTimeout(() => router.replace('/onboarding'), 1);
      } else if (onboardingComplete && inOnboarding) {
        setTimeout(() => router.replace('/(tabs)'), 1);
      }
    }
  }, [onboardingComplete, segments[0]]); // Only depend on the first segment for stability

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ animation: 'fade' }}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="conflict-resolution" options={{ presentation: 'modal', title: 'Conflict Resolution' }} />
      </Stack>
    </ThemeProvider>
  );
}
