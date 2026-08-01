import { ResolvedType } from "./parse-schema";

const NUMERIC_TYPES = new Set([
  "I8",
  "U8",
  "F8",
  "I16",
  "U16",
  "F16",
  "I32",
  "U32",
  "F32",
  "I64",
  "U64",
  "F64",
  "I128",
  "U128",
  "U256",
  "F128",
]);

/**
 * Normalize an Identity hex string for SATS-JSON U256 / Identity product.
 */
export function normalizeIdentityHex(value: unknown): string {
  if (value == null) return "";
  let s = String(value).trim();
  if (s.startsWith("0x") || s.startsWith("0X")) s = s.slice(2);
  return s.toLowerCase();
}

function parsePrimitive(name: string, value: unknown): unknown {
  if (name === "Bool") {
    if (typeof value === "boolean") return value;
    if (value === "true" || value === true || value === 1 || value === "1")
      return true;
    if (value === "false" || value === false || value === 0 || value === "0")
      return false;
    return !!value;
  }
  if (name === "String") {
    return value == null ? "" : String(value);
  }
  if (NUMERIC_TYPES.has(name)) {
    if (value == null || value === "") return 0;
    if (typeof value === "number" && !Number.isNaN(value)) return value;
    // HTML inputs always yield strings; SpacetimeDB SATS-JSON expects JSON
    // numbers for integer/float builtins (not strings).
    const s = String(value).trim();
    if (name.startsWith("F")) {
      const n = parseFloat(s);
      return Number.isNaN(n) ? 0 : n;
    }
    // Integers (including U64/I64/…). Values outside Number.MAX_SAFE_INTEGER
    // may lose precision in JS, but the host rejects string-encoded integers.
    if (/^-?\d+$/.test(s)) {
      return Number(s);
    }
    const n = parseInt(s, 10);
    return Number.isNaN(n) ? 0 : n;
  }
  return value;
}

function parseArrayLiteral(value: string): string[] {
  if (!value || typeof value !== "string") return [];
  const regex = /"([^"]*)"|([^,]+)/g;
  const result: string[] = [];
  let match;
  while ((match = regex.exec(value)) !== null) {
    result.push((match[1] ?? match[2]).trim());
  }
  return result.filter((s) => s.length > 0);
}

function tryParseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (
    trimmed.startsWith("{") ||
    trimmed.startsWith("[") ||
    trimmed === "null" ||
    trimmed === "true" ||
    trimmed === "false"
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }
  return value;
}

/**
 * Encode a form/UI value into SATS-JSON for `POST .../call/{reducer}`.
 *
 * Product values use objects keyed by field name when fields are named.
 * Sum values use `{ "VariantName": payload }`.
 * Identity uses product form `{ "__identity__": "<hex>" }`.
 */
export function encodeSatsValue(type: ResolvedType, value: unknown): unknown {
  // JSON escape hatch: if the UI stored a pre-encoded object/array string
  if (
    type.kind !== "primitive" &&
    type.kind !== "identity" &&
    typeof value === "string"
  ) {
    const parsed = tryParseJson(value);
    if (parsed !== value) {
      // Already looks like SATS-JSON from the user; pass through after light fixups
      return encodeSatsValueFromParsed(type, parsed);
    }
  }

  return encodeSatsValueFromParsed(type, value);
}

function encodeSatsValueFromParsed(
  type: ResolvedType,
  value: unknown,
): unknown {
  switch (type.kind) {
    case "primitive":
      return parsePrimitive(type.name, value);

    case "identity": {
      const hex = normalizeIdentityHex(value);
      return { __identity__: hex };
    }

    case "unit":
      return {};

    case "array": {
      let items: unknown[];
      if (Array.isArray(value)) {
        items = value;
      } else if (typeof value === "string") {
        // Primitive arrays: comma-separated; complex: JSON array string
        if (type.element.kind === "primitive" || type.element.kind === "identity") {
          items = parseArrayLiteral(value);
        } else {
          const parsed = tryParseJson(value);
          items = Array.isArray(parsed) ? parsed : [];
        }
      } else if (value == null) {
        items = [];
      } else {
        items = [value];
      }
      return items.map((item) => encodeSatsValue(type.element, item));
    }

    case "product": {
      if (value == null) {
        return Object.fromEntries(
          type.fields.map((f) => [f.name, encodeSatsValue(f.type, null)]),
        );
      }
      if (typeof value === "string") {
        value = tryParseJson(value);
      }
      if (Array.isArray(value)) {
        const arr = value as unknown[];
        return type.fields.map((f, i) =>
          encodeSatsValue(f.type, arr[i]),
        );
      }
      if (typeof value === "object") {
        const obj = value as Record<string, unknown>;
        // Prefer named object encoding
        return Object.fromEntries(
          type.fields.map((f) => [
            f.name,
            encodeSatsValue(f.type, obj[f.name]),
          ]),
        );
      }
      return value;
    }

    case "sum": {
      if (value == null) {
        const first = type.variants[0];
        return first
          ? { [first.name]: encodeSatsValue(first.type, null) }
          : {};
      }
      if (typeof value === "string") {
        value = tryParseJson(value);
      }
      // UI shape: { _variant: "Name", _payload: ... }
      if (
        typeof value === "object" &&
        value !== null &&
        "_variant" in (value as object)
      ) {
        const v = value as { _variant: string; _payload?: unknown };
        const variant = type.variants.find((x) => x.name === v._variant);
        const payloadType = variant?.type ?? { kind: "unit" as const };
        return {
          [v._variant]: encodeSatsValue(payloadType, v._payload),
        };
      }
      // Already SATS-JSON: single-key object
      if (typeof value === "object" && value !== null) {
        const keys = Object.keys(value as object);
        if (keys.length === 1) {
          const key = keys[0];
          const variant = type.variants.find((x) => x.name === key);
          if (variant) {
            return {
              [key]: encodeSatsValue(
                variant.type,
                (value as Record<string, unknown>)[key],
              ),
            };
          }
        }
      }
      return value;
    }

    case "unknown":
      if (typeof value === "string") return tryParseJson(value);
      return value;
  }
}

/** Encode ordered reducer args from a form value map keyed by param name. */
export function encodeReducerArgs(
  params: { name: string; resolved: ResolvedType }[],
  formValues: Record<string, unknown>,
): unknown[] {
  return params.map((p) => encodeSatsValue(p.resolved, formValues[p.name]));
}
