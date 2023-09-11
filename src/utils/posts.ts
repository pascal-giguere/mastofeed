import { Item } from 'rss-parser';
import { PropertyDef, PropertyDefOptions } from './properties';

const MAX_TOOTH_CHARACTER_COUNT = 500;

// All links are counted as 23 characters by Mastodon: https://docs.joinmastodon.org/user/posting/#links
const TOOTH_LINK_CHARACTER_COUNT = 23;

export type PostDef = { [_ in keyof Post]: PropertyDefOptions };

export type Post = {
  id: string;
  title: string;
  linkUrl: string;
  kicker?: string;
  category?: string;
  description?: string;
  author?: string;
  imageUrl?: string;
};

export function buildPost(postDef: PostDef, item: Item): Post {
  const post: Partial<Post> = {};
  const postProperties = Object.keys(postDef) as (keyof Post)[];

  for (const propertyName of postProperties) {
    const propertyDef = new PropertyDef(postDef[propertyName]!);
    const extractedValue: string | undefined = propertyDef.extractValue(item);
    post[propertyName] = extractedValue ? propertyDef.applyTransforms(extractedValue) : undefined;
  }

  return post as Post;
}

export function buildToothText(post: Post): string {
  const descriptionCharacterBudget: number =
    MAX_TOOTH_CHARACTER_COUNT -
    (post.kicker ? post.kicker.length + 1 : 0) -
    (post.title ? post.title.length : 0) -
    (post.author || post.category || post.linkUrl ? 1 : 0) -
    (post.author || post.category ? 1 : 0) -
    (post.author ? post.author.length : 0) -
    (post.author && post.category ? 3 : 0) -
    (post.category ? post.category.length : 0) -
    (post.linkUrl ? TOOTH_LINK_CHARACTER_COUNT + 1 : 0) -
    3;

  const mustTrimDescription: boolean = !!post.description && post.description.length > descriptionCharacterBudget;
  const trimmedDescription: string | undefined = mustTrimDescription
    ? post.description!.slice(0, descriptionCharacterBudget) + '…'
    : post.description;

  let text = '';
  if (post.kicker) text += `${post.kicker}\n`;
  if (post.title) text += `${post.title}`;
  if (trimmedDescription) text += `\n\n${trimmedDescription}`;
  if (post.author || post.category || post.linkUrl) text += '\n';
  if (post.author || post.category) text += '\n';
  if (post.author) text += post.author;
  if (post.author && post.category) text += ' — ';
  if (post.category) text += post.category;
  if (post.linkUrl) text += `\n${post.linkUrl}`;
  return text;
}
