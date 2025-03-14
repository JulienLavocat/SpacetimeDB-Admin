export interface SqlQueryResult {
  rows: any[][];
  schema: { elements: { name: { some: string }; algebraic_type: {} }[] };
}

export interface Reducer {
  name: string;
  lifecycle: { none?: {}[] };
  params: { elements: {}[] };
}

export interface Schema {
  tables: any[];
  reducers: Reducer[];
  types: any[];
}

export interface LogLine {
  level: string;
  ts: Date;
  target: string;
  filename: string;
  line_number: number;
  message: string;
}
