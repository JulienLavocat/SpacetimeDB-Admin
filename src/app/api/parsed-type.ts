import {
  AlgebraicType,
  BuiltinType,
  isIdentityType,
  isOptionType,
  NUMERIC_TYPES,
  PRIMITIVE_TYPES,
  RawModuleRef9,
} from "./rawmoduledef9";

export class ParsedType {
  constructor(
    readonly isOption: boolean,
    readonly isArray: boolean,
    readonly isMap: boolean,
    readonly type: string,
    readonly isNumeric: boolean,
    readonly isPrimitive: boolean,
    readonly isFloat: boolean,
    readonly isBoolean: boolean,
    readonly isIdentity: boolean,
    readonly valueType?: ParsedType,
    readonly keyType?: ParsedType,
  ) {}

  static fromAlgebraicType(
    schema: RawModuleRef9,
    type: AlgebraicType,
  ): ParsedType {
    if (type.Array) {
      return new ParsedTypeBuilder(schema, "Array")
        .setValueType(type.Array)
        .build();
    }

    if (type.Sum) {
      if (isOptionType(type.Sum)) {
        return new ParsedTypeBuilder(schema, "Option")
          .setOption(true)
          .setValueType(
            type.Sum.variants.find((v) => v.name.some === "some")!
              .algebraic_type,
          )
          .build();
      }
      console.log("unhandled sum", type.Sum);
      return ParsedTypeBuilder.invalidType("Unhandled sum, please report this");
    }

    if (type.Ref) {
      return new ParsedTypeBuilder(
        schema,
        schema.types[type.Ref].name.name,
      ).build();
    }

    if (type.Map) {
      return new ParsedTypeBuilder(schema, "Map")
        .setMap(true)
        .setValueType(type.Map.ty)
        .setKeyType(type.Map.key_type)
        .build();
    }

    if (type.Product) {
      if (isIdentityType(type.Product)) {
        return new ParsedTypeBuilder(schema, "Identity").build();
      }
      console.log("unhandled product", type.Product);
      return ParsedTypeBuilder.invalidType(
        "Unhandled product, please report this",
      );
    }

    return new ParsedTypeBuilder(schema, Object.keys(type)[0]).build();
  }

  getInnerType(): ParsedType | undefined {
    return this.valueType;
  }

  getKeyType(): ParsedType | undefined {
    return this.keyType;
  }

  getValueType(): ParsedType | undefined {
    return this.valueType;
  }

  toString(): string {
    if (this.isMap) {
      return `Map<${this.keyType?.toString()}, ${this.valueType?.toString()}>`;
    }

    if (this.isArray) {
      return `${this.valueType?.toString()}[]`;
    }

    if (this.isOption) {
      return `Option<${this.valueType?.toString()}>`;
    }

    return this.type;
  }
}

export class ParsedTypeBuilder {
  private isOption: boolean;
  private isArray: boolean;
  private isMap: boolean;
  private isNumeric: boolean;
  private isPrimitive: boolean;
  private isFloat: boolean;
  private valueType?: ParsedType;
  private keyType?: ParsedType;
  private isBoolean: boolean;
  private isIdentity: boolean;

  constructor(
    private schema: RawModuleRef9,
    private type: string,
  ) {
    this.isOption = false;
    this.isArray = false;
    this.isMap = false;
    this.isNumeric = NUMERIC_TYPES.has(type as keyof BuiltinType);
    this.isPrimitive = PRIMITIVE_TYPES.has(type as keyof BuiltinType);
    this.isFloat = type.startsWith("F");
    this.isBoolean = type === "Bool";
    this.isIdentity = type === "Identity";
  }

  setOption(isOption: boolean): ParsedTypeBuilder {
    this.isOption = isOption;
    return this;
  }

  setArray(isArray: boolean): ParsedTypeBuilder {
    this.isArray = isArray;
    return this;
  }

  setMap(isMap: boolean): ParsedTypeBuilder {
    this.isMap = isMap;
    return this;
  }

  setValueType(valueType: AlgebraicType): ParsedTypeBuilder {
    this.valueType = ParsedType.fromAlgebraicType(this.schema, valueType);
    return this;
  }

  setKeyType(keyType: AlgebraicType): ParsedTypeBuilder {
    this.keyType = ParsedType.fromAlgebraicType(this.schema, keyType);
    return this;
  }

  static invalidType(message: string): ParsedType {
    return new ParsedType(
      false,
      false,
      false,
      message,
      false,
      false,
      false,
      false,
      false,
    );
  }

  build(): ParsedType {
    return new ParsedType(
      this.isOption,
      this.isArray,
      this.isMap,
      this.type,
      this.isNumeric,
      this.isPrimitive,
      this.isFloat,
      this.isBoolean,
      this.isIdentity,
      this.valueType,
      this.keyType,
    );
  }
}
