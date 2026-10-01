import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  packages = [
    {
      name: '@wiltech-labs/ngx-api-client',
      description:
        'Shared Angular client for HTTP APIs with envelope unwrap, HATEOAS links, and field metadata support',
      route: '/api-client',
    },
    {
      name: '@wiltech-labs/ngx-forms',
      description: 'Configuration-driven form builder with dynamic fields and validation support',
      route: '/forms',
    },
    {
      name: '@wiltech-labs/ngx-media',
      description: 'Skeleton loaders and a YouTube player',
      route: '/media',
    },
    {
      name: '@wiltech-labs/ngx-ai-tools',
      description: 'Gradient panels, text boxes and buttons with an AI-assist look and feel',
      route: '/ai-tools',
    },
    {
      name: '@wiltech-labs/ngx-graphs',
      description: 'All 8 non-mixed chart.js chart types, built on ng2-charts',
      route: '/graphs',
    },
    {
      name: '@wiltech-labs/ngx-translations',
      description:
        'Instant, no-reload language switching on Transloco, a t() service method and a t pipe',
      route: '/translations',
    },
    {
      name: '@wiltech-labs/ngx-modals',
      description:
        'Right-docked panel modal on MatDialog, with a typed close-reason + data and an unsaved-changes guard',
      route: '/modals',
    },
    {
      name: '@wiltech-labs/ngx-notifications',
      description:
        'Polling notification bell + badge + dropdown panel, fully app-pluggable, no Angular Material',
      route: '/notifications',
    },
    {
      name: '@wiltech-labs/ngx-region-settings',
      description:
        'Current-user and region-settings signal stores, plus a ready-made settings-editing form',
      route: '/region-settings',
    },
    {
      name: '@wiltech-labs/ngx-components',
      description: 'Reusable UI components — Banner (info/warning/error) to start, more to come',
      route: '/components',
    },
    {
      name: '@wiltech-labs/ngx-calendar',
      description:
        'Day, week and month calendar on FullCalendar, M3 styled, with a day agenda and an event edit panel',
      route: '/calendar',
    },
    {
      name: '@wiltech-labs/ngx-organization',
      description:
        'Org chart on a pan/zoom canvas: organization, entities, departments with their heads, and jobs',
      route: '/organization',
    },
  ];
}
