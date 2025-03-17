import { AsyncPipe } from "@angular/common";
import { Component, inject } from "@angular/core";
import { Store } from "@ngxs/store";
import { ButtonModule } from "primeng/button";
import { DialogService } from "primeng/dynamicdialog";
import { TabsModule } from "primeng/tabs";
import { take, tap } from "rxjs";
import { QueryComponent } from "./query/query.component";
import { RenameTabComponent } from "./rename-tab/rename-tab.component";
import {
  AddSqlTab,
  SetSqlTabName,
  SqlState,
  UpdateSqlSelectedTab,
} from "./sql.state";

@Component({
  selector: "app-sql",
  imports: [QueryComponent, TabsModule, ButtonModule, AsyncPipe],
  templateUrl: "./sql.component.html",
  styleUrl: "./sql.component.css",
})
export class SqlComponent {
  private readonly store = inject(Store);
  private readonly dialog = inject(DialogService);

  tabs$ = this.store.select(SqlState.selectTabs);

  onTabChange(value: string | number) {
    if (value === "add") {
      this.store.dispatch(new AddSqlTab());
    } else {
      this.store.dispatch(new UpdateSqlSelectedTab(value as string));
    }
  }

  onRightClick(id: string, name: string) {
    this.dialog
      .open(RenameTabComponent, {
        header: "Rename tab: " + name,
        modal: true,
        focusOnShow: false,
        closable: true,
        closeOnEscape: true,
        dismissableMask: true,
        inputValues: {
          name,
        },
      })
      .onClose.pipe(
        take(1),
        tap((newName) => {
          if (newName) this.store.dispatch(new SetSqlTabName(id, newName));
        }),
      )
      .subscribe();

    return false;
  }
}
