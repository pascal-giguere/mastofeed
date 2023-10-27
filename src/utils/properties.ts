import { Item } from 'rss-parser';
import get from 'lodash/get';
import { decode } from 'html-entities';
import sanitizeHtml from 'sanitize-html';
import { Transform } from './transforms';

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
    const value: string | undefined = get(item, this.path);
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
