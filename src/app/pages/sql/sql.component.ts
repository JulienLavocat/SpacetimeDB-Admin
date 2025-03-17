import { Component, OnInit } from "@angular/core";
import { QueryComponent } from "./query/query.component";
import { TabsModule } from "primeng/tabs";
import { ButtonModule } from "primeng/button";

const LAST_TABS_COUNT = "sql.last-tabs-count";

@Component({
  selector: "app-sql",
  imports: [QueryComponent, TabsModule, ButtonModule],
  templateUrl: "./sql.component.html",
  styleUrl: "./sql.component.css",
})
export class SqlComponent implements OnInit {
  tabs = [0];
  selectedTab = 0;

  ngOnInit(): void {
    const tabsCount = parseInt(localStorage.getItem(LAST_TABS_COUNT) ?? "1");
    this.tabs = new Array(tabsCount).fill(0).map((_, i) => i);
    console.log(this.tabs);
  }

  onTabChange(value: string | number) {
    if (value !== "add") return;
    this.tabs.push(this.tabs.length);
    this.selectedTab = this.tabs.length - 1;
    localStorage.setItem(LAST_TABS_COUNT, this.tabs.length.toString());
  }
}
