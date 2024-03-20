import { Injectable, inject } from '@angular/core';
import { AppConfig } from './app.config';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ApiService {
  config = inject(AppConfig);
  http = inject(HttpClient);

  getInfos(name: string) {
    return this.http.get<{ address: string; identity: string }>(
      `${this.config.apiUrl}/database/info/${name}`,
    );
  }

  getAuthenticationToken() {}
}
