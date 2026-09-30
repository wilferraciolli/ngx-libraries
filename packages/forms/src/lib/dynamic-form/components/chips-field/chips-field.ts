import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatChipGrid, MatChipInput, MatChipRemove, MatChipRow } from '@angular/material/chips';
import type { MatChipInputEvent } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import type { FieldDef } from '../../interfaces/field-definition';

/**
 * Material chip grid for the chips field type: a free-text list of tokens (Eg keywords), typed one
 * at a time and removable individually. Driven by hand (`state().value.update(...)`), same as the
 * date/time fields — `[formField]` targets a single control's value, not a token-by-token list.
 */
@Component({
  selector: 'ngx-chips-field',
  standalone: true,
  imports: [MatFormFieldModule, MatChipGrid, MatChipRow, MatChipRemove, MatChipInput, MatIcon],
  templateUrl: './chips-field.html',
  styleUrl: './chips-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipsField {
  public readonly fieldDef = input.required<FieldDef>();
  public readonly field = input.required<FieldTree<string[]>>();

  private readonly announcer = inject(LiveAnnouncer);

  protected readonly state = computed(() => this.field()());
  protected readonly chips = computed(() => this.state().value() ?? []);

  protected addChip(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.state().value.update((chips) => [...chips, value]);
      this.announcer.announce(`Added ${value}`);
    }

    event.chipInput.clear();
  }

  protected removeChip(chip: string): void {
    this.state().value.update((chips) => chips.filter((existing) => existing !== chip));
    this.announcer.announce(`Removed ${chip}`);
  }
}
