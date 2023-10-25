export abstract class Transform {
  abstract apply(value: string): string;
}

export class BoldTransform extends Transform {
  override apply = (value: string): string => {
    return `<b>${value}</b>`;
  };
}

export class UppercaseTransform extends Transform {
  override apply = (value: string): string => {
    return value.toUpperCase();
  };
}

export class LowercaseTransform extends Transform {
  override apply = (value: string): string => {
    return value.toLowerCase();
  };
}

export class CapitalizeTransform extends Transform {
  override apply = (value: string): string => {
    return value
      .toLowerCase()
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
}

export class MapTransform extends Transform {
  private readonly valueMap: Record<string, string>;
  private readonly strict: boolean;

  constructor(valueMap: Record<string, string>, strict?: boolean) {
    super();
    this.valueMap = valueMap;
    this.strict = strict ?? true;
  }

  override apply = (value: string): string => {
    if (value in this.valueMap) {
      return this.valueMap[value];
    }
    if (this.strict) {
      throw Error(`Value '${value}' not found in value map '${JSON.stringify(this.valueMap)}'.`);
    }
    return value;
  };
}
