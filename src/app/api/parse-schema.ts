import { AlgebraicType, RawSchema, RustOption, StdbTypes } from "./types";
import { RawMiscModuleExportV9, RawViewDefV9 } from "./raw-types";

export type ReducerLifecycle = "Init" | "OnDisconnect" | "OnConnect";

/** Fully resolved type tree for UI + SATS-JSON encoding. */
export type ResolvedType =
  | { kind: "primitive"; name: StdbTypes }
  | { kind: "identity" }
  | { kind: "unit" }
  | { kind: "array"; element: ResolvedType }
  | {
      kind: "product";
      typeName?: string;
      fields: { name: string; type: ResolvedType }[];
    }
  | {
      kind: "sum";
      typeName?: string;
      variants: { name: string; type: ResolvedType }[];
    }
  | { kind: "unknown"; label: string };

export interface Table {
  name: string;
  columns: { name: string; type: string }[];
  primary_key: {};
}

export interface Param {
  name: string;
  /** Fully resolved type for forms and encoding. */
  resolved: ResolvedType;
  /** @deprecated Prefer `resolved`; kept for simple display helpers. */
  type: StdbTypes;
  arrayType: StdbTypes | string | null;
  refType: { name: string; index: number } | null;
  productType: string | null;
}

export interface Reducer {
  name: string;
  params: Param[];
  lifecycle: ReducerLifecycle | null;
}

export interface View {
  name: string;
  isAnonymous: boolean;
  isPublic: boolean;
  columns: { name: string; type: string }[];
}

export interface Schema {
  reducers: Reducer[];
  tables: Table[];
  views: View[];
  typespace: AlgebraicType[];
  typeNames: Map<number, string>;
}

const PRIMITIVE_KEYS = new Set([
  "Bool",
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
  "U256",
  "F128",
  "String",
]);

function optionSome<T>(opt: RustOption<T> | undefined | null): T | undefined {
  if (opt == null) return undefined;
  if (typeof opt === "object" && "some" in opt) return opt.some as T;
  return undefined;
}

function typeTag(algebraicType: AlgebraicType): string {
  if (!algebraicType || typeof algebraicType !== "object") return "unknown";
  return Object.keys(algebraicType)[0] ?? "unknown";
}

function isIdentityProduct(product: {
  elements: { name: any; algebraic_type: AlgebraicType }[];
}): boolean {
  if (product.elements.length !== 1) return false;
  const el = product.elements[0];
  const name = optionSome(el.name) ?? el.name;
  return name === "__identity__" && typeTag(el.algebraic_type) === "U256";
}

function isUnitProduct(product: { elements: unknown[] }): boolean {
  return product.elements.length === 0;
}

function buildTypeNameMap(schema: RawSchema): Map<number, string> {
  const map = new Map<number, string>();
  for (const t of schema.types ?? []) {
    map.set(t.ty, t.name?.name ?? `Type${t.ty}`);
  }
  return map;
}

/**
 * Resolve an AlgebraicType into a ResolvedType tree using the module typespace.
 */
export function resolveAlgebraicType(
  algebraicType: AlgebraicType,
  typespace: AlgebraicType[],
  typeNames: Map<number, string>,
  seen: Set<number> = new Set(),
): ResolvedType {
  const tag = typeTag(algebraicType);

  if (PRIMITIVE_KEYS.has(tag)) {
    return { kind: "primitive", name: tag as StdbTypes };
  }

  if (tag === "Array") {
    const element = algebraicType["Array"] as AlgebraicType;
    return {
      kind: "array",
      element: resolveAlgebraicType(element, typespace, typeNames, seen),
    };
  }

  if (tag === "Map") {
    return { kind: "unknown", label: "Map" };
  }

  if (tag === "Ref") {
    const index = algebraicType["Ref"] as number;
    if (seen.has(index)) {
      return {
        kind: "unknown",
        label: typeNames.get(index) ?? `Ref(${index})`,
      };
    }
    const next = new Set(seen);
    next.add(index);
    const target = typespace[index];
    if (!target) {
      return { kind: "unknown", label: `Ref(${index})` };
    }
    const resolved = resolveAlgebraicType(target, typespace, typeNames, next);
    const typeName = typeNames.get(index);
    if (resolved.kind === "product" || resolved.kind === "sum") {
      return { ...resolved, typeName: resolved.typeName ?? typeName };
    }
    return resolved;
  }

  if (tag === "Product") {
    const product = algebraicType["Product"] as {
      elements: { name: any; algebraic_type: AlgebraicType }[];
    };
    if (isIdentityProduct(product)) {
      return { kind: "identity" };
    }
    if (isUnitProduct(product)) {
      return { kind: "unit" };
    }
    return {
      kind: "product",
      fields: product.elements.map((el, i) => ({
        name: String(optionSome(el.name) ?? el.name ?? `field_${i}`),
        type: resolveAlgebraicType(
          el.algebraic_type,
          typespace,
          typeNames,
          seen,
        ),
      })),
    };
  }

  if (tag === "Sum") {
    const sum = algebraicType["Sum"] as {
      variants: { name: any; algebraic_type: AlgebraicType }[];
    };
    return {
      kind: "sum",
      variants: sum.variants.map((v, i) => ({
        name: String(optionSome(v.name) ?? v.name ?? `variant_${i}`),
        type: resolveAlgebraicType(
          v.algebraic_type,
          typespace,
          typeNames,
          seen,
        ),
      })),
    };
  }

  // Nested Builtin wrapper (some serializers)
  if (tag === "Builtin" && algebraicType["Builtin"]) {
    return resolveAlgebraicType(
      algebraicType["Builtin"] as AlgebraicType,
      typespace,
      typeNames,
      seen,
    );
  }

  return { kind: "unknown", label: tag };
}

function legacyParamFields(resolved: ResolvedType): Pick<
  Param,
  "type" | "arrayType" | "refType" | "productType"
> {
  switch (resolved.kind) {
    case "primitive":
      return {
        type: resolved.name,
        arrayType: null,
        refType: null,
        productType: null,
      };
    case "identity":
      return {
        type: "Identity",
        arrayType: null,
        refType: null,
        productType: "Identity",
      };
    case "unit":
      return {
        type: "Product",
        arrayType: null,
        refType: null,
        productType: "()",
      };
    case "array": {
      const el = resolved.element;
      let arrayType: string | null = null;
      if (el.kind === "primitive") arrayType = el.name;
      else if (el.kind === "identity") arrayType = "Identity";
      else if (el.kind === "product" || el.kind === "sum")
        arrayType = el.typeName ?? el.kind;
      else if (el.kind === "unknown") arrayType = el.label;
      else arrayType = el.kind;
      return {
        type: "Array",
        arrayType,
        refType: null,
        productType: null,
      };
    }
    case "product":
      return {
        type: "Product",
        arrayType: null,
        refType: resolved.typeName
          ? { name: resolved.typeName, index: -1 }
          : null,
        productType: resolved.typeName ?? "struct",
      };
    case "sum":
      return {
        type: "Sum",
        arrayType: null,
        refType: resolved.typeName
          ? { name: resolved.typeName, index: -1 }
          : null,
        productType: resolved.typeName ?? "enum",
      };
    case "unknown":
      return {
        type: "Ref",
        arrayType: null,
        refType: { name: resolved.label, index: -1 },
        productType: null,
      };
  }
}

export function parseAlgebraicType(
  schema: RawSchema,
  name: RustOption<string> | string,
  algebraicType: AlgebraicType,
  typeNames?: Map<number, string>,
): Param {
  const names = typeNames ?? buildTypeNameMap(schema);
  const typespace = schema.typespace?.types ?? [];
  const resolved = resolveAlgebraicType(algebraicType, typespace, names);
  const paramName =
    typeof name === "string" ? name : (optionSome(name) ?? "");

  return {
    name: paramName,
    resolved,
    ...legacyParamFields(resolved),
  };
}

/**
 * Extract column product type from a view return type (Option/Array/Query/Ref/Product).
 */
export function extractViewRowProduct(
  returnType: AlgebraicType,
  typespace: AlgebraicType[],
): AlgebraicType | null {
  const tag = typeTag(returnType);

  // Query-builder views: { Product: { elements: [{ name: __query__, type: Ref }] } }
  if (tag === "Product") {
    const product = returnType["Product"] as {
      elements: { name: any; algebraic_type: AlgebraicType }[];
    };
    if (
      product.elements.length === 1 &&
      (optionSome(product.elements[0].name) ?? product.elements[0].name) ===
        "__query__"
    ) {
      return extractViewRowProduct(
        product.elements[0].algebraic_type,
        typespace,
      );
    }
    return returnType;
  }

  if (tag === "Array") {
    return extractViewRowProduct(
      returnType["Array"] as AlgebraicType,
      typespace,
    );
  }

  // Option<T> is Sum with none/some
  if (tag === "Sum") {
    const sum = returnType["Sum"] as {
      variants: { name: any; algebraic_type: AlgebraicType }[];
    };
    const someVariant = sum.variants.find(
      (v) => (optionSome(v.name) ?? v.name) === "some",
    );
    if (someVariant) {
      return extractViewRowProduct(someVariant.algebraic_type, typespace);
    }
  }

  if (tag === "Ref") {
    const target = typespace[returnType["Ref"] as number];
    return target ? extractViewRowProduct(target, typespace) : null;
  }

  return null;
}

function columnsFromProduct(
  productType: AlgebraicType,
  typespace: AlgebraicType[],
  typeNames: Map<number, string>,
): { name: string; type: string }[] {
  let product = productType;
  if (typeTag(product) === "Ref") {
    product = typespace[product["Ref"] as number] ?? product;
  }
  if (typeTag(product) !== "Product") {
    return [{ name: "value", type: typeTag(product) }];
  }
  const elements = (product["Product"] as { elements: any[] }).elements;
  return elements.map((el, i) => {
    const name = optionSome(el.name) ?? el.name ?? `col_${i}`;
    const resolved = resolveAlgebraicType(
      el.algebraic_type,
      typespace,
      typeNames,
    );
    return { name: String(name), type: typeLabel(resolved) };
  });
}

export function typeLabel(resolved: ResolvedType): string {
  switch (resolved.kind) {
    case "primitive":
      return resolved.name;
    case "identity":
      return "Identity";
    case "unit":
      return "()";
    case "array":
      return `${typeLabel(resolved.element)}[]`;
    case "product":
      return resolved.typeName ?? "struct";
    case "sum":
      return resolved.typeName ?? "enum";
    case "unknown":
      return resolved.label;
  }
}

function parseViews(
  schema: RawSchema,
  typespace: AlgebraicType[],
  typeNames: Map<number, string>,
): View[] {
  const exports = (schema.misc_exports ?? []) as RawMiscModuleExportV9[];
  const views: View[] = [];

  for (const exp of exports) {
    if (!exp || typeof exp !== "object" || !("View" in exp)) continue;
    const view = (exp as { View: RawViewDefV9 }).View;
    if (!view?.name) continue;

    const rowProduct = extractViewRowProduct(view.return_type, typespace);
    const columns = rowProduct
      ? columnsFromProduct(rowProduct, typespace, typeNames)
      : [{ name: "value", type: typeTag(view.return_type) }];

    views.push({
      name: view.name,
      isAnonymous: !!view.is_anonymous,
      isPublic: view.is_public !== false,
      columns,
    });
  }

  return views.sort((a, b) => a.name.localeCompare(b.name));
}

export function parseSchema(schema: RawSchema): Schema {
  const typespace = schema.typespace?.types ?? [];
  const typeNames = buildTypeNameMap(schema);

  // Ensure types are ordered by ty index for any legacy lookups
  const typesSorted = [...(schema.types ?? [])].sort((a, b) => a.ty - b.ty);
  const schemaWithSorted = { ...schema, types: typesSorted };

  const reducers = schema.reducers.map((reducer) => {
    const result: Reducer = {
      name: reducer.name,
      params: reducer.params.elements.map((e) =>
        parseAlgebraicType(schemaWithSorted, e.name, e.algebraic_type, typeNames),
      ),
      lifecycle: reducer.lifecycle?.some
        ? (Object.keys(reducer.lifecycle.some)[0] as ReducerLifecycle)
        : null,
    };
    return result;
  });

  const tables: Table[] = schema.tables.map((e) => {
    // product_type_ref is an AlgebraicTypeRef into typespace (not types[] index)
    const productType = typespace[e.product_type_ref];
    const columns = productType
      ? columnsFromProduct(productType, typespace, typeNames)
      : [];
    // Fallback: older parse path via types[]
    if (columns.length === 0) {
      const typeMeta = typesSorted.find((t) => t.ty === e.product_type_ref);
      if (typeMeta) {
        const t = typespace[typeMeta.ty];
        if (t) {
          return {
            name: e.name,
            columns: columnsFromProduct(t, typespace, typeNames),
            primary_key: {},
          };
        }
      }
    }
    return {
      name: e.name,
      columns,
      primary_key: {},
    };
  });

  const views = parseViews(schema, typespace, typeNames);

  return { reducers, tables, views, typespace, typeNames };
}
