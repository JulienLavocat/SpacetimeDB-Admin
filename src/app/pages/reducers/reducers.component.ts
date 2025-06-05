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
import { ParsedType, Reducer } from "../../api";

@Component({
  selector: "app-reducers",
  imports: [
    ProgressSpinnerModule,
    CardModule,
    ButtonModule,
    ReducerComponent,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
  ],
  templateUrl: "./reducers.component.html",
  styleUrl: "./reducers.component.css",
})
export class ReducersComponent implements OnInit {
  private readonly store = inject(Store);

  isLoading = this.store.selectSignal(ReducersState.isLoading);
  reducers = this.store.selectSignal(ReducersState.reducers);
  schema = this.store.selectSignal(ReducersState.schema);

  ngOnInit(): void {
    this.store.dispatch(new LoadReducersAction());
  }

  filter(event: Event) {
    const target = event.target as any;
    const value = target?.value;
    this.store.dispatch(new FilterReducersAction(value));
  }

  isReducerDisabled(reducer: Reducer): boolean {
    return reducer.params.elements
      .map((param) =>
        ParsedType.fromAlgebraicType(this.schema()!, param.algebraic_type),
      )
      .some((param) => {
        if (param.isArray) return param.valueType?.isPrimitive ?? false;
        return param.isPrimitive;
      });
  }
}
