import { Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { form } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { RegionSettingsPayload } from '../models/region-settings.model';
import { ValueViewValue } from '@wiltech-labs/ngx-api-client';
import { SelectField, type FieldOption } from '@wiltech-labs/ngx-forms';
import { NGX_REGION_SETTINGS_FORM_TEXT } from '../config/settings-form-text.token';

type RegionSettingsOptions = Partial<Record<string, ValueViewValue[]>>;

function toPayload(settings: RegionSettingsPayload): RegionSettingsPayload {
  const { timezone, language, locale, currency, theme } = settings;
  return { timezone, language, locale, currency, theme };
}

@Component({
  selector: 'ngx-region-settings-form',
  imports: [SelectField, MatButtonModule],
  templateUrl: './settings-form.component.html',
  styleUrl: './settings-form.component.scss',
})
export class RegionSettingsFormComponent {
  private readonly textResolver = inject(NGX_REGION_SETTINGS_FORM_TEXT);
  protected readonly text = computed(() => this.textResolver());

  readonly settings = input.required<RegionSettingsPayload>();
  readonly options = input.required<RegionSettingsOptions>();
  readonly saving = input(false);

  readonly save = output<RegionSettingsPayload>();

  protected readonly model = linkedSignal(() => toPayload(this.settings()));

  protected readonly changed = computed(
    () => JSON.stringify(this.model()) !== JSON.stringify(toPayload(this.settings())),
  );

  protected readonly timezoneOptions = computed<FieldOption[]>(() =>
    this.options()['timezone']?.map((v) => ({ label: v.viewValue, value: v.value })) ?? [],
  );
  protected readonly languageOptions = computed<FieldOption[]>(() =>
    this.options()['language']?.map((v) => ({ label: v.viewValue, value: v.value })) ?? [],
  );
  protected readonly localeOptions = computed<FieldOption[]>(() =>
    this.options()['locale']?.map((v) => ({ label: v.viewValue, value: v.value })) ?? [],
  );
  protected readonly currencyOptions = computed<FieldOption[]>(() =>
    this.options()['currency']?.map((v) => ({ label: v.viewValue, value: v.value })) ?? [],
  );
  protected readonly themeOptions = computed<FieldOption[]>(() =>
    this.options()['theme']?.map((v) => ({ label: v.viewValue, value: v.value })) ?? [],
  );

  protected readonly timezoneField = { name: 'timezone', type: 'select', label: 'Timezone', required: true };
  protected readonly languageField = { name: 'language', type: 'select', label: 'Language', required: true };
  protected readonly localeField = { name: 'locale', type: 'select', label: 'Locale', required: true };
  protected readonly currencyField = { name: 'currency', type: 'select', label: 'Currency', required: true };
  protected readonly themeField = { name: 'theme', type: 'select', label: 'Theme', required: true };

  protected readonly settingsForm = form(this.model, {
    submission: {
      action: async () => {
        this.save.emit(this.model());
        return undefined;
      },
    },
  });
}
