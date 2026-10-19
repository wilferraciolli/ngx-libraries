import { Component } from '@angular/core';
import { Banner, Card, Panel, type Message } from '@wiltech-labs/ngx-components';

@Component({
  selector: 'app-components-demo',
  standalone: true,
  imports: [Banner, Panel, Card],
  templateUrl: './components-demo.component.html',
  styleUrl: './components-demo.component.scss',
})
export class ComponentsDemoComponent {
  protected readonly messages: Message[] = [
    {
      type: 'info',
      text: 'Changes how dates are typed and shown — e.g. US: MM/DD/YYYY, UK: DD/MM/YYYY.',
    },
    {
      type: 'warning',
      text: 'Switching currency does not convert existing amounts, only how new ones are entered.',
    },
    {
      type: 'error',
      text: 'Could not reach the settings service — showing the last saved values.',
    },
  ];
}
