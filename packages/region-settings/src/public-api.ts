// The stores, models and tokens live in the `/core` entry point (no `ngx-forms` there); this one
// adds the settings form on top, and re-exports `/core` so existing imports keep working.
export * from '@wiltech-labs/ngx-region-settings/core';

export * from './lib/components/settings-form.component.js';
export * from './lib/config/settings-form-text.token.js';
