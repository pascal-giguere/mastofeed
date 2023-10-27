import { Item, Output } from 'rss-parser';
import { Entity } from 'megalodon';
import { isAxiosError } from 'axios';
import { buildPost, buildToothText, Post, PostDef } from './utils/posts';
import { MastodonClient } from './utils/mastodon';
import { parseFeed } from './utils/rss';
import { extractMFIDFromUrl, extractUrlFromToothContent } from './utils/mfid';
import { Logger, LogLevel } from './utils/logging';

type MastofeedOptions = {
  mastodon: MastodonOptions;
  rss: RssOptions;
  logging?: LoggingOptions;
};

type MastodonOptions = { instanceUrl: string; accessToken: string };

type RssOptions = { feedUrl: string; postDef: PostDef };

type LoggingOptions = { level?: LogLevel; prefix?: string };

export class Mastofeed {
  readonly rssOptions: RssOptions;
  private readonly mastodonClient: MastodonClient;
  private readonly logger: Logger;

  constructor(options: MastofeedOptions) {
    this.rssOptions = options.rss;
    this.mastodonClient = new MastodonClient(options.mastodon.instanceUrl, options.mastodon.accessToken);
    this.logger = new Logger(options.logging?.level, options.logging?.prefix);
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
    await this.postTooths(newPosts);
  };

  private fetchExistingPostIDs = async (): Promise<string[]> => {
    const existingTooths = await this.mastodonClient.fetchExistingTooths();
    return existingTooths
      .map((tooth: Entity.Status) => extractUrlFromToothContent(tooth.content))
      .map((url: string) => extractMFIDFromUrl(url));
  };

  private fetchFeedItems = async (): Promise<Item[]> => {
    const feed: Output<Item> = await parseFeed(this.rssOptions.feedUrl);
    this.logger.info(`Fetched ${feed.items.length} RSS feed items.`);
    this.logger.debug('Items:', JSON.stringify(feed.items, null, 2));
    return feed.items;
  };

  private buildPosts = (feedItems: Item[]): Post[] => {
    return feedItems.map((item: Item) => buildPost(this.rssOptions.postDef, item));
  };

  private postTooths = async (posts: Post[]): Promise<void> => {
    for (const post of posts) {
      const postNumber: number = posts.indexOf(post) + 1;
      this.logger.info(`Sending tooth for post '${post.id}' (${postNumber} of ${posts.length})...`);
      await this.tryPostTooth(post);
    }
  };

  private tryPostTooth = async (post: Post): Promise<void> => {
    const text: string = buildToothText(post);
    try {
      const tooth: Entity.Status = await this.mastodonClient.postTooth(text);
      this.logger.success(`Successfully sent tooth '${tooth.id}' for post '${post.id}'.`);
    } catch (error) {
      if (isAxiosError(error)) {
        this.logger.error(`Failed to send tooth for post '${post.id}': ${JSON.stringify(error.response?.data)}`);
      } else {
        throw error;
      }
    }
  };
}
