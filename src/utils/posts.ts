import { Item } from 'rss-parser';
import { PropertyDef, PropertyDefOptions } from './properties';

const MAX_TOOTH_CHARACTER_COUNT = 500;

// All links are counted as 23 characters by Mastodon: https://docs.joinmastodon.org/user/posting/#links
const TOOTH_LINK_CHARACTER_COUNT = 23;

const REQUIRED_POST_PROPERTIES: (keyof Post)[] = ['id', 'title', 'linkUrl'];

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

  for (const [propertyName, propertyDefOptions] of Object.entries(postDef)) {
    const propertyDef = new PropertyDef(propertyDefOptions);
    const extractedValue: string | undefined = propertyDef.extractValue(item);
    if (extractedValue === undefined) {
      const isRequiredProperty: boolean = REQUIRED_POST_PROPERTIES.includes(propertyName as keyof Post);
      if (isRequiredProperty) {
        throw new Error(`Failed to extract a value from RSS for required property '${propertyName}'.`);
      }
      continue;
    }
    post[propertyName as keyof Post] = extractedValue ? propertyDef.applyTransforms(extractedValue) : undefined;
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
