export interface ProductType {
  elements: {
    name: {
      some: string;
    };
    algebraic_type: {
      Builtin: Record<string, []>;
    };
  }[];
}

export interface DatabaseSchema {
  entities: Record<
    string,
    {
      arity: number;
      type: 'reducer' | 'table';
      schema: ProductType;
    }
  >;
  typespace: any[];
}

export interface QueryResult {
  schema: ProductType;
  rows: [any[]];
}

export interface LogLine {
  ts: number;
  level: string;
  filename: string;
  line_number: number;
  message: string;
}
