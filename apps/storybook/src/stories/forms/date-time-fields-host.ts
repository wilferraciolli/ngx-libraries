import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { form } from '@angular/forms/signals';
import { BaseSchema, DynamicForm, FieldDef, formConfig, toSchema } from '@wiltech-labs/ngx-forms';

interface DateTimeDemoSchema extends BaseSchema {
  schemaType: 'dateTimeDemo';
  appointment: string;
  holiday: string;
  opensAt: string;
}

const TIMEZONES = [
  { id: 'Europe/London', value: 'London' },
  { id: 'Asia/Nicosia', value: 'Nicosia' },
  { id: 'America/Sao_Paulo', value: 'Sao Paulo' },
  { id: 'Asia/Kolkata', value: 'Kolkata (UTC+05:30)' },
];

/**
 * The timezone picker isn't one of `DynamicForm`'s own fields — it's a plain `<mat-select>` that
 * rebuilds the instant-date-time field's `dateTimeConfig.timeZone` on change, the same recipe the
 * showcase app's forms demo uses. `locale` instead comes from the `locale` toolbar global, via
 * `NGX_FORMS_LOCALE` (wired in `.storybook/preview.ts`) — no separate picker needed here.
 */
@Component({
  selector: 'sb-date-time-fields-host',
  standalone: true,
  imports: [DynamicForm, JsonPipe, MatFormField, MatLabel, MatSelect, MatOption],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="Story-stack">
      <mat-form-field style="max-width: 280px">
        <mat-label>Timezone (instant field only)</mat-label>
        <mat-select [value]="timeZone()" (selectionChange)="timeZone.set($event.value)">
          @for (tz of timezones; track tz.id) {
            <mat-option [value]="tz.id">{{ tz.value }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <ngx-dynamic-form [metaInfo]="fields()" [dynamicForm]="formTree" />

      <pre class="Story-output">value = {{ entity() | json }}</pre>
    </div>
  `,
})
export class DateTimeFieldsHost {
  protected readonly timezones = TIMEZONES;
  protected readonly timeZone = signal('Europe/London');

  private readonly schemaConfig = formConfig<DateTimeDemoSchema>('dateTimeDemo')
    .instantDateTime('appointment', 'Appointment', {
      required: true,
      hint: 'An exact moment, stored as a UTC instant and edited in the selected timezone.',
    })
    .businessDate('holiday', 'Closed on', {
      required: true,
      hint: 'A calendar date with no timezone — Christmas Day is the 25th wherever you are.',
    })
    .businessTime('opensAt', 'Opens at', { required: true })
    .build({ appointment: '2026-05-01T17:00:00Z', holiday: '2026-12-25', opensAt: '09:00' });

  protected readonly entity = signal<DateTimeDemoSchema>(this.schemaConfig.initialValue);
  protected readonly formTree = form(
    this.entity,
    toSchema<DateTimeDemoSchema>(this.schemaConfig.fields) as never,
  );

  // Rebuilds dateTimeConfig.timeZone on the instant field — DynamicForm only ever sees a static
  // per-field config, this is what makes the timezone picker above it live. The field's `locale`
  // comes from NGX_FORMS_LOCALE (the preview's `locale` toolbar), not from this component.
  protected readonly fields = computed<FieldDef[]>(() =>
    this.schemaConfig.fields.map((fieldDef) =>
      fieldDef.name === 'appointment'
        ? { ...fieldDef, dateTimeConfig: { ...fieldDef.dateTimeConfig, timeZone: this.timeZone() } }
        : fieldDef,
    ),
  );
}
