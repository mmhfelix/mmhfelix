import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

import { initAnalytics, track, AnalyticsEvents } from '@/services/analytics';
import { initRevenueCat } from '@/services/revenuecat';
import { ensureArtDir } from '@/services/storage';
import { colors } from '@/theme';

/**
 * Root layout.
 *
 * Responsibilities:
 *  - Mount gesture/safe-area providers exactly once.
 *  - Kick off analytics + RC + file-system bootstrap.
 *  - Hide the splash screen only after bootstrap completes so the
 *    first paint is never a blank paper-white screen.
 */

// Keep the splash up while we warm caches. If anything throws we still
// hide it in the effect's catch block so the app never hangs.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    (async () => {
      try {
        initAnalytics();
        await Promise.all([initRevenueCat(), ensureArtDir()]);
        track(AnalyticsEvents.AppOpen);
      } finally {
        await SplashScreen.hideAsync().catch(() => {});
      }
    })();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.paper }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.paper },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="result"
            options={{ presentation: 'modal', headerShown: false }}
          />
          <Stack.Screen
            name="canvas/[id]"
            options={{ presentation: 'card', headerShown: false }}
          />
          <Stack.Screen
            name="paywall"
            options={{ presentation: 'modal', headerShown: false }}
          />
          <Stack.Screen
            name="parental"
            options={{ presentation: 'modal', headerShown: false }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
