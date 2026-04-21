import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';

import type { StylePreset } from '@/constants/styles';

/**
 * AI provider wrapper.
 *
 * Goals:
 *  - Hide whether we're calling Replicate, Stability, or a proxy of
 *    our own — the rest of the app only sees {uri}.
 *  - Fail loud and early with typed errors so the UI layer can map
 *    them to friendly mascot states.
 *  - Run with a graceful "mock" fallback when no API token is
 *    configured so the app is runnable on day one without a billing
 *    account.
 */
export type AiError =
  | { kind: 'no-token' }
  | { kind: 'network'; message: string }
  | { kind: 'timeout' }
  | { kind: 'safety'; message: string }
  | { kind: 'unknown'; message: string };

export class AiFailure extends Error {
  readonly detail: AiError;
  constructor(detail: AiError) {
    super(describeAiError(detail));
    this.detail = detail;
  }
}

export function describeAiError(e: AiError): string {
  switch (e.kind) {
    case 'no-token':
      return 'AI provider is not configured. Using a placeholder picture.';
    case 'network':
      return `Network problem: ${e.message}`;
    case 'timeout':
      return 'The artist took too long. Please try again.';
    case 'safety':
      return e.message;
    case 'unknown':
      return e.message;
  }
}

type TransformArgs = {
  sourceUri: string;
  preset: StylePreset;
  signal?: AbortSignal;
};

type TransformResult = { uri: string; provider: 'replicate' | 'stability' | 'mock' };

/** Hard cap — if a provider exceeds this we abort and surface a timeout. */
const REQUEST_TIMEOUT_MS = 30_000;

/**
 * Transform a source photo into a coloring page.
 *
 * The real provider call is stubbed into `callReplicate` — wire the
 * token via `app.json > extra.replicateApiToken` or an env-var at
 * build time. When no token is present we return the source image as
 * the "result" so the rest of the flow can be demoed end-to-end.
 */
export async function transformToColoringPage(
  args: TransformArgs
): Promise<TransformResult> {
  const token = getReplicateToken();
  if (!token) {
    return mockTransform(args);
  }
  try {
    return await withTimeout(callReplicate(args, token), REQUEST_TIMEOUT_MS);
  } catch (err) {
    if (err instanceof AiFailure) throw err;
    if ((err as Error).name === 'AbortError') {
      throw new AiFailure({ kind: 'timeout' });
    }
    throw new AiFailure({
      kind: 'network',
      message: (err as Error).message ?? 'unknown',
    });
  }
}

/**
 * Replicate API call — intentionally minimal. The precise model
 * identifier + input shape will differ per preset; we keep the shape
 * generic so swapping models is a constants change, not an API change.
 */
async function callReplicate(
  { sourceUri, preset, signal }: TransformArgs,
  token: string
): Promise<TransformResult> {
  // Replicate expects a publicly-addressable image OR base64 data URL.
  // We inline as base64 so no bucket upload is needed for MVP.
  const base64 = await FileSystem.readAsStringAsync(sourceUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const dataUrl = `data:image/jpeg;base64,${base64}`;

  const res = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    signal,
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'wait=25',
    },
    body: JSON.stringify({
      // Swap per preset.model if a dedicated pixel/cbn endpoint is
      // available. For MVP we use a single image-to-sketch model.
      version: 'REPLACE_ME_WITH_MODEL_VERSION',
      input: {
        image: dataUrl,
        prompt: preset.prompt,
        negative_prompt: 'nsfw, gore, scary, weapons, violence, adult content',
        safety_checker: true,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    if (res.status === 422 && text.toLowerCase().includes('safety')) {
      throw new AiFailure({
        kind: 'safety',
        message: 'The picture could not be used. Please try another photo.',
      });
    }
    throw new AiFailure({
      kind: 'unknown',
      message: `Provider responded ${res.status}`,
    });
  }

  const json = (await res.json()) as {
    output?: string | string[];
    error?: string;
  };
  if (json.error) {
    throw new AiFailure({ kind: 'unknown', message: json.error });
  }
  const url = Array.isArray(json.output) ? json.output[0] : json.output;
  if (!url) {
    throw new AiFailure({ kind: 'unknown', message: 'Empty response' });
  }

  // Persist to local cache so downstream screens (preview, coloring,
  // share) work offline after the conversion completes.
  const localUri = await downloadToCache(url);
  return { uri: localUri, provider: 'replicate' };
}

async function mockTransform({ sourceUri }: TransformArgs): Promise<TransformResult> {
  // Mock path: we don't have a sketch model, so we just echo back the
  // source. In development this lets you click through every screen.
  // A future ImageManipulator step could produce an actual edge-detect
  // approximation locally for a nicer "no API key" demo.
  return { uri: sourceUri, provider: 'mock' };
}

async function downloadToCache(remoteUrl: string): Promise<string> {
  const fileName = `coloring-${Date.now()}.png`;
  const dest = `${FileSystem.cacheDirectory}${fileName}`;
  const { uri } = await FileSystem.downloadAsync(remoteUrl, dest);
  return uri;
}

function getReplicateToken(): string | undefined {
  const extra = (Constants.expoConfig?.extra ?? {}) as {
    replicateApiToken?: string;
  };
  const token = extra.replicateApiToken || process.env.EXPO_PUBLIC_REPLICATE_TOKEN;
  return token && token.length > 0 ? token : undefined;
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new AiFailure({ kind: 'timeout' })),
      ms
    );
    p.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}
