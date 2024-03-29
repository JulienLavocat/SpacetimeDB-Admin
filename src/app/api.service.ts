import { Injectable, inject } from '@angular/core';
import { AppConfig } from './app.config';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { Store } from '@ngxs/store';
import { AppState } from './app.state';
import { DatabaseSchema, LogLine, QueryResult } from './api.types';

@Injectable()
export class ApiService {
  private readonly config = inject(AppConfig);
  private readonly http = inject(HttpClient);
  private readonly textDecoder = new TextDecoder();
  private readonly store = inject(Store);

  getInfos() {
    return this.http.get<{ address: string; identity: string }>(
      `${this.config.apiUrl}/database/info/${this.getDatabase()}`,
    );
  }

  getLogs(): Observable<LogLine[]> {
    return this.http
      .get(
        `${this.config.apiUrl}/database/logs/${this.getDatabase()}?num_lines=300`,
        {
          headers: this.getAuthorizationHeader(),
          responseType: 'arraybuffer',
        },
      )
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

  getSchema(expand = true): Observable<DatabaseSchema> {
    return this.http.get<DatabaseSchema>(
      `${this.config.apiUrl}/database/schema/${this.getDatabase()}?expand=${expand}`,
      {
        headers: this.getAuthorizationHeader(),
      },
    );
  }

  runQuery(query: string): Observable<QueryResult> {
    return this.http
      .post<QueryResult[]>(
        `${this.config.apiUrl}/database/sql/${this.getDatabase()}`,
        query,
        {
          headers: this.getAuthorizationHeader(),
        },
      )
      .pipe(map((results) => results[0]));
  }

  getAuthorizationHeader() {
    return {
      Authorization: `Basic ${btoa(`token:${this.store.selectSnapshot(AppState.token)}`)}`,
    };
  }

  getDatabase(): string {
    return this.store.selectSnapshot(AppState.database);
  }
}
