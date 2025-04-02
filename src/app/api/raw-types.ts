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

export type BuiltinType =
  | { Bool: void }
  | { I8: void }
  | { U8: void }
  | { F8: void }
  | { I16: void }
  | { U16: void }
  | { F16: void }
  | { I32: void }
  | { U32: void }
  | { F32: void }
  | { I64: void }
  | { U64: void }
  | { F64: void }
  | { I128: void }
  | { U128: void }
  | { F128: void }
  | { String: void }
  | { Array: AlgebraicType }
  | {
      Map: {
        key_type: AlgebraicType;
        ty: AlgebraicType;
      };
    };

export interface AlgebraicType {
  Sum?: SumType;
  Product?: ProductType;
  Builtin?: BuiltinType;
  Ref?: number;
}

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
