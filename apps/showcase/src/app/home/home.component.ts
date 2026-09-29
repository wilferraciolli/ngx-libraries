import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  packages = [
    {
      name: '@wiltech-labs/ngx-api-client',
      description: 'Shared Angular client for HTTP APIs with envelope unwrap, HATEOAS links, and field metadata support',
      route: '/api-client'
    },
    {
      name: '@wiltech-labs/ngx-forms',
      description: 'Configuration-driven form builder with dynamic fields and validation support',
      route: '/forms'
    },
    {
      name: '@wiltech-labs/ngx-media',
      description: 'Skeleton loaders and a YouTube player',
      route: '/media'
    },
    {
      name: '@wiltech-labs/ngx-ai-tools',
      description: 'Gradient panels, text boxes and buttons with an AI-assist look and feel',
      route: '/ai-tools'
    }
  ];
}
