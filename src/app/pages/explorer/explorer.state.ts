import { Action, Selector, State, StateContext } from "@ngxs/store";
import {
  CloseExplorerTab,
  LoadExplorerSchema,
  OpenExplorerTable,
} from "./explorer.actions";
import { ApiService, Table } from "../../api";
import { inject, Injectable } from "@angular/core";
import { tap } from "rxjs";

export interface ExplorerStateModel {
  isLoading: boolean;
  tables: Table[];
  tabs: { id: string; table: Table }[];
  selectedTab: string;
  tablesFilter: string;
}

@State<ExplorerStateModel>({
  name: "explorer",
  defaults: {
    isLoading: true,
    tables: [],
    tabs: [],
    selectedTab: "",
    tablesFilter: "",
  },
})
@Injectable()
export class ExplorerState {
  private readonly api = inject(ApiService);

  @Selector()
  public static isLoading(state: ExplorerStateModel): boolean {
    return state.isLoading;
  }

  @Selector()
  public static tables(state: ExplorerStateModel): Table[] {
    return state.tables.filter((table) =>
      table.name.toLowerCase().includes(state.tablesFilter.toLowerCase()),
    );
  }

  @Selector()
  public static tabs(state: ExplorerStateModel) {
    return state.tabs;
  }

  @Selector()
  public static selectedTab(state: ExplorerStateModel) {
    return state.selectedTab;
  }

  @Action(LoadExplorerSchema)
  loadExplorerSchema(ctx: StateContext<ExplorerStateModel>) {
    return this.api.getRawSchema().pipe(
      tap((schema) => {
        ctx.patchState({
          tables: schema.tables,
          isLoading: false,
        });
      }),
    );
  }

  @Action(OpenExplorerTable)
  openExplorerTable(
    ctx: StateContext<ExplorerStateModel>,
    action: OpenExplorerTable,
  ) {
    const state = ctx.getState();

    if (state.tabs.some((tab) => tab.id === action.table.name)) {
      ctx.patchState({
        selectedTab: action.table.name,
      });
      return;
    }

    const newTab = { id: action.table.name, table: action.table };
    ctx.patchState({
      tabs: [...state.tabs, newTab],
      selectedTab: newTab.id,
    });
  }

  @Action(CloseExplorerTab)
  closeExplorerTab(
    ctx: StateContext<ExplorerStateModel>,
    action: CloseExplorerTab,
  ) {
    const state = ctx.getState();
    const tabs = state.tabs.filter((tab) => tab.id !== action.tabId);

    ctx.patchState({
      tabs,
      selectedTab: tabs.length > 0 ? tabs[0].id : "",
    });
  }
}
