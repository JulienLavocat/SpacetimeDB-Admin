import { Injectable, inject } from '@angular/core';
import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { AppInitAction, SetDatabaseAction } from './app.actions';
import { ApiService } from './api.service';
import { of, tap } from 'rxjs';

const LS_DB = 'dbName';
const LS_TOKEN = 'token';

export interface AppStateModel {
  database: string;
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
    database: '',
    token: '',
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
  static database(state: AppStateModel) {
    return state.database;
  }

  @Selector()
  static token(state: AppStateModel) {
    return state.token;
  }

  @Action(AppInitAction)
  init(ctx: StateContext<AppStateModel>) {
    const database = localStorage.getItem(LS_DB) ?? '';
    const token = localStorage.getItem(LS_TOKEN) ?? '';
    ctx.patchState({ database, token });
    return this.api.getInfos().pipe(
      tap((infos) =>
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
    localStorage.setItem(LS_DB, action.name);
    localStorage.setItem(LS_TOKEN, action.token);

    return ctx.dispatch(new AppInitAction());
  }
}
