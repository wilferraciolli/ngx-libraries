import { Routes } from '@angular/router';
import { ApiClientDemoComponent } from './demos/api-client-demo/api-client-demo.component';
import { FormsDemoComponent } from './demos/forms-demo/forms-demo.component';
import { MediaDemoComponent } from './demos/media-demo/media-demo.component';
import { AiToolsDemoComponent } from './demos/ai-tools-demo/ai-tools-demo.component';
import { GraphsDemoComponent } from './demos/graphs-demo/graphs-demo.component';
import { HomeComponent } from './home/home.component';
import { I18nDemoComponent } from './demos/i18n-demo/i18n-demo.component';

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
  },
  {
    path: 'media',
    component: MediaDemoComponent
  },
  {
    path: 'ai-tools',
    component: AiToolsDemoComponent
  },
  {
    path: 'graphs',
    component: GraphsDemoComponent
  },
  {
    path: 'i18n',
    component: I18nDemoComponent
  }
];
