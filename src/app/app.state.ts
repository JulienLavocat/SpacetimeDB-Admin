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
}

@State<AppStateModel>({
  name: "app",
  defaults: {
    instanceUrl: "",
    database: "",
    token: "",
  },
})
@Injectable()
export class AppState {
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
    ctx.patchState({
      instanceUrl: action.instanceUrl,
      database: action.database,
      token: action.token,
    });
    return EMPTY;
  }
}
