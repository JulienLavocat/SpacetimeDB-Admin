import { AsyncPipe } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { Store } from "@ngxs/store";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { ReducerComponent } from "./reducer/reducer.component";
import {
  FilterReducersAction,
  LoadReducersAction,
  ReducersState,
} from "./reducers.state";
import { InputGroupModule } from "primeng/inputgroup";
import { InputTextModule } from "primeng/inputtext";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";

@Component({
  selector: "app-reducers",
  imports: [
    AsyncPipe,
    ProgressSpinnerModule,
    CardModule,
    ButtonModule,
    ReducerComponent,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
  ],
  templateUrl: "./reducers.component.html",
  styleUrl: "./reducers.component.scss",
})
export class ReducersComponent implements OnInit {
  private readonly store = inject(Store);

  data$ = this.store.select(ReducersState.selectData);

  ngOnInit(): void {
    this.store.dispatch(new LoadReducersAction());
  }

  filter(event: Event) {
    const target = event.target as any;
    const value = target?.value;
    this.store.dispatch(new FilterReducersAction(value));
  }
}
