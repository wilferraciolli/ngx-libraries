import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { DynamicForm, formConfig, toSchema } from '@wiltech-labs/ngx-forms';
import type { BaseSchema } from '@wiltech-labs/ngx-forms';
import {
  ModalCloseAction,
  type ModalCloseResult,
  type ModalContent,
} from '@wiltech-labs/ngx-modals';
import { Temporal } from 'temporal-polyfill';

import { NGX_CALENDAR_TEXT, type CalendarText } from '../../config/calendar-text.token';
import type { CalendarEvent } from '../../models/calendar-event.model';
import { formatLongDate, formatTimeRange, toMinuteInstant } from '../../utils/calendar-time.utils';
import { eventColors } from '../../utils/event-colors.utils';

/** What the calendar hands the panel when it opens an event. */
export interface EventDetailData {
  event: CalendarEvent;
  timeZone: string;
  locale: string;
  editable: boolean;
}

export type EventDetailResult = ModalCloseResult<ModalCloseAction, CalendarEvent | undefined>;

interface EventFormSchema extends BaseSchema {
  schemaType: 'calendarEvent';
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
}

/** The edit form's fields. Validation only needs the labels; the zone and locale are for display. */
function buildConfig(text: CalendarText, dateTimeConfig?: { timeZone: string; locale: string }) {
  return formConfig<EventFormSchema>('calendarEvent')
    .text('title', text.titleLabel, { required: true, maxLength: 200 })
    .instantDateTime('startDateTime', text.startLabel, { required: true, dateTimeConfig })
    .instantDateTime('endDateTime', text.endLabel, { required: true, dateTimeConfig })
    .textarea('description', text.descriptionLabel);
}

/**
 * Content of the side panel `Calendar` opens for an event: the event's time, zone and description,
 * and an Edit action that swaps in an `ngx-forms` form. Save closes the panel with
 * `ModalCloseAction.Updated` and the edited event; the calendar re-emits it as `eventSave`.
 */
@Component({
  selector: 'ngx-calendar-event-detail',
  standalone: true,
  imports: [DynamicForm, MatButton, MatIcon],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDetail implements ModalContent {
  public readonly data = input.required<EventDetailData>();

  private readonly dialogRef = inject(MatDialogRef<EventDetail, EventDetailResult>);

  protected readonly editing = signal(false);
  protected readonly rangeError = signal(false);

  protected readonly event = computed(() => this.data().event);
  // Read once: validation messages are built from these labels when the form is created.
  protected readonly text = inject(NGX_CALENDAR_TEXT)();
  protected readonly canEdit = computed(
    () => this.data().editable && this.event().config?.editable !== false,
  );
  protected readonly accent = computed(() => eventColors(this.event().config).background);
  protected readonly dateText = computed(() =>
    formatLongDate(this.event().startDateTime, this.data().timeZone, this.data().locale),
  );
  protected readonly timeText = computed(() =>
    formatTimeRange(
      this.event().startDateTime,
      this.event().endDateTime,
      this.data().timeZone,
      this.data().locale,
    ),
  );

  protected readonly config = computed(() => {
    const { timeZone, locale } = this.data();
    return buildConfig(this.text, { timeZone, locale }).build({
      title: this.event().title,
      description: this.event().description,
      startDateTime: this.event().startDateTime,
      endDateTime: this.event().endDateTime,
    });
  });

  protected readonly model = signal<EventFormSchema>(
    buildConfig(this.text).build({ title: '', description: '', startDateTime: '', endDateTime: '' })
      .initialValue,
  );
  protected readonly eventForm = form(
    this.model,
    toSchema<EventFormSchema>(buildConfig(this.text).fields()),
  );

  public hasUnsavedChanges(): boolean {
    if (!this.editing()) return false;
    const initial = this.config().initialValue;
    const current = this.model();
    return (
      current.title !== initial.title ||
      current.description !== initial.description ||
      current.startDateTime !== initial.startDateTime ||
      current.endDateTime !== initial.endDateTime
    );
  }

  protected edit(): void {
    this.model.set(this.config().initialValue);
    this.rangeError.set(false);
    this.editing.set(true);
  }

  protected cancelEdit(): void {
    this.editing.set(false);
  }

  protected save(): void {
    const value = this.model();
    const start = Temporal.Instant.from(value.startDateTime);
    const end = Temporal.Instant.from(value.endDateTime);
    if (Temporal.Instant.compare(end, start) <= 0) {
      this.rangeError.set(true);
      return;
    }

    this.dialogRef.close({
      action: ModalCloseAction.Updated,
      data: {
        ...this.event(),
        title: value.title.trim(),
        description: value.description,
        startDateTime: toMinuteInstant(value.startDateTime),
        endDateTime: toMinuteInstant(value.endDateTime),
      },
    });
  }
}
