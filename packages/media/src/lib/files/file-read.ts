/** A file the user picked, with what an API usually needs to send it in a JSON body. */
export interface PickedFile {
  file: File;
  name: string;
  /** The browser's MIME type; '' when it doesn't know one. */
  type: string;
  size: number;
}

/** Why a file was turned away before anything was read. */
export type FileRejection = { file: File; reason: 'type' | 'size' };

/**
 * The file's bytes as base64 (no `data:` prefix), for an API that takes files in JSON
 * (`{ file_name, content_type, content_base64 }`).
 */
export function readAsBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('The file could not be read'));
    reader.onload = () => {
      const result = String(reader.result ?? '');
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Whether `file` matches an `accept` list as `<input type="file">` reads it: MIME types
 * (`application/pdf`), wildcards (`image/*`) or extensions (`.docx`), comma-separated.
 * An empty list accepts anything.
 */
export function acceptsFile(file: { name: string; type: string }, accept: string): boolean {
  const rules = accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);
  if (rules.length === 0) {
    return true;
  }
  const name = file.name.toLowerCase();
  const type = (file.type || '').toLowerCase();
  return rules.some((rule) =>
    rule.startsWith('.')
      ? name.endsWith(rule)
      : rule.endsWith('/*')
        ? type.startsWith(rule.slice(0, -1))
        : type === rule,
  );
}

/** "2.4 MB", "830 KB": a size as people read it. */
export function formatFileSize(bytes: number, locale?: string): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const digits = unit === 0 || value >= 10 ? 0 : 1;
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value)} ${units[unit]}`;
}
