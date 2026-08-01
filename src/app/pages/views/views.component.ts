import { Component, inject, OnInit } from "@angular/core";
import { Store } from "@ngxs/store";
import { ViewsState } from "./views.state";
import {
  CloseViewTab,
  FilterViews,
  LoadViewsSchema,
  OpenView,
} from "./views.actions";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { DividerModule } from "primeng/divider";
import { ButtonModule } from "primeng/button";
import { View } from "../../api";
import { TabsModule } from "primeng/tabs";
import { ViewTabComponent } from "./view-tab/view-tab.component";
import { MessageModule } from "primeng/message";
import { SplitterModule } from "primeng/splitter";
import { InputTextModule } from "primeng/inputtext";
import { TagModule } from "primeng/tag";

@Component({
  selector: "app-views",
  imports: [
    ProgressSpinnerModule,
    DividerModule,
    ButtonModule,
    TabsModule,
    ViewTabComponent,
    MessageModule,
    SplitterModule,
    InputTextModule,
    TagModule,
  ],
  templateUrl: "./views.component.html",
  styleUrl: "./views.component.scss",
})
export class ViewsComponent implements OnInit {
  private readonly store = inject(Store);

  views = this.store.selectSignal(ViewsState.views);
  isLoading = this.store.selectSignal(ViewsState.isLoading);
  tabs = this.store.selectSignal(ViewsState.tabs);
  selectedTab = this.store.selectSignal(ViewsState.selectedTab);

  ngOnInit(): void {
    this.store.dispatch(new LoadViewsSchema());
  }

  openView(view: View): void {
    this.store.dispatch(new OpenView(view));
  }

  closeTab(tabId: string): void {
    this.store.dispatch(new CloseViewTab(tabId));
  }

  onTabChange(_event: string | number): void {}

  onFilterViewsChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.store.dispatch(new FilterViews(target?.value ?? ""));
  }
}
