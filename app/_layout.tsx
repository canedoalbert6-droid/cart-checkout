import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { CartProvider, useCart } from '../src/context/CartContext';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { initDB } from '../src/db/sqlite';
import { OfflineBanner } from '../src/components/OfflineBanner';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(drawer)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const [dbReady, setDbReady] = useState(false);
  const [initialOnboardingComplete, setInitialOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    async function setup() {
      try {
        const db = await initDB();
        const setting = await db.getFirstAsync<{ value: string }>(
          'SELECT value FROM settings WHERE key = ?',
          ['onboarding_complete']
        );
        setInitialOnboardingComplete(setting?.value === 'true');
        setDbReady(true);
      } catch (e) {
        console.error('Failed to initialize DB', e);
        setDbReady(true);
        setInitialOnboardingComplete(false);
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
    <AuthProvider>
      <CartProvider initialOnboardingComplete={initialOnboardingComplete}>
        <OfflineBanner />
        <RootLayoutNav />
      </CartProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const { onboardingComplete } = useCart();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!user && !inAuth) {
      // Not logged in → go to login
      setTimeout(() => router.replace('/(auth)/login'), 1);
    } else if (user && inAuth) {
      // Logged in but on auth screen → go to app
      if (!onboardingComplete) {
        setTimeout(() => router.replace('/onboarding'), 1);
      } else {
        setTimeout(() => router.replace('/(drawer)'), 1);
      }
    } else if (user && !inAuth && !inOnboarding && onboardingComplete === false) {
      setTimeout(() => router.replace('/onboarding'), 1);
    }
  }, [user, isLoading, segments[0], onboardingComplete]);

  return (
    <Stack screenOptions={{ animation: 'fade' }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="conflict-resolution" options={{ presentation: 'modal', title: 'Conflict Resolution' }} />
      <Stack.Screen
        name="product/[id]"
        options={{ headerShown: false, presentation: 'card' }}
      />
    </Stack>
  );
}
