import { LowerCasePipe, NgClass } from "@angular/common";
import { Component, inject, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { CheckboxModule } from "primeng/checkbox";
import { ChipModule } from "primeng/chip";
import { TooltipModule } from "primeng/tooltip";
import { take, tap } from "rxjs";
import { ApiService, Reducer, ReducerParam, StdbTypes } from "../../../api";

const NUMERIC_TYPES: Set<StdbTypes> = new Set([
  "I8",
  "U8",
  "F8",
  "I16",
  "U16",
  "F16",
  "I32",
  "U32",
  "F32",
  "I64",
  "U64",
  "F64",
  "I128",
  "U128",
  "F128",
]);

function parseParamToValue(param: ReducerParam, value: string) {
  if (param.type === "Bool") return !!value;
  if (!NUMERIC_TYPES.has(param.type)) return value;
  if (param.type.startsWith("F")) return parseFloat(value);
  return parseInt(value);
}

function parseArrayParam(param: ReducerParam, value: string) {
  if (!value || typeof value !== "string") return [];

  const regex = /"([^"]*)"|([^,]+)/g;
  const result: string[] = [];
  let match;

  while ((match = regex.exec(value)) !== null) {
    result.push(match[1] ?? match[2]); // Extract quoted text or regular value
  }

  return result.map((v: string) => parseParamToValue(param, v));
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
    LowerCasePipe,
  ],
  templateUrl: "./reducer.component.html",
  styleUrl: "./reducer.component.css",
})
export class ReducerComponent implements OnInit {
  @Input("reducer") reducer!: Reducer;
  @Input("disabled") disabled!: boolean;

  private readonly api = inject(ApiService);
  private readonly toast = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  isLoading = false;
  form: FormGroup = this.fb.group({});

  ngOnInit(): void {
    this.form = this.fb.group(
      Object.fromEntries(
        this.reducer.params.map((param) => [param.name, null]),
      ),
    );
  }

  call() {
    // Arguments must be in the order defined by the reducer
    const args = this.reducer.params.map((param) => {
      const value = this.form.value[param.name];
      return param.type === "Array"
        ? parseArrayParam(param, value)
        : parseParamToValue(param, value);
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

  getReducerType(type: StdbTypes) {
    if (NUMERIC_TYPES.has(type)) {
      return "number";
    }

    if (type === "Bool") {
      return "checkbox";
    }

    return "string";
  }

  displayParam(param: ReducerParam) {
    if (param.type === "Array" && !this.disabled) return `${param.name}: `;

    if (param.type === "Array" && this.disabled)
      return `${param.name}: ${param.arrayType}[]`;

    if (param.type === "Ref") return `${param.name}: ${param.refType?.name}`;

    if (!this.disabled) return `${param.name}: `;

    return `${param.name}: ${param.type}`;
  }

  getTooltip(param: ReducerParam) {
    if (param.type === "Array") {
      return `Array of ${param.arrayType?.toLocaleLowerCase()}, separated by commas: 1,2,3 or "hello","world"`;
    }
    return param.type.toLocaleLowerCase();
  }
}
