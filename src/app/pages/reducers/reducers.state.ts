import { inject, Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { EMPTY, tap } from "rxjs";
import { getReducerLifecycle, RawModuleRef9, Reducer } from "../../api";
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
  schema?: RawModuleRef9;
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
  static reducers(state: ReducersStateModel) {
    return state.reducers.filter((e) => e.name.includes(state.filter));
  }

  @Selector()
  static isLoading(state: ReducersStateModel) {
    return state.isLoading;
  }

  @Selector()
  static schema(state: ReducersStateModel) {
    return state.schema;
  }

  @Action(LoadReducersAction)
  loadReducers(ctx: StateContext<ReducersStateModel>) {
    ctx.patchState({ isLoading: true });

    return this.api.getRawSchema().pipe(
      tap(({ reducers }) =>
        ctx.patchState({
          reducers: reducers
            .sort((a, b) => a.name.localeCompare(b.name))
            .sort((a, b) =>
              (getReducerLifecycle(a) ?? "").localeCompare(
                getReducerLifecycle(b) ?? "",
              ),
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
