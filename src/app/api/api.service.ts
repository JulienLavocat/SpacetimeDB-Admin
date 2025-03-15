import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Store } from "@ngxs/store";
import { catchError, map, Observable, of } from "rxjs";
import { AppState } from "../app.state";
import { streamLogs } from "./logs-fetcher";
import { LogLine, RawSchema, ReducerCallResult, SqlQueryResult } from "./types";
import { parseSchema } from "./parse-schema";

@Injectable()
export class ApiService {
  private store = inject(Store);
  private http = inject(HttpClient);

  testConnection(
    url: string,
    database: string,
    token: string,
  ): Observable<{ error?: string }> {
    return this.http
      .get(`${url}/v1/database/${database}/logs?num_lines=1`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      })
      .pipe(
        map(() => ({ error: undefined })),
        catchError((err) => {
          console.log(err.error);
          return of({ error: err.error });
        }),
      );
  }

  runQuery(query: string) {
    return this.postDb<SqlQueryResult[]>("sql", query);
  }

  getRawSchema() {
    return this.getDb<RawSchema>("schema?version=9");
  }

  getSchema() {
    return this.getDb<RawSchema>("schema?version=9").pipe(
      map((schema) => parseSchema(schema)),
    );
  }

  callReducer(name: string, args: any[] = []) {
    return this.postDb(`call/${name}`, args).pipe(
      map((res) => {
        const result: ReducerCallResult = { error: undefined, data: res };
        console.log(res);
        return result;
      }),
      catchError((err) => {
        const res: ReducerCallResult = { error: err.error, data: undefined };
        return of(res);
      }),
    );
  }

  getLogs(): [Observable<LogLine[]>, () => void] {
    const token = this.store.selectSnapshot(AppState.selectToken);
    const dbInfo = this.store.selectSnapshot(AppState.selectDbInfos);

    const [subject, pump, cancel] = streamLogs(dbInfo.url, dbInfo.db, token);
    pump();

    return [subject.asObservable(), cancel];
  }

  private postDb<T>(url: string, body: any) {
    const dbInfo = this.store.selectSnapshot(AppState.selectDbInfos);
    return this.http.post<T>(
      `${dbInfo.url}/v1/database/${dbInfo.db}/${url}`,
      body,
    );
  }

  private getDb<T>(url: string) {
    const dbInfo = this.store.selectSnapshot(AppState.selectDbInfos);
    return this.http.get<T>(`${dbInfo.url}/v1/database/${dbInfo.db}/${url}`);
  }
}
