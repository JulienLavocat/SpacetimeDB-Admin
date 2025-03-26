import { RawSchema, StdbTypes } from "./types";

export type ReducerLifecycle = "Init" | "OnDisconnect" | "OnConnect";

export interface Table {
  name: string;
  columns: { name: string; type: string }[];
  primary_key: {};
}

export interface ReducerParam {
  name: string;
  type: StdbTypes;
  arrayType: StdbTypes | null;
  refType: { name: string; index: number } | null;
}

export interface Reducer {
  name: string;
  params: ReducerParam[];
  lifecycle: ReducerLifecycle | null;
}

export interface Schema {
  reducers: Reducer[];
  tables: Table[];
}

export function parseSchema(schema: RawSchema): Schema {
  const reducers = schema.reducers.map((reducer) => {
    const result: Reducer = {
      name: reducer.name,
      params: reducer.params.elements.map((e) => {
        let [type, typeValue] = Object.entries(
          e.algebraic_type,
        )[0] as unknown as [StdbTypes, number];

        const arrayType: ReducerParam["arrayType"] =
          type === "Array"
            ? (Object.keys(e.algebraic_type.Array)[0] as StdbTypes)
            : null;
        const refType: ReducerParam["refType"] =
          type === "Ref"
            ? { name: schema.types[typeValue].name.name, index: typeValue }
            : null;

        return {
          name: e.name.some ?? "",
          type,
          arrayType,
          refType,
        };
      }),
      lifecycle: reducer.lifecycle.some
        ? (Object.keys(reducer.lifecycle.some)[0] as ReducerLifecycle)
        : null,
    };

    return result;
  });

  const tables: Table[] = schema.tables.map((e) => ({
    name: e.name,
    columns: [],
    primary_key: {},
  }));

  return { reducers, tables };
}
