import { Item } from "rss-parser";
import { getProperty } from "dot-prop";
import { decode } from "html-entities";
import sanitizeHtml from "sanitize-html";
import { Transform } from "./transforms.mjs";

export type PropertyDefOptions = {
  path: string;
  regex?: string;
  transforms?: Transform[];
};

export class PropertyDef {
  readonly path: string;
  readonly regex?: string;
  readonly transforms?: Transform[];

  constructor({ path, regex, transforms }: PropertyDefOptions) {
    this.path = path;
    this.regex = regex;
    this.transforms = transforms;
  }

  extractValue = (item: Item): string | undefined => {
    const value = getProperty<Item, string>(item, this.path) as string | undefined;
    if (value && this.regex) {
      return value.match(this.regex)?.[1];
    }
    return value;
  };

  applyTransforms = (value: string): string => {
    let transformedValue: string = decode(value);
    transformedValue = sanitizeHtml(transformedValue, { allowedTags: [] });
    this.transforms?.forEach((transform: Transform) => {
      transformedValue = transform.apply(transformedValue);
    });
    return transformedValue;
  };
}
