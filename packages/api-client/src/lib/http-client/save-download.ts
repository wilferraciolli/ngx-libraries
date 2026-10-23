import type { ApiDownload } from './api-client.service.js';

/**
 * Hands a downloaded file to the browser to save, under the server's suggested name or
 * `fallbackName`. Call it from the click that asked for the file, so the browser allows it.
 */
export function saveDownload(download: ApiDownload, fallbackName: string): void {
  const url = URL.createObjectURL(download.blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = download.filename ?? fallbackName;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Revoke after the click has been handled; revoking at once can cancel the download in Safari.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
