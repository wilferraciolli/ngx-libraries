import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { API_ORIGIN } from '@wiltech-labs/ngx-api-client';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideI18n } from '@wiltech-labs/ngx-i18n';
import en from './i18n/en-GB.json';
import el from './i18n/el-GR.json';

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
    provideI18n({
      locales: ['en-GB', 'el-GR'],
      defaultLocale: 'en-GB',
      dictionaries: { 'en-GB': en, 'el-GR': el }
    })
  ]
}).catch(err => console.error(err));
