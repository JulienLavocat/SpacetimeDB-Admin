import { SqlQueryResult } from "./raw-types";

const NUMERIC_TYPES = new Set([
  "I8",
  "U8",
  "I16",
  "U16",
  "I32",
  "U32",
  "I64",
  "U64",
  "I128",
  "U128",
  "F32",
  "F64",
]);

export function algebraicTypeToColumn(type: any) {
  if (NUMERIC_TYPES.has(Object.keys(type)[0])) return "numeric";

  return "text";
}

export function parseRows(
  rows: any[][],
  columns: SqlQueryResult["schema"]["elements"],
) {
  const typeRegistry: ("enum" | "option" | "raw")[] = columns.map((column) => {
    // Either and option or an enum
    if (column.algebraic_type.Sum) {
      const variants = column.algebraic_type.Sum.variants;
      if (variants.length === 2) {
        const names = variants.reduce(
          (acc, next) => acc.add(next.name.some),
          new Set(),
        );
        if (names.has("none") && names.has("some")) {
          return "option";
        }
      }
      return "enum";
    }

    return "raw";
  });

  return rows.map((row) =>
    row.reduce((acc, next, nextIndex) => {
      const type = typeRegistry[nextIndex];

      switch (type) {
        case "enum":
          acc[columns[nextIndex].name.some] =
            columns[nextIndex].algebraic_type.Sum?.variants[next[0]].name.some;
          return acc;

        case "option":
          acc[columns[nextIndex].name.some] = next[0] === 1 ? "" : next[1]; // if none ? none : some
          return acc;

        case "raw":
          acc[columns[nextIndex].name.some] = next;
          return acc;
      }
    }, {}),
  );
}
