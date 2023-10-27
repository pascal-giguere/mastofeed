import { Item, Output } from 'rss-parser';
import { Entity } from 'megalodon';
import { isAxiosError } from 'axios';
import { buildPost, buildTootText, Post, PostDef } from './utils/posts';
import { MastodonClient } from './utils/mastodon';
import { parseFeed } from './utils/rss';
import { extractMFIDFromUrl, extractUrlFromTootContent } from './utils/mfid';
import { Logger, LogLevel } from './utils/logging';
import { GLOBAL_MAX_SYNCED_ITEMS } from './constants';

type MastofeedOptions = {
  mastodon: MastodonOptions;
  rss: RssOptions;
  logging?: LoggingOptions;
};

type MastodonOptions = { instanceUrl: string; accessToken: string };

type RssOptions = { feedUrl: string; postDef: PostDef; maxSyncedItems?: number };

type LoggingOptions = { level?: LogLevel; prefix?: string };

export class Mastofeed {
  private readonly mastodonClient: MastodonClient;
  private readonly logger: Logger;
  readonly rssFeedUrl: string;
  readonly postDef: PostDef;
  readonly maxSyncedItems: number;

  constructor(options: MastofeedOptions) {
    this.mastodonClient = new MastodonClient(options.mastodon.instanceUrl, options.mastodon.accessToken);
    this.logger = new Logger(options.logging?.level, options.logging?.prefix);
    this.rssFeedUrl = options.rss.feedUrl;
    this.postDef = options.rss.postDef;
    this.maxSyncedItems = this.computeMaxSyncedItems(options.rss.maxSyncedItems);
  }

  sync = async (): Promise<void> => {
    const existingPostIDs: string[] = await this.fetchExistingPostIDs();
    this.logger.debug(
      `Fetched ${existingPostIDs.length} existing post IDs from Mastodon:`,
      JSON.stringify(existingPostIDs, null, 2),
    );

    const feedItems: Item[] = await this.fetchFeedItems();
    const posts: Post[] = this.buildPosts(feedItems);
    this.logger.debug(`Built ${posts.length} posts from RSS:`, JSON.stringify(posts, null, 2));

    const newPosts: Post[] = posts.filter((post: Post) => !existingPostIDs.includes(post.id));
    const newPostIds: string[] = newPosts.map((post: Post) => post.id);
    const postIDs: string[] = posts.map((post: Post) => post.id);
    const filteredPostIds: string[] = postIDs.filter((postID: string) => !newPostIds.includes(postID));
    this.logger.debug(`Filtered ${postIDs.length} existing posts:`, JSON.stringify(filteredPostIds, null, 2));

    if (!newPosts.length) {
      this.logger.info('No new posts to send.');
      return;
    }

    this.logger.debug(`Posting ${newPostIds.length} new posts:`, JSON.stringify(newPostIds, null, 2));
    await this.postToots(newPosts);
  };

  private computeMaxSyncedItems = (optionsMaxSyncedItems: number | undefined): number => {
    let syncedItems: number;

    if (optionsMaxSyncedItems && optionsMaxSyncedItems > GLOBAL_MAX_SYNCED_ITEMS) {
      this.logger.warn(`Synced items is limited to ${GLOBAL_MAX_SYNCED_ITEMS}.`);
      syncedItems = GLOBAL_MAX_SYNCED_ITEMS;
    } else {
      syncedItems = optionsMaxSyncedItems ?? GLOBAL_MAX_SYNCED_ITEMS;
    }

    this.logger.info(`Syncing batches of up to ${syncedItems} items.`);
    return syncedItems;
  };

  private fetchExistingPostIDs = async (): Promise<string[]> => {
    const existingToots = await this.mastodonClient.fetchExistingToots();
    return existingToots
      .map((toot: Entity.Status) => extractUrlFromTootContent(toot.content))
      .map((url: string) => extractMFIDFromUrl(url));
  };

  private fetchFeedItems = async (): Promise<Item[]> => {
    const feed: Output<Item> = await parseFeed(this.rssFeedUrl);
    this.logger.info(`Fetched ${feed.items.length} RSS feed items.`);
    const sortedItems = feed.items
      .sort((a: Item, b: Item) => new Date(b.isoDate ?? 0).getTime() - new Date(a.isoDate ?? 0).getTime())
      .slice(0, this.maxSyncedItems);
    this.logger.debug('Sorted items:', JSON.stringify(sortedItems, null, 2));
    return sortedItems;
  };

  private buildPosts = (feedItems: Item[]): Post[] => {
    return feedItems.map((item: Item) => buildPost(this.postDef, item));
  };

  private postToots = async (posts: Post[]): Promise<void> => {
    for (const post of posts) {
      const postNumber: number = posts.indexOf(post) + 1;
      this.logger.info(`Sending toot for post '${post.id}' (${postNumber} of ${posts.length})...`);
      await this.tryPostToot(post);
    }
  };

  private tryPostToot = async (post: Post): Promise<void> => {
    const text: string = buildTootText(post);
    try {
      const toot: Entity.Status = await this.mastodonClient.postToot(text);
      this.logger.success(`Successfully sent toot '${toot.id}' for post '${post.id}'.`);
    } catch (error) {
      if (isAxiosError(error)) {
        this.logger.error(`Failed to send toot for post '${post.id}': ${JSON.stringify(error.response?.data)}`);
      } else {
        throw error;
      }
    }
  };
}
