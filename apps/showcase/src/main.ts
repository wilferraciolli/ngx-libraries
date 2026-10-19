import { inject } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';
import { API_ORIGIN } from '@wiltech-labs/ngx-api-client';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { TranslationsService, provideTranslations } from '@wiltech-labs/ngx-translations';
import { NGX_DATES_LOCALE } from '@wiltech-labs/ngx-dates';
import { provideNotifications } from '@wiltech-labs/ngx-notifications';
import { provideThemes } from '@wiltech-labs/ngx-themes';
import en from './translations/en-GB.json';
import el from './translations/el-GR.json';

interface DemoNotification {
  id: string;
  title: string;
  body: string;
  read: boolean;
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    // Every <mat-icon> is a Material Symbols Outlined glyph (font loaded in index.html).
    { provide: MAT_ICON_DEFAULT_OPTIONS, useValue: { fontSet: 'material-symbols-outlined' } },
    provideCharts(withDefaultRegisterables()),
    {
      provide: API_ORIGIN,
      useValue: 'http://localhost:8080',
    },
    provideTranslations({
      locales: ['en-GB', 'el-GR'],
      defaultLocale: 'en-GB',
      dictionaries: { 'en-GB': en, 'el-GR': el },
    }),
    {
      provide: NGX_DATES_LOCALE,
      useFactory: () => {
        const translations = inject(TranslationsService);
        return () => translations.locale();
      },
    },
    // Each family's palette is an `html[data-theme='<id>']` block in src/styles.scss — add one by
    // generating a palette into src/styles/themes/ (`ng generate @angular/material:theme-color`),
    // adding its block there, then its entry here. Each family gets light and dark for free.
    provideThemes({
      families: [
        { id: 'minimalistic', label: 'Minimalistic' },
        { id: 'teal', label: 'Teal' },
        { id: 'magenta', label: 'Magenta' },
        { id: 'red-yellow', label: 'Red & Yellow' },
      ],
      // Also read by the pre-paint script in src/index.html — keep the two in sync.
      storageKeyPrefix: 'showcase.theme',
    }),
    provideNotifications<DemoNotification>(() => {
      // Fake in-memory backend, not a real API — ngx-notifications has no idea, since it only ever
      // calls the three callbacks below.
      let items: DemoNotification[] = [
        {
          id: '1',
          title: 'Holiday approved',
          body: 'Your holiday request for next week was approved.',
          read: false,
        },
        {
          id: '2',
          title: 'New comment',
          body: 'Someone commented on your pull request.',
          read: false,
        },
        { id: '3', title: 'Weekly digest', body: 'Your weekly summary is ready.', read: true },
      ];

      return {
        fetchNotifications: async () => ({
          items: [...items],
          unreadCount: items.filter((n) => !n.read).length,
        }),
        dismissNotification: async (notification) => {
          items = items.filter((n) => n.id !== notification.id);
        },
        openNotification: (notification) => {
          items = items.map((n) => (n.id === notification.id ? { ...n, read: true } : n));
        },
      };
    }),
  ],
}).catch((err) => console.error(err));
