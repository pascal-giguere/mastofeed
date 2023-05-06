import Parser, { Output, Item } from 'rss-parser';
import { MegalodonInterface } from 'megalodon';
import { isAxiosError } from 'axios';
import { buildPost, buildToothText, Post, PostDef } from './utils/posts';
import { initMastodonClient, postTooth } from './utils/mastodon';

const rssParser = new Parser();

type BotOptions = {
  mastodon: MastodonOptions;
  rss: RssOptions;
};

type MastodonOptions = { instanceUrl: string; accessToken: string };

type RssOptions = { feedUrl: string; postDef: PostDef };

export class Mastofeed {
  readonly rssOptions: RssOptions;
  private readonly mastodonClient: MegalodonInterface;

  constructor(options: BotOptions) {
    this.rssOptions = options.rss;
    this.mastodonClient = initMastodonClient(options.mastodon.instanceUrl, options.mastodon.accessToken);
  }

  run = async (): Promise<void> => {
    const feedItems: Item[] = await this.fetchFeedItems();
    const posts: Post[] = this.buildPosts(feedItems);
    await this.postTooths(posts);
  };

  private fetchFeedItems = async (): Promise<Item[]> => {
    const feed: Output<Item> = await rssParser.parseURL(this.rssOptions.feedUrl);
    return feed.items;
  };

  private buildPosts = (feedItems: Item[]): Post[] => {
    return feedItems.map((item: Item) => buildPost(this.rssOptions.postDef, item));
  };

  private postTooths = async (posts: Post[]): Promise<void> => {
    for (const post of posts) {
      const postNumber: number = posts.indexOf(post) + 1;
      if (postNumber !== 8) continue;
      console.log(`Posting tooth '${post.id}' (${postNumber} of ${posts.length})...`);
      const text: string = buildToothText(post);
      try {
        await postTooth(this.mastodonClient, text);
      } catch (error) {
        if (isAxiosError(error)) {
          console.error(`Failed to post tooth '${post.id}': ${JSON.stringify(error.response?.data)}`);
        } else {
          throw error;
        }
      }
    }
  };
}
