import { Routes } from '@angular/router';
import { ApiClientDemoComponent } from './demos/api-client-demo/api-client-demo.component';
import { FormsDemoComponent } from './demos/forms-demo/forms-demo.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'api-client',
    component: ApiClientDemoComponent
  },
  {
    path: 'forms',
    component: FormsDemoComponent
  }
];
