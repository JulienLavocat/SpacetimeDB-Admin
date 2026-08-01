export interface Option<T> {
  some?: T;
  none?: void | unknown[];
}

export interface SumTypeVariant {
  name: Option<string>;
  algebraic_type: AlgebraicType;
}

export interface SumType {
  variants: SumTypeVariant[];
}

export interface ProductTypeElement {
  name: Option<string>;
  algebraic_type: AlgebraicType;
}

export interface ProductType {
  elements: ProductTypeElement[];
}

/**
 * Wire AlgebraicType as returned by schema?version=9.
 * Builtins are flattened (e.g. `{ "String": [] }`), not wrapped in `Builtin`.
 */
export type AlgebraicType = {
  Sum?: SumType;
  Product?: ProductType;
  Ref?: number;
  Bool?: unknown;
  I8?: unknown;
  U8?: unknown;
  F8?: unknown;
  I16?: unknown;
  U16?: unknown;
  F16?: unknown;
  I32?: unknown;
  U32?: unknown;
  F32?: unknown;
  I64?: unknown;
  U64?: unknown;
  F64?: unknown;
  I128?: unknown;
  U128?: unknown;
  U256?: unknown;
  F128?: unknown;
  String?: unknown;
  Array?: AlgebraicType;
  Map?: {
    key_type?: AlgebraicType;
    key_ty?: AlgebraicType;
    ty: AlgebraicType;
  };
  Builtin?: unknown;
};

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

/** View definition from RawModuleDefV9.misc_exports */
export interface RawViewDefV9 {
  name: string;
  index: number;
  is_public: boolean;
  is_anonymous: boolean;
  params: ProductType;
  return_type: AlgebraicType;
}

export type RawMiscModuleExportV9 =
  | { ColumnDefaultValue: unknown }
  | { Procedure: unknown }
  | { View: RawViewDefV9 };

export type RawModuleRef9 = {
  typespace: { types: AlgebraicType[] };
  tables: Table[];
  reducers: Reducer[];
  types: Type[];
  misc_exports: RawMiscModuleExportV9[];
  row_level_security: unknown[];
};

export interface SqlQueryResult {
  schema: ProductType;
  rows: any[][];
  total_duration_micros: number;
}
