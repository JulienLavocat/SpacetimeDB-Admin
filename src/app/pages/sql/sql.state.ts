import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { EMPTY } from "rxjs";

export interface SqlStateModel {
  tabs: { name: string; id: string; query: string }[];
  selectedTab: string;
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

export class SetSqlTabQuery {
  static type = "[SQL] Set Tab Query";
  constructor(
    public id: string,
    public query: string,
  ) {}
}

const defaultTabId = self.crypto.randomUUID();

@State<SqlStateModel>({
  name: "sql",
  defaults: {
    tabs: [{ name: "Query 1", id: defaultTabId, query: "" }],
    selectedTab: defaultTabId,
  },
})
@Injectable()
export class SqlState {
  @Selector()
  static selectTabs(state: SqlStateModel) {
    return { tabs: state.tabs, selectedTab: state.selectedTab };
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
          query: "",
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

  @Action(SetSqlTabQuery)
  setSqlTabQuery(ctx: StateContext<SqlStateModel>, action: SetSqlTabQuery) {
    ctx.patchState({
      tabs: ctx
        .getState()
        .tabs.map((tab) =>
          tab.id !== action.id ? tab : { ...tab, query: action.query },
        ),
    });
    return EMPTY;
  }
}
