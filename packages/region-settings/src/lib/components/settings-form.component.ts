import { Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { form, FormRoot } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { RegionSettingsPayload } from '../models/region-settings.model';
import { ValueViewValue } from '@wiltech-labs/ngx-api-client';
import { SelectField, FormFieldType, type FieldDef } from '@wiltech-labs/ngx-forms';
import { NGX_REGION_SETTINGS_FORM_TEXT } from '../config/settings-form-text.token';

type RegionSettingsOptions = Partial<Record<string, ValueViewValue[]>>;

function toPayload(settings: RegionSettingsPayload): RegionSettingsPayload {
  const { timezone, language, locale, currency, theme } = settings;
  return { timezone, language, locale, currency, theme };
}

@Component({
  selector: 'ngx-region-settings-form',
  imports: [SelectField, MatButtonModule, FormRoot],
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

  // ngx-forms' SelectField reads its choices from `fieldDef.options`, not a separate input —
  // each field's static definition and its API-provided options are merged into one FieldDef here.
  // `RegionSettingsPayload`'s fields (timezone/language/locale/currency/theme) are plain domain
  // strings, not ids referencing another resource, so the option's bound `value` is the metadata's
  // own `viewValue` (e.g. 'EUR') — never `value` (the metadata row's internal id), which wouldn't
  // match what's actually stored in `settings()` or expected back on save.
  private fieldDef(key: string, label: string): FieldDef {
    return {
      name: key,
      type: FormFieldType.SELECT,
      label,
      required: true,
      options: this.options()[key]?.map((v) => ({ label: v.viewValue, value: v.viewValue })) ?? [],
    };
  }

  protected readonly timezoneField = computed(() => this.fieldDef('timezone', 'Timezone'));
  protected readonly languageField = computed(() => this.fieldDef('language', 'Language'));
  protected readonly localeField = computed(() => this.fieldDef('locale', 'Locale'));
  protected readonly currencyField = computed(() => this.fieldDef('currency', 'Currency'));
  protected readonly themeField = computed(() => this.fieldDef('theme', 'Theme'));

  protected readonly settingsForm = form(this.model, {
    submission: {
      action: async () => {
        this.save.emit(this.model());
        return undefined;
      },
    },
  });
}
