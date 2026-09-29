import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { API_ORIGIN } from '@wiltech-labs/ngx-api-client';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    provideCharts(withDefaultRegisterables()),
    {
      provide: API_ORIGIN,
      useValue: 'http://localhost:8080'
    }
  ]
}).catch(err => console.error(err));
