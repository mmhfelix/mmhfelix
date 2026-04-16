import * as FileSystem from 'expo-file-system';

/**
 * Thin file-system helpers for moving AI cache outputs into the app's
 * long-lived document directory. We keep a dedicated folder per
 * artifact type so cleanup (cache eviction, user "delete all") is
 * scoped and cheap.
 */
const ART_DIR = `${FileSystem.documentDirectory}artworks/`;

export async function ensureArtDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(ART_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(ART_DIR, { intermediates: true });
  }
}

/**
 * Copy a volatile URI (typically from the cache dir or image picker)
 * into a stable, backed-up location. Returns the new file:// URI.
 */
export async function persistImage(sourceUri: string, prefix = 'art'): Promise<string> {
  await ensureArtDir();
  const ext = inferExtension(sourceUri);
  const dest = `${ART_DIR}${prefix}-${Date.now()}.${ext}`;
  await FileSystem.copyAsync({ from: sourceUri, to: dest });
  return dest;
}

export async function deleteIfExists(uri: string): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // Best-effort cleanup; never throw during deletion.
  }
}

function inferExtension(uri: string): string {
  const match = /\.([a-zA-Z0-9]+)(?:\?|$)/.exec(uri);
  return match ? match[1]!.toLowerCase() : 'png';
}
