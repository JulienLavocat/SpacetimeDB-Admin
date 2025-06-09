import { Component, inject, OnInit } from "@angular/core";
import { Store } from "@ngxs/store";
import { ExplorerState } from "./explorer.state";
import {
  CloseExplorerTab,
  FilterExplorerTables,
  LoadExplorerSchema,
  OpenExplorerTable,
} from "./explorer.actions";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { DividerModule } from "primeng/divider";
import { ButtonModule } from "primeng/button";
import { Table } from "../../api";
import { TabsModule } from "primeng/tabs";
import { ExplorerTabComponent } from "./explorer-tab/explorer-tab.component";
import { MessageModule } from "primeng/message";
import { SplitterModule } from "primeng/splitter";
import { InputTextModule } from "primeng/inputtext";

@Component({
  selector: "app-explorer",
  imports: [
    ProgressSpinnerModule,
    DividerModule,
    ButtonModule,
    TabsModule,
    ExplorerTabComponent,
    MessageModule,
    SplitterModule,
    InputTextModule,
  ],
  templateUrl: "./explorer.component.html",
  styleUrl: "./explorer.component.scss",
})
export class ExplorerComponent implements OnInit {
  private readonly store = inject(Store);

  tables = this.store.selectSignal(ExplorerState.tables);
  isLoading = this.store.selectSignal(ExplorerState.isLoading);
  tabs = this.store.selectSignal(ExplorerState.tabs);
  selectedTab = this.store.selectSignal(ExplorerState.selectedTab);

  ngOnInit(): void {
    this.store.dispatch(new LoadExplorerSchema());
  }

  openTable(table: Table): void {
    this.store.dispatch(new OpenExplorerTable(table));
  }

  closeTab(tabId: string): void {
    this.store.dispatch(new CloseExplorerTab(tabId));
  }

  onTabChange(event: string | number): void {
    console.log("Tab changed to index:", event);
  }

  onFilterTablesChange(event: Event): void {
    const target = event.target as any;
    const value = target?.value;
    this.store.dispatch(new FilterExplorerTables(value));
  }
}
