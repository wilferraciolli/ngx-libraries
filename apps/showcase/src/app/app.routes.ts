import { Routes } from '@angular/router';
import { ApiClientDemoComponent } from './demos/api-client-demo/api-client-demo.component';
import { FormsDemoComponent } from './demos/forms-demo/forms-demo.component';
import { MediaDemoComponent } from './demos/media-demo/media-demo.component';
import { AiToolsDemoComponent } from './demos/ai-tools-demo/ai-tools-demo.component';
import { GraphsDemoComponent } from './demos/graphs-demo/graphs-demo.component';
import { HomeComponent } from './home/home.component';
import { TranslationsDemoComponent } from './demos/translations-demo/translations-demo.component';
import { ModalsDemoComponent } from './demos/modals-demo/modals-demo.component';
import { NotificationsDemoComponent } from './demos/notifications-demo/notifications-demo.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'api-client',
    component: ApiClientDemoComponent,
  },
  {
    path: 'forms',
    component: FormsDemoComponent,
  },
  {
    path: 'media',
    component: MediaDemoComponent,
  },
  {
    path: 'ai-tools',
    component: AiToolsDemoComponent,
  },
  {
    path: 'graphs',
    component: GraphsDemoComponent,
  },
  {
    path: 'translations',
    component: TranslationsDemoComponent,
  },
  {
    path: 'modals',
    component: ModalsDemoComponent,
  },
  {
    path: 'notifications',
    component: NotificationsDemoComponent,
  },
];
