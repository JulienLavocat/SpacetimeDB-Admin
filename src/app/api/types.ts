export interface SqlQueryResult {
  rows: any[][];
  schema: { elements: { name: { some: string }; algebraic_type: {} }[] };
  total_duration_micros: number;
}

export type StdbTypes =
  | "I8"
  | "U8"
  | "I16"
  | "U16"
  | "I32"
  | "U32"
  | "I64"
  | "U64"
  | "I128"
  | "U128"
  | "F32"
  | "F64"
  | "Bool"
  | "String"
  | "Array"
  | "Ref";

export type AlgebraicType = Record<StdbTypes, never[]> & {
  Array: Record<StdbTypes, never[]>;
};

export interface RustOption<T> {
  some?: T;
  none?: void;
}

export interface RawReducer {
  name: string;
  lifecycle: RustOption<{
    OnDisconnect?: never[];
    Init?: never[];
    OnConnect?: never[];
  }>;
  params: {
    elements: { name: RustOption<string>; algebraic_type: AlgebraicType }[];
  };
}

export interface Typespace {
  types: {
    Product: {
      elements: { name: RustOption<string>; algebraic_type: AlgebraicType }[];
    };
  }[];
}

export interface Type {
  name: {
    scope: any[];
    name: string;
  };
  ty: number;
  custom_ordering: boolean;
}

export interface RawSchema {
  tables: { name: string }[];
  reducers: RawReducer[];
  typespace: Typespace;
  types: Type[];
}

export interface LogLine {
  level: string;
  ts: Date;
  target: string;
  filename: string;
  line_number: number;
  message: string;
}

export interface ReducerCallResult {
  error?: string;
  data?: any;
}
