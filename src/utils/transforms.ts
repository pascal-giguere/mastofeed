export abstract class Transform {
  abstract apply(value: string): string;
}

export class BoldTransform extends Transform {
  override apply = (value: string): string => {
    return `<strong>${value}</strong>`;
  };
}

export class ItalicTransform extends Transform {
  override apply = (value: string): string => {
    return `<em>${value}</em>`;
  };
}

export class UnderlinedTransform extends Transform {
  override apply = (value: string): string => {
    return `<u>${value}</u>`;
  };
}

export class StrikethroughTransform extends Transform {
  override apply = (value: string): string => {
    return `<del>${value}</del>`;
  };
}

export class BlockQuoteTransform extends Transform {
  override apply = (value: string): string => {
    return `<blockquote>${value}</blockquote>`;
  };
}

export class CodeTransform extends Transform {
  override apply = (value: string): string => {
    return `<code>${value}</code>`;
  };
}

export class PreformattedTransform extends Transform {
  override apply = (value: string): string => {
    return `<pre>${value}</pre>`;
  };
}

export class QuotationMarksTransform extends Transform {
  override apply = (value: string): string => {
    return `“${value}”`;
  };
}

export class GuillemetsTransform extends Transform {
  override apply = (value: string): string => {
    return `« ${value} »`;
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

export class AudioSnippetTransform extends Transform {
  private readonly label: string;

  constructor(label: string) {
    super();
    this.label = label;
  }

  override apply = (value: string): string => {
    let durationSeconds: number | undefined;
    try {
      durationSeconds = parseFloat(value);
    } catch (err) {
      console.error(`Error parsing audio snippet duration '${value}'. Please provide a value in seconds.`, err);
    }

    if (typeof durationSeconds !== 'number' || isNaN(durationSeconds)) {
      console.error(`Invalid audio duration '${value}'.`);
      return '';
    }

    const durationMinutes: number = Math.floor(durationSeconds / 60);
    const durationRemainingSeconds: number = Math.round(durationSeconds % 60);
    const durationString: string = `${durationMinutes} min ${durationRemainingSeconds.toString().padStart(2, '0')} sec`;

    return `${this.label} (${durationString})`;
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
