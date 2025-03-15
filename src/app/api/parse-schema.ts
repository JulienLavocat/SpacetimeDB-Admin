import { RawSchema, StdbTypes } from "./types";

export type ReducerLifecycle = "Init" | "OnDisconnect" | "OnConnect";

export interface Table {
  name: string;
  columns: { name: string; type: string }[];
  primary_key: {};
}

export interface Reducer {
  name: string;
  params: { name: string; type: StdbTypes; subType: StdbTypes | null }[];
  lifecycle: ReducerLifecycle | null;
}

export interface Schema {
  reducers: Reducer[];
}

export function parseSchema(schema: RawSchema): Schema {
  const reducers = schema.reducers.map((reducer) => {
    const result: Reducer = {
      name: reducer.name,
      params: reducer.params.elements.map((e) => {
        const type = Object.keys(e.algebraic_type)[0] as StdbTypes;
        return {
          name: e.name.some ?? "",
          type,
          subType:
            type !== "Array"
              ? null
              : (Object.keys(e.algebraic_type.Array)[0] as StdbTypes),
        };
      }),
      lifecycle: reducer.lifecycle.some
        ? (Object.keys(reducer.lifecycle.some)[0] as ReducerLifecycle)
        : null,
    };

    return result;
  });

  return { reducers };
}
