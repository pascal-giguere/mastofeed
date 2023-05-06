import Parser, { Output, Item } from 'rss-parser';
import { MegalodonInterface } from 'megalodon';
import { buildPost, buildToothText, Post, PostDef } from './posts';
import { initMastodonClient, postTooth } from './mastodon';

const rssParser = new Parser();

type BotOptions = {
  mastodon: MastodonOptions;
  rss: RssOptions;
};

type MastodonOptions = { instanceUrl: string; accessToken: string };

type RssOptions = { feedUrl: string; postDef: PostDef };

export class Bot {
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
      console.log(`Posting tooth ${postNumber} of ${posts.length}...`);
      const text: string = buildToothText(post);
      await postTooth(this.mastodonClient, text);
    }
  };
}
