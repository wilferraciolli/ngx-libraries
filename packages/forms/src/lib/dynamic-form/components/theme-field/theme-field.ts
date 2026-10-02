import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import type { FieldTree } from '@angular/forms/signals';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIcon } from '@angular/material/icon';
import type { FieldDef } from '../../interfaces/field-definition';
import { FieldSubscript } from '../../shared/field-subscript/field-subscript';

let nextId: number = 0;

/** The three fixed values, each always paired with the same icon. Order is the on-screen order. */
const THEME_CHOICES = [
  { value: 'light', icon: 'light_mode', defaultLabel: 'Light' },
  { value: 'dark', icon: 'dark_mode', defaultLabel: 'Dark' },
  { value: 'system', icon: 'brightness_auto', defaultLabel: 'System' },
] as const;

/** Material icon toggle group for the theme field type: a fixed choice between `'light'`,
 *  `'dark'` and `'system'` (follow the OS preference), shown as a sun/moon/auto icon row instead of
 *  a dropdown or radio list. `MatButtonToggleGroup` is a `ControlValueAccessor`, same as
 *  `MatRadioGroup`/`MatSelect`, so `[formField]` works on it directly — no hand-written value sync
 *  needed.
 *
 *  Labels come from `fieldDef.options` — same mechanism `RadioField`/`SelectField` already use, not
 *  a separate config or token — matched by value since the three values and their icons are fixed;
 *  `options` only ever supplies the label text for each, defaulting to English when absent. */
@Component({
  selector: 'ngx-theme-field',
  standalone: true,
  imports: [FormField, MatButtonToggleModule, MatIcon, FieldSubscript],
  templateUrl: './theme-field.html',
  styleUrl: './theme-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeField {
  public readonly fieldDef = input.required<FieldDef>();
  public readonly field = input.required<FieldTree<string>>();

  protected readonly choices = computed(() =>
    THEME_CHOICES.map((choice) => ({
      value: choice.value,
      icon: choice.icon,
      label:
        this.fieldDef().options?.find((option) => option.value === choice.value)?.label ??
        choice.defaultLabel,
    })),
  );

  protected readonly labelId: string = `theme-field-label-${nextId++}`;
}
