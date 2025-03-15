import { inject, Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { EMPTY, tap } from "rxjs";
import { Reducer } from "../../api";
import { ApiService } from "../../api/api.service";

export class LoadReducersAction {
  static type = "[Reducers] Load";
}

export class CallReducerAction {
  static type = "[Reducers] Call Reducer";
  constructor(
    public name: string,
    public args?: any[],
  ) {}
}

export class FilterReducersAction {
  static type = "[Reducers] Filter Reducers";
  constructor(public filter: string) {}
}

export interface ReducersStateModel {
  isLoading: boolean;
  reducers: Reducer[];
  filter: string;
}

@State<ReducersStateModel>({
  name: "reducers",
  defaults: {
    isLoading: false,
    filter: "",
    reducers: [],
  },
})
@Injectable()
export class ReducersState {
  private readonly api = inject(ApiService);

  @Selector()
  static selectData(state: ReducersStateModel) {
    return {
      reducers: state.reducers.filter((e) => e.name.includes(state.filter)),
      isLoading: state.isLoading,
    };
  }

  @Action(LoadReducersAction)
  loadReducers(ctx: StateContext<ReducersStateModel>) {
    ctx.patchState({ isLoading: true });

    return this.api.getSchema().pipe(
      tap(({ reducers }) =>
        ctx.patchState({
          reducers: reducers
            .sort((a, b) => a.name.localeCompare(b.name))
            .sort((a, b) =>
              (a.lifecycle ?? "").localeCompare(b.lifecycle ?? ""),
            ),
          isLoading: false,
          filter: "",
        }),
      ),
    );
  }

  @Action(FilterReducersAction)
  filterReducers(
    ctx: StateContext<ReducersStateModel>,
    action: FilterReducersAction,
  ) {
    ctx.patchState({ filter: action.filter });
    return EMPTY;
  }
}
