import {
  HttpClient,
  HttpInterceptorFn,
  provideHttpClient,
  withInterceptors,
} from "@angular/common/http";
import {
  EnvironmentProviders,
  inject,
  Injectable,
  makeEnvironmentProviders,
} from "@angular/core";
import { Store } from "@ngxs/store";
import { AppState } from "./app.state";

const addTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);
  return next(
    req.clone({
      headers: req.headers.set(
        "Authorization",
        `Bearer ${store.selectSnapshot(AppState.selectToken)}`,
      ),
    }),
  );
};

export function provideApi(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideHttpClient(withInterceptors([addTokenInterceptor])),
    ApiService,
  ]);
}

export interface SqlQueryResult {
  rows: any[][];
  schema: { elements: { name: { some: string }; algebraic_type: {} }[] };
}

@Injectable()
export class ApiService {
  private store = inject(Store);
  private http = inject(HttpClient);

  ping() {
    return this.getDb("names");
  }

  runQuery(query: string) {
    return this.postDb<SqlQueryResult[]>("sql", query);
  }

  private postDb<T>(url: string, body: any) {
    const dbInfo = this.store.selectSnapshot(AppState.selectDbInfos);
    return this.http.post<T>(
      `${dbInfo.url}/v1/database/${dbInfo.db}/${url}`,
      body,
    );
  }

  private getDb(url: string) {
    const dbInfo = this.store.selectSnapshot(AppState.selectDbInfos);
    return this.http.get(`${dbInfo.url}/v1/database/${dbInfo.db}/${url}`);
  }
}
