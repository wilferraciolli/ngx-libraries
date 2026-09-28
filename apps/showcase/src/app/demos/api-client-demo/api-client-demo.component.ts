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
  responseData: any = null;
  error: string | null = null;
  loading = false;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET';
  requestBody = '';

  constructor(private apiClient: ApiClientService) {}

  ngOnInit() {
    this.apiUrl = 'https://api.example.com/data';
  }

  makeRequest() {
    this.loading = true;
    this.error = null;
    this.responseData = null;

    try {
      const url = this.apiUrl;

      switch (this.httpMethod) {
        case 'GET':
          this.apiClient.get<any>(url).subscribe(
            response => this.handleSuccess(response),
            err => this.handleError(err)
          );
          break;
        case 'POST':
          const postData = this.requestBody ? JSON.parse(this.requestBody) : {};
          this.apiClient.post<any>(url, postData).subscribe(
            response => this.handleSuccess(response),
            err => this.handleError(err)
          );
          break;
        case 'PUT':
          const putData = this.requestBody ? JSON.parse(this.requestBody) : {};
          this.apiClient.put<any>(url, putData).subscribe(
            response => this.handleSuccess(response),
            err => this.handleError(err)
          );
          break;
        case 'DELETE':
          this.apiClient.delete<any>(url).subscribe(
            response => this.handleSuccess(response),
            err => this.handleError(err)
          );
          break;
      }
    } catch (e: any) {
      this.error = `Error: ${e.message}`;
      this.loading = false;
    }
  }

  private handleSuccess(response: any) {
    this.responseData = response;
    this.loading = false;
  }

  private handleError(error: any) {
    this.error = error.message || 'An error occurred';
    this.loading = false;
  }

  resetForm() {
    this.apiUrl = '';
    this.requestBody = '';
    this.responseData = null;
    this.error = null;
    this.httpMethod = 'GET';
  }
}
