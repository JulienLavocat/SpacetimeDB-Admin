import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { SetDatabaseInfo } from './app.actions';
import { Injectable } from '@angular/core';

const DB_DATA = 'stdb-db-data';

export interface AppStateModel {
  instanceUrl: string;
  database: string;
  token: string;
}

@State<AppStateModel>({
  name: 'app',
  defaults: {
    instanceUrl: 'https://stdb.jlavocat.eu',
    database: 'stellarwar',
    token: 'test',
  },
})
@Injectable()
export class AppState implements NgxsOnInit {
  @Selector()
  static selectToken(state: AppStateModel) {
    return state.token;
  }

  @Selector()
  static selectDbInfos(state: AppStateModel) {
    console.log(state);
    return { url: state.instanceUrl, db: state.database };
  }

  ngxsOnInit(ctx: StateContext<any>): void {
    const data = localStorage.getItem(DB_DATA);
    if (data) {
      ctx.patchState({
        ...JSON.parse(data),
      });
    }
  }

  @Action(SetDatabaseInfo)
  setDatabaseInfo(ctx: StateContext<AppStateModel>, action: SetDatabaseInfo) {
    const newValues = {
      instanceUrl: action.instanceUrl,
      database: action.database,
      token: action.token,
    };

    ctx.patchState(newValues);
    localStorage.setItem(DB_DATA, JSON.stringify(newValues));
  }
}
