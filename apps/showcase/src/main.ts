import { inject } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { API_ORIGIN } from '@wiltech-labs/ngx-api-client';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { TranslationsService, provideTranslations } from '@wiltech-labs/ngx-translations';
import { NGX_DATES_LOCALE } from '@wiltech-labs/ngx-dates';
import en from './translations/en-GB.json';
import el from './translations/el-GR.json';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    provideCharts(withDefaultRegisterables()),
    {
      provide: API_ORIGIN,
      useValue: 'http://localhost:8080'
    },
    provideTranslations({
      locales: ['en-GB', 'el-GR'],
      defaultLocale: 'en-GB',
      dictionaries: { 'en-GB': en, 'el-GR': el }
    }),
    {
      provide: NGX_DATES_LOCALE,
      useFactory: () => {
        const translations = inject(TranslationsService);
        return () => translations.locale();
      }
    }
  ]
}).catch(err => console.error(err));
