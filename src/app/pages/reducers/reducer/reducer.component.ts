import { LowerCasePipe, NgClass } from "@angular/common";
import { Component, computed, inject, input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { CheckboxModule } from "primeng/checkbox";
import { ChipModule } from "primeng/chip";
import { TooltipModule } from "primeng/tooltip";
import { take, tap } from "rxjs";
import { ApiService, ParsedType, Reducer, ReducerParam } from "../../../api";
import { Store } from "@ngxs/store";
import { ReducersState } from "../reducers.state";

type ParsedReducerParam = {
  name: string;
  type: ParsedType;
};

function parseParamToValue(param: ParsedType, value: string) {
  if (param.isBoolean) return !!value;
  if (!param.isNumeric) return value;
  if (param.isFloat) return parseFloat(value);
  return parseInt(value);
}

function parseArrayParam(param: ParsedReducerParam, value: string) {
  if (!value || typeof value !== "string") return [];

  const regex = /"([^"]*)"|([^,]+)/g;
  const result: string[] = [];
  let match;

  while ((match = regex.exec(value)) !== null) {
    result.push(match[1] ?? match[2]); // Extract quoted text or regular value
  }

  return result.map((v: string) => parseParamToValue(param.type, v));
}

@Component({
  selector: "app-reducer",
  imports: [
    CardModule,
    NgClass,
    ButtonModule,
    ChipModule,
    ReactiveFormsModule,
    TooltipModule,
    CheckboxModule,
  ],
  templateUrl: "./reducer.component.html",
  styleUrl: "./reducer.component.css",
})
export class ReducerComponent implements OnInit {
  readonly reducer = input.required<Reducer>();
  readonly disabled = input.required<boolean>();

  private readonly api = inject(ApiService);
  private readonly toast = inject(MessageService);
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);

  schema = this.store.selectSignal(ReducersState.schema);
  parsedParams = computed(() => {
    const schema = this.schema();
    if (!schema) return [];
    return this.reducer().params.elements.map((param) => ({
      name: param.name.some ?? "Unknown",
      type: ParsedType.fromAlgebraicType(schema, param.algebraic_type),
    }));
  });
  isLoading = false;
  form: FormGroup = this.fb.group({});

  ngOnInit(): void {
    this.form = this.fb.group(
      Object.fromEntries(
        this.reducer().params.elements.map((param) => [param.name.some!, null]),
      ),
    );
  }

  call() {
    // Arguments must be in the order defined by the reducer
    const args = this.parsedParams().map((param) => {
      const value = this.form.value[param.name];
      return param.type.isArray
        ? parseArrayParam(param, value)
        : parseParamToValue(param.type, value);
    });

    console.log(
      "Calling reducer",
      this.reducer.name,
      "with args",
      args,
      "from form",
      this.form.value,
    );

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

  getReducerType(type: ParsedType) {
    if (type.isNumeric) {
      return "number";
    }

    if (type.isBoolean) {
      return "checkbox";
    }

    return "string";
  }

  displayParam(param: ParsedReducerParam) {
    return `${param.name} (${param.type})`;
  }

  getTooltip(param: ParsedType): string {
    if (param.isArray) {
      return `Array of ${param.getInnerType()}, separated by commas: 1,2,3 or "hello","world"`;
    }

    return param.toString();
  }

  getPlaceholder(param: ParsedType): string {
    return param.toString();
  }

  getLifecycle(): string {
    const lifecycle = this.reducer().lifecycle;
    if (!lifecycle || !lifecycle.some) {
      return "unknown";
    }

    const keys = Object.keys(lifecycle.some);
    if (keys.length === 0) {
      return "unknown";
    }

    return keys[0].toLowerCase();
  }
}
