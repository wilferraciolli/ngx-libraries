import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiClientService, ApiEnvelope } from '@wiltech-labs/ngx-api-client';

@Component({
  selector: 'app-api-client-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './api-client-demo.component.html',
  styleUrls: ['./api-client-demo.component.css']
})
export class ApiClientDemoComponent implements OnInit {
  apiUrl = '';
  rootKey = '';
  responseData: unknown = null;
  error: string | null = null;
  loading = false;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET';
  requestBody = '';

  constructor(private apiClient: ApiClientService) {}

  ngOnInit() {
    this.apiUrl = 'https://api.example.com/data';
    this.rootKey = 'data';
  }

  async makeRequest() {
    this.loading = true;
    this.error = null;
    this.responseData = null;

    try {
      const url = this.apiUrl;

      switch (this.httpMethod) {
        case 'GET':
          this.responseData = await this.apiClient.get(this.rootKey, url);
          break;
        case 'POST': {
          const postData = this.requestBody ? JSON.parse(this.requestBody) : {};
          this.responseData = await this.apiClient.post(this.rootKey, url, postData);
          break;
        }
        case 'PUT': {
          const putData = this.requestBody ? JSON.parse(this.requestBody) : {};
          this.responseData = await this.apiClient.put(this.rootKey, url, putData);
          break;
        }
        case 'DELETE':
          await this.apiClient.delete(url);
          this.responseData = { message: 'Deleted successfully' };
          break;
      }
    } catch (e: unknown) {
      this.error = e instanceof Error ? e.message : 'An error occurred';
    } finally {
      this.loading = false;
    }
  }

  resetForm() {
    this.apiUrl = '';
    this.rootKey = '';
    this.requestBody = '';
    this.responseData = null;
    this.error = null;
    this.httpMethod = 'GET';
  }
}
