import { Component } from '@angular/core';
import { NotificationsWidget } from '@wiltech-labs/ngx-notifications';

@Component({
  selector: 'app-notifications-demo',
  standalone: true,
  imports: [NotificationsWidget],
  templateUrl: './notifications-demo.component.html',
  styleUrls: ['./notifications-demo.component.css'],
})
export class NotificationsDemoComponent {}
