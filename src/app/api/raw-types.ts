export interface Option<T> {
  some?: T;
  none?: void;
}

export interface SumTypeVariant {
  name: Option<string>;
  algebraic_type: AlgebraicType;
}

export interface SumType {
  variants: SumTypeVariant[];
}

export interface ProductTypeElement {
  name: { some: string };
  algebraic_type: AlgebraicType;
}

export interface ProductType {
  elements: ProductTypeElement[];
}

export type BuiltinType = {
  Bool?: void;
  I8?: void;
  U8?: void;
  F8?: void;
  I16?: void;
  U16?: void;
  F16?: void;
  I32?: void;
  U32?: void;
  F32?: void;
  I64?: void;
  U64?: void;
  F64?: void;
  I128?: void;
  U128?: void;
  F128?: void;
  I256?: void;
  U256?: void;
  F256?: void;
  String?: void;
  Array?: AlgebraicType;
  Map?: {
    key_type: AlgebraicType;
    ty: AlgebraicType;
  };
};

export type AlgebraicType = {
  Sum?: SumType;
  Product?: ProductType;
  Builtin?: BuiltinType;
  Ref?: number;
} & BuiltinType;

export type IndexAlgorithm = { BTree: number[] };

export interface Index {
  name: Option<string>;
  accessor_name: Option<string>;
  algorithm: IndexAlgorithm;
}

export type ConstraintType = { Unique: { columns: number[] } };

export interface Constraint {
  name: Option<string>;
  data: ConstraintType;
}

export interface Sequence {
  name: Option<string>;
  column: number;
  start: Option<unknown>;
  min_value: Option<number>;
  max_value: Option<number>;
  increment: number;
}

export type TableType = { User: void };
export type TableAccess = { Public: void } | { Private: void };

export interface Table {
  name: string;
  product_type_ref: number;
  primary_key: number[];
  constraints: Constraint[];
  sequences: Sequence[];
  schedule: Option<unknown>;
  table_type: TableType;
  table_access: TableAccess;
}

export interface ReducerParam {
  name: Option<string>;
  algebraic_type: AlgebraicType;
}

export type ReducerLifecycle =
  | { Init: void }
  | { OnConnect: void }
  | { OnDisconnect: void };

export interface Reducer {
  name: string;
  params: { elements: ReducerParam[] };
  lifecycle: Option<ReducerLifecycle>;
}

export interface Type {
  name: { scope: unknown[]; name: string };
  ty: number;
  custom_ordering: boolean;
}

export type RawModuleRef9 = {
  typespace: { types: AlgebraicType[] };
  tables: Table[];
  reducers: Reducer[];
  types: Type[];
  misc_exports: unknown[];
  row_level_security: unknown[];
};

export interface SqlQueryResult {
  schema: ProductType;
  rows: any[][];
  total_duration_micros: number;
}

export const NUMERIC_TYPES: Set<keyof BuiltinType> = new Set([
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

export const PRIMITIVE_TYPES: Set<keyof BuiltinType> = new Set([
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
  "Bool",
  "String",
]);

export function isIdentityType(type: ProductType): boolean {
  return (
    type.elements.length === 1 &&
    type.elements[0].name.some === "__identity__" &&
    !!type.elements[0].algebraic_type.U256
  );
}

export function isOptionType(type: SumType): boolean {
  return (
    type.variants.length === 2 &&
    type.variants[0].name.some === "some" &&
    type.variants[1].name.some === "none"
  );
}

export class PrintableType {
  isNumeric: boolean;
  isPrimitive: boolean;
  constructor(
    public isOption: boolean,
    public isArray: boolean,
    public isMap: boolean,
    public type: string,
    public valueType: string,
  ) {
    this.isNumeric = NUMERIC_TYPES.has(type as keyof BuiltinType);
    this.isPrimitive = PRIMITIVE_TYPES.has(type as keyof BuiltinType);
  }

  toString(): string {
    return this.type;
  }
}

export function printAlgebraicType(
  schema: RawModuleRef9,
  type: AlgebraicType,
): string {
  // TODO: Return an object instead of a string,

  if (type.Array) {
    console.log("unhandled array", type.Array);
    return "";
  }

  if (type.Sum) {
    if (isOptionType(type.Sum)) {
      return `Option<${printAlgebraicType(schema, type.Sum.variants.find((v) => v.name.some === "some")!.algebraic_type)}>`;
    }

    console.log("unhandled sum", type.Sum);
    return "";
  }
  if (type.Ref) {
    return schema.types[type.Ref].name.name;
  }
  if (type.Map) {
    return `Map<${printAlgebraicType(schema, type.Map.key_type)}, ${printAlgebraicType(schema, type.Map.ty)}>`;
  }
  if (type.Product) {
    if (isIdentityType(type.Product)) return "Identity";

    console.log("unhandled product", type.Product);
    return "";
  }

  return Object.keys(type)[0].toLocaleLowerCase();
}
