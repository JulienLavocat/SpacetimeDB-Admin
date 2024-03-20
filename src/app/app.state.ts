import { Injectable, inject } from '@angular/core';
import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { AppInitAction } from './app.actions';
import { ApiService } from './api.service';
import { tap } from 'rxjs';
import { AppBarComponent } from './shared/app-bar/app-bar.component';

export interface AppStateModel {
  name: string;
  infos: {
    address: string;
    identity: string;
  };
}

@Injectable()
@State<AppStateModel>({
  name: 'appState',
  defaults: {
    name: 'chat',
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

  @Action(AppInitAction)
  init(ctx: StateContext<AppStateModel>) {
    return this.api.getInfos(ctx.getState().name).pipe(
      tap((res) => {
        ctx.patchState({
          infos: {
            address: res.address,
            identity: res.identity,
          },
        });
      }),
    );
  }
}
