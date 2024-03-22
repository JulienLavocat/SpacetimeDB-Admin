import { Injectable, inject } from '@angular/core';
import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { AppInitAction, FetchLogsAction } from './app.actions';
import { ApiService, LogLine } from './api.service';
import { combineLatest, tap } from 'rxjs';

export interface AppStateModel {
  name: string;
  infos: {
    address: string;
    identity: string;
  };
  token: string;
  logs: LogLine[];
}

@Injectable()
@State<AppStateModel>({
  name: 'appState',
  defaults: {
    name: 'test',
    token:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJoZXhfaWRlbnRpdHkiOiI1ZWJkMTIyMWFmYjEwYWFmNjFkNmM4YTUyNzQxM2Q4MmExYWQ5ZWU5YWM5ZWE0MjBlOGRjODBkYzkzNTAzOTRlIiwiaWF0IjoxNzEwODU3Mjc2LCJleHAiOm51bGx9.xsx-V8_8fkE6H-NxCMgoHUgd8wyrSE-_zCeslzrTVxtgWEUNDN0V6cnqWgV0k8tuArSZBuhaT8WiNqhrgjIXZA',
    infos: {
      address: '',
      identity: '',
    },
    logs: [],
  },
})
export class AppState implements NgxsOnInit {
  api = inject(ApiService);

  ngxsOnInit(ctx: StateContext<AppStateModel>): void {
    ctx.dispatch(new AppInitAction());
  }

  @Selector()
  static infos(state: AppStateModel) {
    return state.infos;
  }

  @Selector()
  static dbName(state: AppStateModel) {
    return state.name;
  }

  @Selector()
  static logs(state: AppStateModel) {
    return state.logs;
  }

  @Action(AppInitAction)
  init(ctx: StateContext<AppStateModel>) {
    return combineLatest([this.api.getInfos(ctx.getState().name)]).pipe(
      tap(([infos]) =>
        ctx.patchState({
          infos: {
            address: infos.address,
            identity: infos.identity,
          },
        }),
      ),
    );
  }

  @Action(FetchLogsAction)
  fetchLogs(ctx: StateContext<AppStateModel>) {
    return this.api.getLogs(ctx.getState().name, ctx.getState().token).pipe(
      tap((logs) => {
        ctx.patchState({ logs });
      }),
    );
  }
}
