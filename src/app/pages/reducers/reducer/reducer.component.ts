import { Component, inject, Input } from "@angular/core";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { ChipModule } from "primeng/chip";
import { take, tap } from "rxjs";
import { ApiService, Reducer } from "../../../api";
import { ReducerParamComponent } from "../reducer-param/reducer-param.component";

@Component({
  selector: "app-reducer",
  imports: [CardModule, ReducerParamComponent, ButtonModule, ChipModule],
  templateUrl: "./reducer.component.html",
  styleUrl: "./reducer.component.scss",
})
export class ReducerComponent {
  @Input("reducer") reducer!: Reducer;

  isLoading = false;

  private readonly api = inject(ApiService);
  private readonly toast = inject(MessageService);

  call() {
    this.isLoading = true;
    this.api
      .callReducer(this.reducer.name)
      .pipe(
        take(1),
        tap((result) => {
          this.isLoading = false;

          if (result.error) {
            this.toast.add({
              severity: "error",
              summary: "An error occured while calling the reducer",
              detail: result.error,
              life: 5000,
            });
            return;
          }

          this.toast.add({
            severity: "success",
            summary: "Reducer call successful",
            detail: result.data ? JSON.stringify(result.data) : undefined,
          });
        }),
      )
      .subscribe();
  }
}
