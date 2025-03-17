import { inject, Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { EMPTY, tap } from "rxjs";
import { ApiService, Table } from "../../api";

export interface SqlStateModel {
  tabs: { name: string; id: string }[];
  selectedTab: string;
  isLoading: boolean;
  tables: Table[];
}

export class AddSqlTab {
  static type = "[SQL] Add Tab";
}

export class SetSqlTabName {
  static type = "[SQL] Set Name";
  constructor(
    public id: string,
    public name: string,
  ) {}
}

export class UpdateSqlSelectedTab {
  static type = "[SQL] Update Selected Tab";
  constructor(public id: string) {}
}

export class LoadSqlSchema {
  static type = "[SQL] Update Sql Completions";
}

const defaultTabId = self.crypto.randomUUID();

@State<SqlStateModel>({
  name: "sql",
  defaults: {
    tabs: [{ name: "Query 1", id: defaultTabId }],
    selectedTab: defaultTabId,
    isLoading: true,
    tables: [],
  },
})
@Injectable()
export class SqlState {
  private readonly api = inject(ApiService);

  @Selector()
  static selectTabs(state: SqlStateModel) {
    return { tabs: state.tabs, selectedTab: state.selectedTab };
  }

  @Selector()
  static selectIsLoading(state: SqlStateModel) {
    return state.isLoading;
  }

  @Selector()
  static selectTables(state: SqlStateModel) {
    return state.tables;
  }

  @Action(LoadSqlSchema)
  loadSqlSchema(ctx: StateContext<SqlStateModel>) {
    ctx.patchState({ isLoading: true });
    return this.api.getSchema().pipe(
      tap((schema) => {
        ctx.patchState({ isLoading: false, tables: schema.tables });
      }),
    );
  }

  @Action(AddSqlTab)
  addSqlTab(ctx: StateContext<SqlStateModel>) {
    const id = self.crypto.randomUUID();
    ctx.patchState({
      tabs: [
        ...ctx.getState().tabs,
        {
          id,
          name: "Query " + (ctx.getState().tabs.length + 1),
        },
      ],
      selectedTab: id,
    });
    return EMPTY;
  }

  @Action(UpdateSqlSelectedTab)
  updateSelectedTab(
    ctx: StateContext<SqlStateModel>,
    action: UpdateSqlSelectedTab,
  ) {
    ctx.patchState({ selectedTab: action.id });
    return EMPTY;
  }

  @Action(SetSqlTabName)
  setSqlTabName(ctx: StateContext<SqlStateModel>, action: SetSqlTabName) {
    ctx.patchState({
      tabs: ctx
        .getState()
        .tabs.map((tab) =>
          tab.id !== action.id ? tab : { ...tab, name: action.name },
        ),
    });
    return EMPTY;
  }
}
