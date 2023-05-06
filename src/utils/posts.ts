import { Item } from 'rss-parser';
import { PropertyDef, PropertyDefOptions } from './properties';

const MAX_TOOTH_CHARACTER_COUNT = 500;

// All links are counted as 23 characters by Mastodon: https://docs.joinmastodon.org/user/posting/#links
const TOOTH_LINK_CHARACTER_COUNT = 23;

export type PostDef = Record<keyof Post, PropertyDefOptions>;

export type Post = {
  id?: string;
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

export function buildToothText(post: Post): string {
  const descriptionCharacterBudget: number =
    MAX_TOOTH_CHARACTER_COUNT -
    (post.title ? post.title.length : 0) -
    (post.subtitle ? post.subtitle.length + 1 : 0) -
    (post.linkUrl ? TOOTH_LINK_CHARACTER_COUNT + 2 : 0) -
    3;

  const mustTrimDescription: boolean = !!post.description && post.description.length > descriptionCharacterBudget;
  const trimmedDescription: string | undefined = mustTrimDescription
    ? post.description!.slice(0, descriptionCharacterBudget) + '…'
    : post.description;

  let text = '';
  if (post.title) text += `${post.title}`;
  if (post.subtitle) text += `\n${post.subtitle}`;
  if (trimmedDescription) text += `\n\n${trimmedDescription}`;
  if (post.linkUrl) text += `\n\n${post.linkUrl}`;
  return text;
}
