import * as MediaLibrary from 'expo-media-library';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

/**
 * Save / print / share utilities.
 *
 * All three follow the "platform-native first" rule — we hand off to
 * the OS dialog rather than rolling a custom share sheet, which keeps
 * us COPPA-friendly (no in-app social integrations) and also avoids
 * maintenance burden around WhatsApp / Instagram / WeChat SDKs.
 */

export async function saveToCameraRoll(fileUri: string): Promise<'saved' | 'denied'> {
  const perm = await MediaLibrary.requestPermissionsAsync();
  if (!perm.granted) return 'denied';
  await MediaLibrary.saveToLibraryAsync(fileUri);
  return 'saved';
}

/**
 * Emit a letter-sized PDF from a single image so AirPrint / Google
 * Cloud Print render at high DPI. We center-fit the image inside a
 * 8.5×11in page with a 0.5in margin for kid-friendly printing.
 */
export async function printImage(fileUri: string): Promise<void> {
  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <style>
          @page { size: letter; margin: 0.5in; }
          body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
          img { max-width: 100%; max-height: 100%; object-fit: contain; }
        </style>
      </head>
      <body>
        <img src="${fileUri}" />
      </body>
    </html>
  `;
  await Print.printAsync({ html });
}

export async function shareImage(fileUri: string): Promise<void> {
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) return;
  await Sharing.shareAsync(fileUri, {
    dialogTitle: 'Share coloring page',
    mimeType: 'image/png',
    UTI: 'public.png',
  });
}
