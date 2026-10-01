import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import type { FieldTree } from '@angular/forms/signals';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIcon } from '@angular/material/icon';
import type { FieldDef } from '../../interfaces/field-definition';
import { FieldSubscript } from '../../shared/field-subscript/field-subscript';

let nextId: number = 0;

const DEFAULT_LIGHT_LABEL = 'Light';
const DEFAULT_DARK_LABEL = 'Dark';

/** Material icon toggle group for the theme field type: a fixed choice between `'light'` and
 *  `'dark'`, shown as a sun/moon icon pair instead of a dropdown or radio list.
 *  `MatButtonToggleGroup` is a `ControlValueAccessor`, same as `MatRadioGroup`/`MatSelect`, so
 *  `[formField]` works on it directly — no hand-written value sync needed.
 *
 *  Labels come from `fieldDef.options` — same mechanism `RadioField`/`SelectField` already use, not
 *  a separate config or token — matched by value since the two values and their icons are fixed
 *  (`'light'`/`'dark'` only, each always paired with the same sun/moon icon); `options` only ever
 *  supplies the label text for each, defaulting to English when absent. */
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

  protected readonly lightLabel = computed(
    () =>
      this.fieldDef().options?.find((option) => option.value === 'light')?.label ??
      DEFAULT_LIGHT_LABEL,
  );
  protected readonly darkLabel = computed(
    () =>
      this.fieldDef().options?.find((option) => option.value === 'dark')?.label ??
      DEFAULT_DARK_LABEL,
  );

  protected readonly labelId: string = `theme-field-label-${nextId++}`;
}
