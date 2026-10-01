import { Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { form, FormRoot } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { RegionSettingsPayload } from '../models/region-settings.model';
import {
  SelectField,
  FormFieldType,
  type FieldDef,
  type FieldOption,
} from '@wiltech-labs/ngx-forms';
import { NGX_REGION_SETTINGS_FORM_TEXT } from '../config/settings-form-text.token';

/** One `{label, value}` list per editable field, already resolved and translated by the caller —
 *  this component never decides what a value means or how it reads, only how it's laid out. */
export type RegionSettingsFieldOptions = Partial<
  Record<keyof RegionSettingsPayload, FieldOption[]>
>;

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
  readonly options = input.required<RegionSettingsFieldOptions>();
  readonly saving = input(false);

  readonly save = output<RegionSettingsPayload>();

  protected readonly model = linkedSignal(() => toPayload(this.settings()));

  protected readonly changed = computed(
    () => JSON.stringify(this.model()) !== JSON.stringify(toPayload(this.settings())),
  );

  // ngx-forms' SelectField reads its choices from `fieldDef.options`, not a separate input — each
  // field's static definition and the caller's own options for it are merged into one FieldDef here.
  // The options themselves (label text, bound value) come straight from the `options` input as
  // given — this component makes no decision about translation, locale, or which underlying value
  // an option carries. Same boundary `ngx-forms`' date/time fields draw around the browser's own
  // locale (see that package's `NGX_FORMS_LOCALE` — never defaulted to it): the app controls
  // presentation explicitly, never something ambient the library would otherwise reach for.
  private fieldDef(key: keyof RegionSettingsPayload, label: string): FieldDef {
    return {
      name: key,
      type: FormFieldType.SELECT,
      label,
      required: true,
      options: this.options()[key] ?? [],
    };
  }

  protected readonly timezoneField = computed(() =>
    this.fieldDef('timezone', this.text().timezoneLabel),
  );
  protected readonly languageField = computed(() =>
    this.fieldDef('language', this.text().languageLabel),
  );
  protected readonly localeField = computed(() => this.fieldDef('locale', this.text().localeLabel));
  protected readonly currencyField = computed(() =>
    this.fieldDef('currency', this.text().currencyLabel),
  );
  protected readonly themeField = computed(() => this.fieldDef('theme', this.text().themeLabel));

  protected readonly settingsForm = form(this.model, {
    submission: {
      action: async () => {
        this.save.emit(this.model());
        return undefined;
      },
    },
  });
}
