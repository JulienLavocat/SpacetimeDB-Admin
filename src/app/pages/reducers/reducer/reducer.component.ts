import { NgClass } from "@angular/common";
import { Component, inject, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { ChipModule } from "primeng/chip";
import { TooltipModule } from "primeng/tooltip";
import { take, tap } from "rxjs";
import {
  ApiService,
  encodeReducerArgs,
  Reducer,
  typeLabel,
} from "../../../api";
import { TypeFieldComponent } from "../type-field/type-field.component";

@Component({
  selector: "app-reducer",
  imports: [
    CardModule,
    NgClass,
    ButtonModule,
    ChipModule,
    ReactiveFormsModule,
    TooltipModule,
    TypeFieldComponent,
  ],
  templateUrl: "./reducer.component.html",
  styleUrl: "./reducer.component.css",
})
export class ReducerComponent implements OnInit {
  @Input("reducer") reducer!: Reducer;

  private readonly api = inject(ApiService);
  private readonly toast = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  isLoading = false;
  form: FormGroup = this.fb.group({});
  typeLabel = typeLabel;

  ngOnInit(): void {
    this.form = this.fb.group(
      Object.fromEntries(
        this.reducer.params.map((param) => [param.name, null]),
      ),
    );
  }

  call() {
    const args = encodeReducerArgs(this.reducer.params, this.form.value);

    this.isLoading = true;
    this.api
      .callReducer(this.reducer.name, args)
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

  displayParamName(param: { name: string; resolved: any }) {
    return `${param.name}: ${typeLabel(param.resolved)}`;
  }
}
