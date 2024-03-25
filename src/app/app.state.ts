import { Injectable, inject } from '@angular/core';
import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import {
  AppInitAction,
  FetchLogsAction,
  SetDatabaseAction,
} from './app.actions';
import { ApiService, LogLine } from './api.service';
import { combineLatest, tap } from 'rxjs';

export interface AppStateModel {
  name: string;
  infos: {
    address: string;
    identity: string;
  };
  token: string;
}

@Injectable()
@State<AppStateModel>({
  name: 'appState',
  defaults: {
    name: 'dev',
    token:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJoZXhfaWRlbnRpdHkiOiI1ZmM5YzEwMmM2OTRhOGJkN2E5NmUzNTg4YmQwZjc2MGFhNGE1MTkxNWViZmNkNzhjYWEwNjk5NWNkNWIzOGI5IiwiaWF0IjoxNzExMjczNDAxLCJleHAiOm51bGx9.cby7rQMwC3UKvIwJ2W8k5BP9_f3I5jIGWhVxmE55szCDfWu8PJQrn-FtaqQbFVi7HOJzva-lXidmycCQXF_HJw',
    infos: {
      address: '',
      identity: '',
    },
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
  static token(state: AppStateModel) {
    return state.token;
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

  @Action(SetDatabaseAction)
  setDatabase(ctx: StateContext<AppStateModel>, action: SetDatabaseAction) {
    ctx.patchState({
      token: action.token,
      name: action.name,
    });

    return ctx.dispatch(new AppInitAction());
  }
}
