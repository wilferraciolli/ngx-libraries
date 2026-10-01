import type { CalendarEventColor, CalendarEventConfig } from '../models/calendar-event.model';

const ROLE_COLORS: Record<CalendarEventColor, { background: string; text: string }> = {
  primary: {
    background: 'var(--mat-sys-primary-container, #eaddff)',
    text: 'var(--mat-sys-on-primary-container, #4f378b)',
  },
  secondary: {
    background: 'var(--mat-sys-secondary-container, #e8def8)',
    text: 'var(--mat-sys-on-secondary-container, #4a4458)',
  },
  tertiary: {
    background: 'var(--mat-sys-tertiary-container, #ffd8e4)',
    text: 'var(--mat-sys-on-tertiary-container, #633b48)',
  },
  error: {
    background: 'var(--mat-sys-error-container, #f9dedc)',
    text: 'var(--mat-sys-on-error-container, #8c1d18)',
  },
  neutral: {
    background: 'var(--mat-sys-surface-container-highest, #e6e0e9)',
    text: 'var(--mat-sys-on-surface, #1d1b20)',
  },
};

/** The background and text colour an event's config resolves to. */
export function eventColors(config: CalendarEventConfig | undefined): {
  background: string;
  text: string;
} {
  const role = ROLE_COLORS[config?.color ?? 'primary'];
  return {
    background: config?.backgroundColor ?? role.background,
    text: config?.textColor ?? role.text,
  };
}
