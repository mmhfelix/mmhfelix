import Constants from 'expo-constants';

/**
 * Analytics facade.
 *
 * We don't pull PostHog as a hard dependency in the MVP — this lets
 * us ship without blocking on consent flows. Wire `posthogApiKey` in
 * app.json to start emitting events.
 *
 * The API is deliberately thin (`track` + `identify`) so swapping
 * providers (Amplitude, RudderStack, first-party) is a one-file edit.
 */
type Props = Record<string, string | number | boolean | null | undefined>;

let apiKey: string | undefined;

export function initAnalytics(): void {
  const extra = (Constants.expoConfig?.extra ?? {}) as {
    posthogApiKey?: string;
  };
  apiKey = extra.posthogApiKey || process.env.EXPO_PUBLIC_POSTHOG_KEY;
}

export function track(event: string, props?: Props): void {
  if (!apiKey) {
    if (__DEV__) {
      // Dev-only breadcrumb to sanity-check event firing order.
      console.log(`[analytics:dev] ${event}`, props ?? {});
    }
    return;
  }
  // Minimal fetch-based emit. A real integration would batch and
  // respect offline state, but for MVP a best-effort POST is fine.
  void fetch('https://app.posthog.com/capture/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      event,
      properties: { ...props, $lib: 'kidsketch-expo' },
      timestamp: new Date().toISOString(),
    }),
  }).catch(() => {
    // Analytics failures must never surface to kids.
  });
}

/** Named events we already know we want (keeps call-sites typo-proof). */
export const AnalyticsEvents = {
  AppOpen: 'app_open',
  StyleSelected: 'style_selected',
  PhotoPicked: 'photo_picked',
  CameraOpened: 'camera_opened',
  TransformStarted: 'transform_started',
  TransformSucceeded: 'transform_succeeded',
  TransformFailed: 'transform_failed',
  PaywallShown: 'paywall_shown',
  SubscriptionStarted: 'subscription_started',
  ColoringSaved: 'coloring_saved',
  PrintTapped: 'print_tapped',
  ShareTapped: 'share_tapped',
  DailyThemeOpened: 'daily_theme_opened',
} as const;
