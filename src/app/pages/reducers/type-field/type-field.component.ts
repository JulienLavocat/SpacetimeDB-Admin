import { Component, forwardRef, input, OnInit } from "@angular/core";
import {
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from "@angular/forms";
import { ResolvedType, typeLabel } from "../../../api/parse-schema";
import { InputTextModule } from "primeng/inputtext";
import { CheckboxModule } from "primeng/checkbox";
import { SelectModule } from "primeng/select";
import { TextareaModule } from "primeng/textarea";
import { TooltipModule } from "primeng/tooltip";
import { LowerCasePipe } from "@angular/common";

@Component({
  selector: "app-type-field",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    CheckboxModule,
    SelectModule,
    TextareaModule,
    TooltipModule,
    LowerCasePipe,
    // recursive self
    forwardRef(() => TypeFieldComponent),
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TypeFieldComponent),
      multi: true,
    },
  ],
  templateUrl: "./type-field.component.html",
  styleUrl: "./type-field.component.css",
})
export class TypeFieldComponent implements ControlValueAccessor, OnInit {
  readonly type = input.required<ResolvedType>();
  readonly label = input<string>("");

  private readonly fb = new FormBuilder();

  /** Simple control for primitives / identity / json / array text */
  simpleControl = new FormControl<any>(null);

  /** Nested product form */
  productGroup: FormGroup = this.fb.group({});

  /** Sum: variant + payload */
  sumVariantControl = new FormControl<string | null>(null);
  sumPayloadControl = new FormControl<any>(null);

  boolControl = new FormControl(false);

  disabled = false;
  private onChange: (v: any) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    const t = this.type();

    if (t.kind === "product") {
      const controls: Record<string, FormControl> = {};
      for (const field of t.fields) {
        controls[field.name] = new FormControl(defaultValueFor(field.type));
      }
      this.productGroup = this.fb.group(controls);
      this.productGroup.valueChanges.subscribe((v) => {
        this.onChange(v);
        this.onTouched();
      });
    }

    if (t.kind === "sum") {
      const first = t.variants[0]?.name ?? null;
      this.sumVariantControl.setValue(first);
      this.sumVariantControl.valueChanges.subscribe(() => this.emitSum());
      this.sumPayloadControl.valueChanges.subscribe(() => this.emitSum());
      this.emitSum();
    }

    if (t.kind === "primitive" && t.name === "Bool") {
      this.boolControl.valueChanges.subscribe((v) => {
        this.onChange(!!v);
        this.onTouched();
      });
    } else if (
      t.kind === "primitive" ||
      t.kind === "identity" ||
      t.kind === "array" ||
      t.kind === "unknown"
    ) {
      this.simpleControl.valueChanges.subscribe((v) => {
        this.onChange(v);
        this.onTouched();
      });
    }
  }

  private emitSum() {
    this.onChange({
      _variant: this.sumVariantControl.value,
      _payload: this.sumPayloadControl.value,
    });
    this.onTouched();
  }

  writeValue(value: any): void {
    const t = this.type();
    if (t.kind === "product" && value && typeof value === "object") {
      this.productGroup.patchValue(value, { emitEvent: false });
    } else if (t.kind === "sum" && value && typeof value === "object") {
      if ("_variant" in value) {
        this.sumVariantControl.setValue(value._variant, { emitEvent: false });
        this.sumPayloadControl.setValue(value._payload, { emitEvent: false });
      } else {
        const key = Object.keys(value)[0];
        if (key) {
          this.sumVariantControl.setValue(key, { emitEvent: false });
          this.sumPayloadControl.setValue(value[key], { emitEvent: false });
        }
      }
    } else if (t.kind === "primitive" && t.name === "Bool") {
      this.boolControl.setValue(!!value, { emitEvent: false });
    } else {
      this.simpleControl.setValue(value, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.simpleControl.disable({ emitEvent: false });
      this.productGroup.disable({ emitEvent: false });
      this.sumVariantControl.disable({ emitEvent: false });
      this.sumPayloadControl.disable({ emitEvent: false });
      this.boolControl.disable({ emitEvent: false });
    } else {
      this.simpleControl.enable({ emitEvent: false });
      this.productGroup.enable({ emitEvent: false });
      this.sumVariantControl.enable({ emitEvent: false });
      this.sumPayloadControl.enable({ emitEvent: false });
      this.boolControl.enable({ emitEvent: false });
    }
  }

  typeLabel = typeLabel;

  get sumVariants(): { name: string; type: ResolvedType }[] {
    const t = this.type();
    return t.kind === "sum" ? t.variants : [];
  }

  get selectedSumVariantType(): ResolvedType {
    const t = this.type();
    if (t.kind !== "sum") return { kind: "unit" };
    const name = this.sumVariantControl.value;
    return (
      t.variants.find((v) => v.name === name)?.type ?? { kind: "unit" }
    );
  }

  usesJsonEditor(t: ResolvedType): boolean {
    if (t.kind === "unknown") return true;
    if (t.kind === "array") {
      return (
        t.element.kind !== "primitive" && t.element.kind !== "identity"
      );
    }
    return false;
  }

  placeholder(t: ResolvedType): string {
    if (t.kind === "identity") return "hex identity (optional 0x prefix)";
    if (t.kind === "array" && t.element.kind === "primitive") {
      return `${typeLabel(t.element).toLowerCase()}[] e.g. 1,2,3`;
    }
    if (t.kind === "array") {
      return `JSON array of ${typeLabel(t.element)}`;
    }
    if (t.kind === "unknown") return `JSON value (${t.label})`;
    if (t.kind === "primitive") return t.name.toLowerCase();
    return typeLabel(t);
  }

  tooltip(t: ResolvedType): string {
    if (t.kind === "identity") {
      return "Identity as hex string (U256), with or without 0x prefix";
    }
    if (t.kind === "array" && t.element.kind === "primitive") {
      return `Array of ${typeLabel(t.element)}, comma-separated`;
    }
    if (this.usesJsonEditor(t)) {
      return "Enter a JSON value matching this type (SATS-JSON)";
    }
    return typeLabel(t);
  }
}

function defaultValueFor(t: ResolvedType): any {
  switch (t.kind) {
    case "primitive":
      return t.name === "Bool" ? false : null;
    case "identity":
      return "";
    case "unit":
      return null;
    case "array":
      return "";
    case "product": {
      const o: Record<string, any> = {};
      for (const f of t.fields) o[f.name] = defaultValueFor(f.type);
      return o;
    }
    case "sum":
      return {
        _variant: t.variants[0]?.name ?? null,
        _payload: t.variants[0]
          ? defaultValueFor(t.variants[0].type)
          : null,
      };
    case "unknown":
      return "";
  }
}
