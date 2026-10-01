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

const FIELD_OPTIONS: RegionSettingsFieldOptions = {
  timezone: [
    { label: 'London (GMT/BST)', value: 'Europe/London' },
    { label: 'Nicosia (EET/EEST)', value: 'Asia/Nicosia' },
    { label: 'São Paulo (BRT)', value: 'America/Sao_Paulo' },
  ],
  language: [
    { label: 'English (UK)', value: 'en-GB' },
    { label: 'English (US)', value: 'en-US' },
    { label: 'Greek', value: 'el-CY' },
  ],
  locale: [
    { label: 'English (UK)', value: 'en-GB' },
    { label: 'English (US)', value: 'en-US' },
    { label: 'Greek (Cyprus)', value: 'el-CY' },
  ],
  currency: [
    { label: 'British Pound (£)', value: 'GBP' },
    { label: 'Euro (€)', value: 'EUR' },
    { label: 'US Dollar ($)', value: 'USD' },
  ],
  // ThemeField's values are always 'light'/'dark' (each tied to its own fixed icon) — this only
  // supplies the label text for each, same mechanism as the four fields above.
  theme: [
    { label: 'Day', value: 'light' },
    { label: 'Night', value: 'dark' },
  ],
};

const FIELD_HINTS: RegionSettingsFieldHints = {
  locale: 'Changes how dates are typed and shown — e.g. US: MM/DD/YYYY, UK: DD/MM/YYYY.',
};

@Component({
  selector: 'app-region-settings-demo',
  standalone: true,
  imports: [RegionSettingsFormComponent, JsonPipe],
  templateUrl: './region-settings-demo.component.html',
  styleUrls: ['./region-settings-demo.component.css'],
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
