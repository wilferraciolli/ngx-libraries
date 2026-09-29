import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import type { FieldTree } from '@angular/forms/signals';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import type { FieldDef } from '../../interfaces/field-definition';
import { FieldSubscript } from '../../shared/field-subscript/field-subscript';

let nextId: number = 0;

/** Material slider for the range field type, bounded by `fieldDef.min`/`max`/`step`. */
@Component({
  selector: 'app-slider-field',
  standalone: true,
  imports: [FormField, MatSlider, MatSliderThumb, FieldSubscript],
  templateUrl: './slider-field.html',
  styleUrl: './slider-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderField {
  public readonly fieldDef = input.required<FieldDef>();
  public readonly field = input.required<FieldTree<number>>();

  protected readonly labelId: string = `slider-field-label-${nextId++}`;
}
