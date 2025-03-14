import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { AppState } from "../app.state";
import { streamLogs } from "./logs-fetcher";
import { LogLine, Schema, SqlQueryResult } from "./types";

@Injectable()
export class ApiService {
  private store = inject(Store);
  private http = inject(HttpClient);

  runQuery(query: string) {
    return this.postDb<SqlQueryResult[]>("sql", query);
  }

  getSchema() {
    return this.getDb<Schema>("schema?version=9");
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
