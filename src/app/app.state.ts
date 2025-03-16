import { Action, NgxsOnInit, Selector, State, StateContext } from "@ngxs/store";
import { inject, Injectable } from "@angular/core";
import { ApiService } from "./api";
import { MessageService } from "primeng/api";
import { EMPTY, tap } from "rxjs";

const DB_DATA = "stdb-db-data";

export class SetDatabaseInfo {
  static type = "[App] Set Database Info";

  constructor(
    public instanceUrl: string,
    public database: string,
    public token: string,
    public metricsUrl: string | null,
  ) {}
}

export class TestDatabaseConnectionAction {
  static type = "[App]";

  constructor(
    public instanceUrl: string,
    public database: string,
    public token: string,
  ) {}
}

export interface AppStateModel {
  instanceUrl: string;
  database: string;
  token: string;
  metricsUrl: string | null;
}

@State<AppStateModel>({
  name: "app",
  defaults: {
    instanceUrl: "",
    database: "",
    token: "",
    metricsUrl: null,
  },
})
@Injectable()
export class AppState implements NgxsOnInit {
  private readonly api = inject(ApiService);
  private readonly toast = inject(MessageService);

  @Selector()
  static selectToken(state: AppStateModel) {
    return state.token;
  }

  @Selector()
  static selectDbInfos(state: AppStateModel) {
    return { url: state.instanceUrl, db: state.database, token: state.token };
  }

  @Selector()
  static selectHasCredentialsSet(state: AppStateModel) {
    return !!state.instanceUrl && !!state.token && !!state.database;
  }

  ngxsOnInit(ctx: StateContext<any>): void {
    const data = localStorage.getItem(DB_DATA);
    if (data) {
      ctx.patchState({
        ...JSON.parse(data),
      });
    }
  }

  @Action(TestDatabaseConnectionAction)
  testDatabaseConnection(
    _ctx: StateContext<AppStateModel>,
    action: TestDatabaseConnectionAction,
  ) {
    return this.api
      .testConnection(action.instanceUrl, action.database, action.token)
      .pipe(
        tap((res) => {
          if (res.error) {
            this.toast.add({
              severity: "error",
              summary: "Connection to SpacetimeDB failed",
              detail: res.error,
            });
            return;
          }
          this.toast.add({
            severity: "success",
            summary: "Connection to SpacetimeDB established",
          });
        }),
      );
  }

  @Action(SetDatabaseInfo)
  setDatabaseInfo(ctx: StateContext<AppStateModel>, action: SetDatabaseInfo) {
    const newValues = {
      instanceUrl: action.instanceUrl,
      database: action.database,
      token: action.token,
      metricsUrl: action.metricsUrl,
    };

    ctx.patchState(newValues);
    localStorage.setItem(DB_DATA, JSON.stringify(newValues));
    return EMPTY;
  }
}
