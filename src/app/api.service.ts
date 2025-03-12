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

export interface Reducer {
  name: string;
  lifecycle: { none?: {}[] };
  params: { elements: {}[] };
}

export interface Schema {
  tables: any[];
  reducers: Reducer[];
  types: any[];
}

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
