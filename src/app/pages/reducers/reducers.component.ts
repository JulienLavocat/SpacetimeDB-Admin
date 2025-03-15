import { AsyncPipe } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { Store } from "@ngxs/store";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { ReducerComponent } from "./reducer/reducer.component";
import { LoadReducersAction, ReducersState } from "./reducers.state";

@Component({
  selector: "app-reducers",
  imports: [
    AsyncPipe,
    ProgressSpinnerModule,
    CardModule,
    ButtonModule,
    ReducerComponent,
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
}
