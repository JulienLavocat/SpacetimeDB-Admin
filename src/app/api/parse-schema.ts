import { AlgebraicType, RawSchema, RustOption, StdbTypes } from "./types";

export type ReducerLifecycle = "Init" | "OnDisconnect" | "OnConnect";

export interface Table {
  name: string;
  columns: { name: string; type: string }[];
  primary_key: {};
}

export interface Param {
  name: string;
  type: StdbTypes;
  arrayType: StdbTypes | null;
  refType: { name: string; index: number } | null;
  productType: string | null;
}

export interface Reducer {
  name: string;
  params: Param[];
  lifecycle: ReducerLifecycle | null;
}

export interface Schema {
  reducers: Reducer[];
  tables: Table[];
}

export function parseSchema(schema: RawSchema): Schema {
  schema.types.sort((a, b) => a.ty - b.ty);

  const reducers = schema.reducers.map((reducer) => {
    const result: Reducer = {
      name: reducer.name,
      params: reducer.params.elements.map((e) =>
        parseAlgebraicType(schema, e.name, e.algebraic_type),
      ),
      lifecycle: reducer.lifecycle.some
        ? (Object.keys(reducer.lifecycle.some)[0] as ReducerLifecycle)
        : null,
    };

    return result;
  });

  const tables: Table[] = schema.tables.map((e) => {
    const productType = schema.types[e.product_type_ref];
    const type = schema.typespace.types[productType.ty];
    return {
      name: e.name,
      columns: type.Product.elements.map((col) =>
        parseAlgebraicType(schema, col.name, col.algebraic_type),
      ),
      primary_key: {},
    };
  });

  return { reducers, tables };
}

export function parseAlgebraicType(
  schema: RawSchema,
  name: RustOption<string>,
  algebraicType: AlgebraicType,
): Param {
  let [type, typeValue] = Object.entries(algebraicType)[0] as unknown as [
    StdbTypes,
    number,
  ];

  let arrayType: Param["arrayType"] =
    type === "Array"
      ? (Object.keys(algebraicType.Array)[0] as StdbTypes)
      : null;
  if (arrayType === "Ref") {
    arrayType = schema.types[algebraicType.Array.Ref as unknown as number].name
      .name as any;
  }
  const refType: Param["refType"] =
    type === "Ref"
      ? { name: schema.types[typeValue].name.name, index: typeValue }
      : null;

  let productType: string | null = null;
  if (type === "Product") {
    const elements = algebraicType.Product.elements;
    // Check for Identity type
    if (
      elements.length === 1 &&
      elements[0].algebraic_type.U256 &&
      (elements[0].name as RustOption<string>)?.some === "__identity__"
    ) {
      productType = "Identity";
    }
  }

  return {
    name: name.some ?? "",
    type,
    arrayType,
    refType,
    productType,
  };
}
