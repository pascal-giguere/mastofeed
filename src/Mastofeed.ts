import { Output, Item } from 'rss-parser';
import { Entity, MegalodonInterface } from 'megalodon';
import { isAxiosError } from 'axios';
import { buildPost, buildToothText, Post, PostDef } from './utils/posts';
import { fetchExistingTooths, initMastodonClient, postTooth } from './utils/mastodon';
import { parseFeed } from './utils/rss';
import { extractMFIDFromUrl } from './utils/mfid';

type MastofeedOptions = {
  mastodon: MastodonOptions;
  rss: RssOptions;
};

type MastodonOptions = { instanceUrl: string; accessToken: string };

type RssOptions = { feedUrl: string; postDef: PostDef };

export class Mastofeed {
  readonly rssOptions: RssOptions;
  private readonly mastodonClient: MegalodonInterface;

  constructor(options: MastofeedOptions) {
    this.rssOptions = options.rss;
    this.mastodonClient = initMastodonClient(options.mastodon.instanceUrl, options.mastodon.accessToken);
  }

  run = async (): Promise<void> => {
    const fetchExistingMFIDs: string[] = await this.fetchExistingMFIDs();
    console.log(`Fetched ${fetchExistingMFIDs.length} existing MFIDs:`, JSON.stringify(fetchExistingMFIDs));
    const feedItems: Item[] = await this.fetchFeedItems();
    const posts: Post[] = this.buildPosts(feedItems);
    await this.postTooths(posts);
  };

  private fetchExistingMFIDs = async (): Promise<string[]> => {
    const existingTooths = await fetchExistingTooths(this.mastodonClient);
    return existingTooths.map((tooth: Entity.Status) => extractMFIDFromUrl(tooth.uri));
  };

  private fetchFeedItems = async (): Promise<Item[]> => {
    const feed: Output<Item> = await parseFeed(this.rssOptions.feedUrl);
    console.log(`Fetched ${feed.items.length} feed items.`);
    return feed.items;
  };

  private buildPosts = (feedItems: Item[]): Post[] => {
    return feedItems.map((item: Item) => buildPost(this.rssOptions.postDef, item));
  };

  private postTooths = async (posts: Post[]): Promise<void> => {
    for (const post of posts) {
      const postNumber: number = posts.indexOf(post) + 1;
      console.log(`Sending tooth for post '${post.id}' (${postNumber} of ${posts.length})...`);
      await this.tryPostTooth(post);
    }
  };

  private tryPostTooth = async (post: Post): Promise<void> => {
    const text: string = buildToothText(post);
    try {
      const tooth: Entity.Status = await postTooth(this.mastodonClient, text);
      console.log(`Successfully sent tooth '${tooth.id}' for post '${post.id}'.`);
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(`Failed to send tooth for post '${post.id}': ${JSON.stringify(error.response?.data)}`);
      } else {
        throw error;
      }
    }
  };
}
