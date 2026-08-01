import { Action, Selector, State, StateContext } from "@ngxs/store";
import {
  CloseViewTab,
  FilterViews,
  LoadViewsSchema,
  OpenView,
} from "./views.actions";
import { ApiService, View } from "../../api";
import { inject, Injectable } from "@angular/core";
import { tap } from "rxjs";

export interface ViewsStateModel {
  isLoading: boolean;
  views: View[];
  tabs: { id: string; view: View }[];
  selectedTab: string;
  viewsFilter: string;
  error?: string;
}

@State<ViewsStateModel>({
  name: "views",
  defaults: {
    isLoading: true,
    views: [],
    tabs: [],
    selectedTab: "",
    viewsFilter: "",
  },
})
@Injectable()
export class ViewsState {
  private readonly api = inject(ApiService);

  @Selector()
  public static isLoading(state: ViewsStateModel): boolean {
    return state.isLoading;
  }

  @Selector()
  public static views(state: ViewsStateModel): View[] {
    return state.views.filter((view) =>
      view.name.toLowerCase().includes(state.viewsFilter.toLowerCase()),
    );
  }

  @Selector()
  public static tabs(state: ViewsStateModel) {
    return state.tabs;
  }

  @Selector()
  public static selectedTab(state: ViewsStateModel) {
    return state.selectedTab;
  }

  @Selector()
  public static error(state: ViewsStateModel) {
    return state.error;
  }

  @Action(LoadViewsSchema)
  loadViewsSchema(ctx: StateContext<ViewsStateModel>) {
    ctx.patchState({ isLoading: true, error: undefined });
    return this.api.getSchema().pipe(
      tap((schema) => {
        ctx.patchState({
          views: schema.views,
          isLoading: false,
        });
      }),
    );
  }

  @Action(FilterViews)
  filterViews(ctx: StateContext<ViewsStateModel>, action: FilterViews) {
    ctx.patchState({
      viewsFilter: action.filter,
    });
  }

  @Action(OpenView)
  openView(ctx: StateContext<ViewsStateModel>, action: OpenView) {
    const state = ctx.getState();

    if (state.tabs.some((tab) => tab.id === action.view.name)) {
      ctx.patchState({
        selectedTab: action.view.name,
      });
      return;
    }

    const newTab = { id: action.view.name, view: action.view };
    ctx.patchState({
      tabs: [...state.tabs, newTab],
      selectedTab: newTab.id,
    });
  }

  @Action(CloseViewTab)
  closeViewTab(ctx: StateContext<ViewsStateModel>, action: CloseViewTab) {
    const state = ctx.getState();
    const tabs = state.tabs.filter((tab) => tab.id !== action.tabId);

    ctx.patchState({
      tabs,
      selectedTab: tabs.length > 0 ? tabs[0].id : "",
    });
  }
}
