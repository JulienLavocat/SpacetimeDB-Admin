import { Injectable, inject } from '@angular/core';
import { AppConfig } from './app.config';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface LogLine {
  ts: number;
  level: string;
  filename: string;
  line_number: number;
  message: string;
}

@Injectable()
export class ApiService {
  config = inject(AppConfig);
  http = inject(HttpClient);

  textDecoder = new TextDecoder();

  getInfos(name: string) {
    return this.http.get<{ address: string; identity: string }>(
      `${this.config.apiUrl}/database/info/${name}`,
    );
  }

  getLogs(name: string, token: string): Observable<LogLine[]> {
    return this.http
      .get(`${this.config.apiUrl}/database/logs/${name}?num_lines=300`, {
        headers: this.getAuthorizationHeader(token),
        responseType: 'arraybuffer',
      })
      .pipe(
        map((buffer) =>
          this.textDecoder
            .decode(buffer)
            .split('\n')
            .reduce<any[]>((acc, current) => {
              if (current) {
                acc.push(JSON.parse(current));
              }
              return acc;
            }, []),
        ),
      );
  }

  getAuthorizationHeader(token: string) {
    return {
      Authorization: `Basic ${btoa(`token:${token}`)}`,
    };
  }
}
