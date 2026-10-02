import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import {
  RegionSettingsFormComponent,
  type RegionSettingsFieldHints,
  type RegionSettingsFieldOptions,
  type RegionSettingsPayload,
} from '@wiltech-labs/ngx-region-settings';

// Hardcoded, in-memory stand-in for what RegionSettingsStore.options()/settings() would otherwise
// fetch from a real API — this demo has no backend. Labels here are already "translated" (distinct
// from the raw codes bound as each option's value) to show that RegionSettingsFormComponent only
// renders what it's given; it never decides what a label says.
const INITIAL_SETTINGS: RegionSettingsPayload = {
  timezone: 'Europe/London',
  language: 'en-GB',
  locale: 'en-GB',
  currency: 'GBP',
  theme: 'light',
};

// Format previews, appended to each option's label by the browser's own Intl — no backend, and no
// change to RegionSettingsFormComponent (it renders whatever label it's given). Only the name part
// of a label needs translating; the sample itself is locale-formatted, not translated.
// Fixed sample: 31 Dec, 14:30 — the day > 12 makes DD/MM vs MM/DD obvious.
const SAMPLE_DATE = new Date(2026, 11, 31, 14, 30);
const SAMPLE_NUMBER = 1234.56;
// Currency previews can't follow the locale the user is picking in the other field (labels are
// built once), so they use the app's own display locale.
const PREVIEW_LOCALE = 'en-GB';

function localePreview(locale: string): string {
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(SAMPLE_DATE);
  const time = new Intl.DateTimeFormat(locale, { timeStyle: 'short' }).format(SAMPLE_DATE);
  const number = new Intl.NumberFormat(locale).format(SAMPLE_NUMBER);
  return `${date} · ${time} · ${number}`;
}

function timezonePreview(timeZone: string): string {
  return new Intl.DateTimeFormat(PREVIEW_LOCALE, { timeStyle: 'short', timeZone }).format(
    new Date(),
  );
}

function currencyPreview(currency: string): string {
  return new Intl.NumberFormat(PREVIEW_LOCALE, { style: 'currency', currency }).format(
    SAMPLE_NUMBER,
  );
}

function withPreview(
  options: { label: string; value: string }[],
  preview: (value: string) => string,
): { label: string; value: string }[] {
  return options.map((option) => ({
    ...option,
    label: `${option.label} — ${preview(option.value)}`,
  }));
}

const FIELD_OPTIONS: RegionSettingsFieldOptions = {
  timezone: withPreview(
    [
      { label: 'London (GMT/BST)', value: 'Europe/London' },
      { label: 'Nicosia (EET/EEST)', value: 'Asia/Nicosia' },
      { label: 'São Paulo (BRT)', value: 'America/Sao_Paulo' },
    ],
    timezonePreview,
  ),
  language: [
    { label: 'English (UK)', value: 'en-GB' },
    { label: 'English (US)', value: 'en-US' },
    { label: 'Greek', value: 'el-CY' },
  ],
  locale: withPreview(
    [
      { label: 'English (UK)', value: 'en-GB' },
      { label: 'English (US)', value: 'en-US' },
      { label: 'Greek (Cyprus)', value: 'el-CY' },
    ],
    localePreview,
  ),
  currency: withPreview(
    [
      { label: 'British Pound', value: 'GBP' },
      { label: 'Euro', value: 'EUR' },
      { label: 'US Dollar', value: 'USD' },
    ],
    currencyPreview,
  ),
  // ThemeField's values are always 'light'/'dark'/'system' (each tied to its own fixed icon) — this only
  // supplies the label text for each, same mechanism as the four fields above.
  theme: [
    { label: 'Day', value: 'light' },
    { label: 'Night', value: 'dark' },
    { label: 'Auto', value: 'system' },
  ],
};

const FIELD_HINTS: RegionSettingsFieldHints = {
  locale:
    'Changes how dates, times and numbers are typed and shown — each option shows an example.',
};

@Component({
  selector: 'app-region-settings-demo',
  standalone: true,
  imports: [RegionSettingsFormComponent, JsonPipe],
  templateUrl: './region-settings-demo.component.html',
  styleUrl: './region-settings-demo.component.scss',
})
export class RegionSettingsDemoComponent {
  protected readonly settings = signal<RegionSettingsPayload>(INITIAL_SETTINGS);
  protected readonly options = signal<RegionSettingsFieldOptions>(FIELD_OPTIONS);
  protected readonly hints = signal<RegionSettingsFieldHints>(FIELD_HINTS);
  protected readonly saving = signal(false);
  protected readonly lastSaved = signal<RegionSettingsPayload | null>(null);

  protected handleSave(payload: RegionSettingsPayload): void {
    this.saving.set(true);

    // No backend here — simulate the round trip a real RegionSettingsStore.save() would make.
    setTimeout(() => {
      this.settings.set(payload);
      this.lastSaved.set(payload);
      this.saving.set(false);
    }, 600);
  }
}
