import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { RelativeTimeHost } from './relative-time-host';

const meta: Meta<RelativeTimeHost> = {
  title: 'ngx-dates/relativeTime',
  component: RelativeTimeHost,
  decorators: [moduleMetadata({ imports: [RelativeTimeHost] })],
  parameters: {
    docs: {
      description: {
        component: `The \`relativeTime\` pipe, built on \`Temporal\` and \`Intl.RelativeTimeFormat\`. Takes an \`InstantLike\` (a \`Date\`, an ISO string, or a \`Temporal.Instant\`) and renders "5 minutes ago" / "in 3 days" style text that:

- re-renders on its own as real time passes (self-scheduling: a value from last year re-checks hourly, not every second);
- follows \`NGX_DATES_LOCALE\` reactively — switch the **Locale** toolbar global above and every value below updates immediately, the same wiring the \`ngx-forms\`/\`ngx-calendar\` locale resolvers use.`,
      },
    },
  },
  argTypes: {
    instant: { description: 'A `Date`, ISO string, or `Temporal.Instant`.' },
    label: { description: 'Text shown before the relative value.' },
  },
};

export default meta;
type Story = StoryObj<RelativeTimeHost>;

export const JustNow: Story = {
  name: 'Just now',
  args: { label: 'Comment posted', instant: new Date(Date.now() - 20 * 1000) },
};

export const MinutesAgo: Story = {
  name: 'Minutes ago',
  args: { label: 'Comment posted', instant: new Date(Date.now() - 5 * 60 * 1000) },
};

export const DaysAgo: Story = {
  name: 'Days ago',
  args: { label: 'Order placed', instant: new Date(Date.now() - 3 * 86400 * 1000) },
};

export const InTheFuture: Story = {
  name: 'In the future',
  args: { label: 'Renewal due', instant: new Date(Date.now() + 10 * 86400 * 1000) },
};

export const SeveralAtOnce: Story = {
  name: 'Several at once',
  render: () => ({
    template: `
      <div class="Story-stack">
        <sb-relative-time-host label="Just now" [instant]="recent" />
        <sb-relative-time-host label="This morning" [instant]="hoursAgo" />
        <sb-relative-time-host label="This week" [instant]="daysAgo" />
        <sb-relative-time-host label="Last month" [instant]="weeksAgo" />
        <sb-relative-time-host label="Last year" [instant]="yearAgo" />
      </div>`,
    props: {
      recent: new Date(Date.now() - 45 * 1000),
      hoursAgo: new Date(Date.now() - 3 * 3600 * 1000),
      daysAgo: new Date(Date.now() - 2 * 86400 * 1000),
      weeksAgo: new Date(Date.now() - 20 * 86400 * 1000),
      yearAgo: new Date(Date.now() - 400 * 86400 * 1000),
    },
  }),
};
