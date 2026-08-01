import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Store } from "@ngxs/store";
import { catchError, map, Observable, of } from "rxjs";
import { AppState } from "../app.state";
import { streamLogs } from "./logs-fetcher";
import { LogLine, RawSchema, ReducerCallResult } from "./types";
import { parseSchema, Schema } from "./parse-schema";
import { RawModuleRef9, SqlQueryResult } from "./raw-types";

@Injectable()
export class ApiService {
  private store = inject(Store);
  private http = inject(HttpClient);

  /**
   * Probe connectivity with a non-privileged endpoint so any identity
   * (including anonymous / non-owner) can succeed.
   * Logs require ownership and must not be used for connection tests.
   */
  testConnection(
    url: string,
    database: string,
    token: string,
  ): Observable<{ error?: string }> {
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = "Bearer " + token;
    }

    return this.http
      .get(`${url}/v1/database/${database}/schema?version=9`, { headers })
      .pipe(
        map(() => ({ error: undefined })),
        catchError((err: HttpErrorResponse) => {
          const detail =
            typeof err.error === "string"
              ? err.error
              : err.error
                ? JSON.stringify(err.error)
                : err.message || "Connection failed";
          return of({ error: detail });
        }),
      );
  }

  runQuery(query: string) {
    return this.postDb<SqlQueryResult[]>("sql", query);
  }

  getRawSchema() {
    return this.getDb<RawModuleRef9>("schema?version=9");
  }

  getSchema(): Observable<Schema> {
    return this.getDb<RawSchema>("schema?version=9").pipe(
      map((schema) => parseSchema(schema)),
    );
  }

  callReducer(name: string, args: any[] = []) {
    return this.postDb(`call/${name}`, args).pipe(
      map((res) => {
        const result: ReducerCallResult = { error: undefined, data: res };
        return result;
      }),
      catchError((err) => {
        const res: ReducerCallResult = {
          error:
            typeof err.error === "string"
              ? err.error
              : err.error
                ? JSON.stringify(err.error)
                : err.message,
          data: undefined,
        };
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
