import { Injectable } from '@angular/core';
import type { Provider } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';

type DatePart = 'day' | 'month' | 'year';

const NUMERIC_DATE: RegExp = /^(\d{1,4})\D+(\d{1,2})\D+(\d{1,4})$/;

/**
 * NativeDateAdapter already *displays* dates in its locale, but its parse() hands typed text to
 * Date.parse(), which always reads 31/03/2024 as month-first. This parses typed numeric dates in
 * the same day/month/year order the locale displays them in.
 */
@Injectable()
export class LocaleDateAdapter extends NativeDateAdapter {
  override parse(value: unknown, parseFormat?: unknown): Date | null {
    const match = typeof value === 'string' ? value.trim().match(NUMERIC_DATE) : null;
    if (!match) {
      return super.parse(value, parseFormat);
    }

    const parts: Partial<Record<DatePart, number>> = {};
    this.partOrder().forEach((part, index) => parts[part] = Number(match[index + 1]));

    try {
      return this.createDate(parts.year!, parts.month! - 1, parts.day!);
    } catch {
      return this.invalid();
    }
  }

  private partOrder(): DatePart[] {
    return new Intl.DateTimeFormat(this.locale)
      .formatToParts(new Date(2000, 10, 22))
      .map(part => part.type)
      .filter((type): type is DatePart => type === 'day' || type === 'month' || type === 'year');
  }
}

/**
 * Gives a component its own DateAdapter instance, so each field can call setLocale() with its own
 * locale without changing the format of every other picker in the app.
 */
export function provideLocaleDateAdapter(): Provider[] {
  return [
    { provide: DateAdapter, useClass: LocaleDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS }
  ];
}
