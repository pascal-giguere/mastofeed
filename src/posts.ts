import { Item } from 'rss-parser';
import { PropertyDef, PropertyDefOptions } from './properties';

export type PostDef = Record<keyof Post, PropertyDefOptions>;

export type Post = {
  title?: string;
  subtitle?: string;
  category?: string;
  description?: string;
  author?: string;
  imageUrl?: string;
  linkUrl?: string;
};

export function buildPost(postDef: PostDef, item: Item): Post {
  const post: Partial<Post> = {};
  const postProperties = Object.keys(postDef) as (keyof Post)[];

  for (const propertyName of postProperties) {
    const propertyDef = new PropertyDef(postDef[propertyName]);
    const extractedValue: string | undefined = propertyDef.extractValue(item);
    post[propertyName] = extractedValue ? propertyDef.applyTransforms(extractedValue) : undefined;
  }

  return post;
}
