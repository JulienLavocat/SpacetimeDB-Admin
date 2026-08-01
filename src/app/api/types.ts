export type StdbTypes =
  | "I8"
  | "U8"
  | "F8"
  | "I16"
  | "U16"
  | "F16"
  | "I32"
  | "U32"
  | "F32"
  | "I64"
  | "U64"
  | "F64"
  | "I128"
  | "U128"
  | "F128"
  | "U256"
  | "Bool"
  | "String"
  | "Array"
  | "Ref"
  | "Product"
  | "Sum"
  | "Map"
  | "Identity";

export type AlgebraicType = Record<string, any>;

export interface RustOption<T> {
  some?: T;
  none?: void | unknown[];
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
  types: AlgebraicType[];
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
  tables: { name: string; product_type_ref: number }[];
  reducers: RawReducer[];
  typespace: Typespace;
  types: Type[];
  misc_exports?: any[];
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
