import type { Meta, StoryObj } from '@storybook/angular';
import { Calendar } from '@wiltech-labs/ngx-calendar';
import type { CalendarView } from '@wiltech-labs/ngx-calendar';
import { fn } from 'storybook/test';
import { OVERLAPPING_EVENTS, SAMPLE_EVENTS } from './calendar/calendar-samples';

const meta: Meta<Calendar> = {
  title: 'ngx-calendar/Calendar',
  component: Calendar,
  parameters: {
    docs: {
      description: {
        component: `Day / week / month views on FullCalendar, Material 3 styled. Clicking a day opens its agenda (\`ngx-modals\`, modeless); clicking an event opens an \`ngx-modals\` detail/edit panel with Edit and Save.

- \`events\` are plain data — \`CalendarEventMapper\` can build them from your own domain objects, keeping the original via \`source\`.
- \`view\` is a two-way \`model()\`: bind \`[(view)]\` to control or persist it.
- \`eventSave\` emits the edited event; the calendar never mutates \`events\` itself — the caller applies the change (see the "Interactive" story).
- \`timeZone\`/\`firstDay\` default to the browser's own; \`editable: false\` on the calendar or \`config.editable: false\` on one event hides its Edit action.

All start/end times are stored as UTC instants and shown in \`timeZone\` — switch the **Locale** toolbar global to see month/day names follow it (via \`NGX_CALENDAR_LOCALE\`).`,
      },
    },
  },
  argTypes: {
    events: { description: 'Events to render.' },
    view: { description: "Two-way bound: 'day' | 'week' | 'month'." },
    timeZone: { description: "IANA zone to draw the calendar in. Default: the browser's own." },
    editable: { description: 'Shows the Edit action in the event panel.' },
    firstDay: { description: "0 = Sunday … 6 = Saturday. Default: the locale's own first day." },
    eventSave: { description: 'Emitted with the edited event after Save.' },
    daySelect: { description: "Emitted with the picked day, 'YYYY-MM-DD'." },
  },
  args: { eventSave: fn(), daySelect: fn() },
};

export default meta;
type Story = StoryObj<Calendar>;

export const MonthView: Story = {
  name: 'Month view',
  args: { events: SAMPLE_EVENTS, view: 'month' as CalendarView },
};

export const WeekView: Story = {
  name: 'Week view',
  args: { events: SAMPLE_EVENTS, view: 'week' as CalendarView },
};

export const DayView: Story = {
  name: 'Day view',
  args: { events: SAMPLE_EVENTS, view: 'day' as CalendarView },
};

export const EmptyMonth: Story = {
  name: 'Empty month',
  parameters: {
    docs: {
      description: { story: 'No events at all — the calendar grid still renders normally.' },
    },
  },
  args: { events: [], view: 'month' as CalendarView },
};

export const OverlappingEvents: Story = {
  name: 'Overlapping events',
  parameters: {
    docs: {
      description: {
        story:
          "Three events sharing the same hour on the day view — FullCalendar's own side-by-side layout.",
      },
    },
  },
  args: { events: OVERLAPPING_EVENTS, view: 'day' as CalendarView },
};

export const ReadOnly: Story = {
  name: 'Read-only (editable: false)',
  args: { events: SAMPLE_EVENTS, view: 'week' as CalendarView, editable: false },
};

export const AnotherTimeZone: Story = {
  name: 'Fixed timezone (America/Sao_Paulo)',
  args: { events: SAMPLE_EVENTS, view: 'day' as CalendarView, timeZone: 'America/Sao_Paulo' },
};

export const MondayFirst: Story = {
  name: 'Week starts Monday',
  args: { events: SAMPLE_EVENTS, view: 'month' as CalendarView, firstDay: 1 },
};

export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Click an event, Edit, change the title, Save — the change applies here because this story owns the events array and updates it from `eventSave` instead of treating `events` as a fixed prop.',
      },
    },
  },
  render: () => ({
    props: { events: SAMPLE_EVENTS, view: 'month' as CalendarView },
    template: `<ngx-calendar [events]="events" [(view)]="view" (eventSave)="events = events.map(e => e.id === $event.id ? $event : e)" />`,
  }),
};
