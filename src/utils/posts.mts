import { Item } from "rss-parser";
import { PropertyDef, PropertyDefOptions } from "./properties.mjs";
import { addMFIDToUrl } from "./mfid.mjs";

const MAX_TOOT_CHARACTER_COUNT = 500;

// All links are counted as 23 characters by Mastodon: https://docs.joinmastodon.org/user/posting/#links
const TOOT_LINK_CHARACTER_COUNT = 23;

const REQUIRED_POST_PROPERTIES: (keyof Post)[] = ["id", "title", "linkUrl"];

export type PostDef = { [_ in keyof Post]: PropertyDefOptions };

export type Post = {
  id: string;
  title: string;
  linkUrl: string;
  kicker?: string;
  category?: string;
  description?: string;
  author?: string;
};

export function buildPost(postDef: PostDef, item: Item): Post {
  const post: Partial<Post> = {};

  for (const [propertyName, propertyDefOptions] of Object.entries(postDef)) {
    const propertyKey = propertyName as keyof Post;
    const propertyDef = new PropertyDef(propertyDefOptions);
    const isRequiredProperty: boolean = REQUIRED_POST_PROPERTIES.includes(propertyKey);
    const extractedValue: string | undefined = propertyDef.extractValue(item);

    if (extractedValue === undefined) {
      if (isRequiredProperty) {
        throw new Error(`Failed to extract a value from RSS for required property '${propertyName}'.`);
      }
      continue;
    }

    post[propertyKey] = propertyDef.applyTransforms(extractedValue);
  }

  return post as Post;
}

export function buildTootText(post: Post): string {
  // Characters reserved for everything except the title and description: the kicker, byline
  // (author/category), their separators/newlines, and the link (counted as a fixed 23 characters by
  // Mastodon regardless of its real length).
  const reservedForNonTitleContent: number =
    (post.kicker ? post.kicker.length + 1 : 0) +
    (post.author || post.category || post.linkUrl ? 1 : 0) +
    (post.author || post.category ? 1 : 0) +
    (post.author ? post.author.length : 0) +
    (post.author && post.category ? 3 : 0) +
    (post.category ? post.category.length : 0) +
    (post.linkUrl ? TOOT_LINK_CHARACTER_COUNT + 1 : 0);

  // As a last resort, trim the title so the fixed content still fits within the limit. The link
  // carries the post's mfid and is the point of the toot, so it must never be truncated — only the
  // title is. Math.max guards against a negative slice bound if the byline alone were oversized.
  const titleCharacterBudget: number = MAX_TOOT_CHARACTER_COUNT - reservedForNonTitleContent;
  const mustTrimTitle: boolean = post.title.length > titleCharacterBudget;
  const trimmedTitle: string = mustTrimTitle
    ? post.title.slice(0, Math.max(0, titleCharacterBudget - 1)) + "…"
    : post.title;

  // The description gets whatever budget remains after the (possibly trimmed) title, less 3
  // characters for the "\n\n" separator and the trailing ellipsis. If nothing is left, drop it;
  // otherwise slice(0, negativeBudget) would count from the end of the string and produce garbage.
  const descriptionCharacterBudget: number = titleCharacterBudget - trimmedTitle.length - 3;
  const hasRoomForDescription: boolean = descriptionCharacterBudget > 0;
  const mustTrimDescription: boolean =
    hasRoomForDescription && !!post.description && post.description.length > descriptionCharacterBudget;
  const trimmedDescription: string | undefined = !hasRoomForDescription
    ? undefined
    : mustTrimDescription
      ? post.description!.slice(0, descriptionCharacterBudget) + "…"
      : post.description;

  let text = "";
  if (post.kicker) text += `${post.kicker}\n`;
  if (post.title) text += `${trimmedTitle}`;
  if (trimmedDescription) text += `\n\n${trimmedDescription}`;
  if (post.author || post.category || post.linkUrl) text += "\n";
  if (post.author || post.category) text += "\n";
  if (post.author) text += post.author;
  if (post.author && post.category) text += " — ";
  if (post.category) text += post.category;
  if (post.linkUrl) text += `\n${addMFIDToUrl(post.linkUrl, post.id)}`;
  return text;
}
