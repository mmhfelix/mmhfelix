import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { LoadingOverlay } from '@/components/LoadingOverlay';

import { findPreset, type StylePresetId } from '@/constants/styles';
import { DAILY_THEMES } from '@/constants/dailyThemes';
import { colors, spacing } from '@/theme';
import { AiFailure, describeAiError, transformToColoringPage } from '@/services/ai';
import { persistImage } from '@/services/storage';
import { printImage, saveToCameraRoll, shareImage } from '@/services/export';
import { useArtworksStore } from '@/store/artworks';
import { useQuota } from '@/hooks/useQuota';
import { AnalyticsEvents, track } from '@/services/analytics';

/**
 * AI result preview.
 *
 * This screen owns the AI round-trip:
 *  1. Takes `sourceUri` + `styleId` from route params.
 *  2. Shows LoadingOverlay while the provider runs.
 *  3. On success: persists the output, registers it in the gallery
 *     store, and offers Save / Print / Share / Color-now.
 *  4. On error: shows a mascot EmptyState with a retry.
 *
 * It *also* handles the daily-theme path (`source=daily`), which
 * bypasses the API and simply shows a shipped seed illustration.
 */
export default function ResultScreen() {
  const {
    sourceUri,
    styleId,
    themeId,
    source,
  } = useLocalSearchParams<{
    sourceUri?: string;
    styleId?: StylePresetId;
    themeId?: string;
    source?: 'photo' | 'daily';
  }>();

  const [state, setState] = useState<
    | { kind: 'loading' }
    | { kind: 'ready'; uri: string }
    | { kind: 'error'; message: string }
  >({ kind: 'loading' });

  const addArtwork = useArtworksStore((s) => s.add);
  const { consume } = useQuota();

  // Guard against double-fire in dev (strict-mode remount) and cancel
  // in-flight work on unmount.
  const didRun = useRef(false);

  const run = useCallback(async () => {
    setState({ kind: 'loading' });
    try {
      if (source === 'daily' && themeId) {
        const theme = DAILY_THEMES.find((t) => t.id === themeId);
        if (!theme) throw new AiFailure({ kind: 'unknown', message: 'Theme missing' });
        // In production this would be a bundled asset URI. For MVP we
        // reuse the emoji as a stand-in — the coloring screen is the
        // star here, not the seed art.
        const uri = 'https://dummyimage.com/1024x1024/ffffff/3d2c2e.png&text=' +
          encodeURIComponent(theme.emoji + '\n' + theme.title);
        setState({ kind: 'ready', uri });
        track(AnalyticsEvents.TransformSucceeded, { source: 'daily', theme_id: theme.id });
        return;
      }

      if (!sourceUri || !styleId) {
        throw new AiFailure({ kind: 'unknown', message: 'Missing input' });
      }
      const preset = findPreset(styleId);
      track(AnalyticsEvents.TransformStarted, { style_id: preset.id });

      const result = await transformToColoringPage({ sourceUri, preset });
      const persisted = await persistImage(result.uri, 'lineart');
      consume();

      addArtwork({ styleId: preset.id, lineArtUri: persisted });
      track(AnalyticsEvents.TransformSucceeded, {
        style_id: preset.id,
        provider: result.provider,
      });
      setState({ kind: 'ready', uri: persisted });
    } catch (err) {
      const detail =
        err instanceof AiFailure
          ? err.detail
          : { kind: 'unknown' as const, message: (err as Error).message };
      track(AnalyticsEvents.TransformFailed, { reason: detail.kind });
      setState({ kind: 'error', message: describeAiError(detail) });
    }
  }, [sourceUri, styleId, themeId, source, addArtwork, consume]);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    void run();
  }, [run]);

  async function handleSave() {
    if (state.kind !== 'ready') return;
    const result = await saveToCameraRoll(state.uri);
    track(AnalyticsEvents.ColoringSaved, { destination: 'camera_roll' });
    Alert.alert(
      result === 'saved' ? 'Saved!' : 'Permission needed',
      result === 'saved'
        ? 'The coloring page is now in your Photos.'
        : 'Please allow photo access to save the page.'
    );
  }

  async function handlePrint() {
    if (state.kind !== 'ready') return;
    track(AnalyticsEvents.PrintTapped);
    await printImage(state.uri);
  }

  async function handleShare() {
    if (state.kind !== 'ready') return;
    track(AnalyticsEvents.ShareTapped);
    await shareImage(state.uri);
  }

  function handleColor() {
    if (state.kind !== 'ready') return;
    // Find the just-added artwork so the canvas can rehydrate.
    const latest = useArtworksStore.getState().items[0];
    if (!latest) return;
    router.replace({ pathname: '/canvas/[id]', params: { id: latest.id } });
  }

  if (state.kind === 'loading') {
    return (
      <>
        <Screen>
          <View style={styles.header}>
            <Txt variant="display">Drawing…</Txt>
            <Txt variant="body" color={colors.inkSoft}>
              This usually takes a few seconds.
            </Txt>
          </View>
        </Screen>
        <LoadingOverlay visible caption="Turning your photo into magic…" />
      </>
    );
  }

  if (state.kind === 'error') {
    return (
      <Screen>
        <EmptyState
          emoji="😢"
          title="The paintbrush got stuck"
          caption={state.message}
          action={<Button label="Try again" onPress={run} />}
        />
        <View style={styles.centerBack}>
          <Button label="Back" variant="ghost" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Txt variant="display">Tada!</Txt>
        <Txt variant="body" color={colors.inkSoft}>
          Save, print, share, or start coloring.
        </Txt>
      </View>

      <Card tone="paper" style={styles.previewCard}>
        <Image source={{ uri: state.uri }} style={styles.preview} contentFit="contain" />
      </Card>

      <Button
        label="Start coloring"
        onPress={handleColor}
        fullWidth
        style={{ marginTop: spacing.lg }}
      />

      <View style={styles.actionRow}>
        <Button
          label="Save"
          variant="secondary"
          onPress={handleSave}
          style={styles.actionBtn}
        />
        <Button
          label="Print"
          variant="secondary"
          onPress={handlePrint}
          style={styles.actionBtn}
        />
        <Button
          label="Share"
          variant="secondary"
          onPress={handleShare}
          style={styles.actionBtn}
        />
      </View>

      <Button label="Close" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.xl, paddingBottom: spacing.md },
  previewCard: { aspectRatio: 1, overflow: 'hidden', padding: spacing.sm },
  preview: { flex: 1, width: '100%', backgroundColor: colors.white },
  actionRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  actionBtn: { flex: 1, marginHorizontal: spacing.xs },
  centerBack: { marginVertical: spacing.lg, alignItems: 'center' },
});
