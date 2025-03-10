import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, map } from 'rxjs';
import { DatabaseSchema, LogLine, QueryResult } from './api.types';
import { AppConfig } from './app.config';
import { AppState } from './app.state';

@Injectable()
export class ApiService {
  private readonly config = inject(AppConfig);
  private readonly http = inject(HttpClient);
  private readonly textDecoder = new TextDecoder();
  private readonly store = inject(Store);

  getInfos() {
    return this.http.get<{ address: string; identity: string }>(
      `${this.config.apiUrl}/database/${this.getDatabase()}/info`,
    );
  }

  getLogs(): Observable<LogLine[]> {
    return this.http
      .get(
        `${this.config.apiUrl}/database/${this.getDatabase()}/logs?num_lines=300`,
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
      `${this.config.apiUrl}/database/${this.getDatabase()}/schema?expand=${expand}&version=9`,
      {
        headers: this.getAuthorizationHeader(),
      },
    );
  }

  runQuery(query: string): Observable<QueryResult> {
    return this.http
      .post<QueryResult[]>(
        `${this.config.apiUrl}/database/${this.getDatabase()}/sql`,
        query,
        {
          headers: this.getAuthorizationHeader(),
        },
      )
      .pipe(map((results) => results[0]));
  }

  getAuthorizationHeader() {
    return {
      Authorization: `Bearer ${this.store.selectSnapshot(AppState.token)}`,
    };
  }

  getDatabase(): string {
    return this.store.selectSnapshot(AppState.database);
  }
}
