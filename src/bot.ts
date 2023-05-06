import Parser, { Output, Item } from 'rss-parser';
import { MegalodonInterface } from 'megalodon';
import { buildPost, Post, PostDef } from './posts';
import { initMastodonClient, postTooth } from './mastodon';

const rssParser = new Parser();

type BotOptions = {
  mastodon: MastodonOptions;
  rss: RssOptions;
};

type MastodonOptions = { instanceUrl: string; clientId: string; clientSecret: string };

type RssOptions = { feedUrl: string; postDef: PostDef };

export class Bot {
  readonly mastodonOptions: MastodonOptions;
  readonly rssOptions: RssOptions;
  private mastodonClient?: MegalodonInterface;

  constructor(options: BotOptions) {
    this.mastodonOptions = options.mastodon;
    this.rssOptions = options.rss;
  }

  getMastodonClient = async (options: MastodonOptions): Promise<MegalodonInterface> => {
    if (!this.mastodonClient) {
      this.mastodonClient = await initMastodonClient(options.instanceUrl, options.clientId, options.clientSecret, '');
    }
    return this.mastodonClient;
  };

  fetchFeedItems = async (): Promise<Item[]> => {
    const feed: Output<Item> = await rssParser.parseURL(this.rssOptions.feedUrl);
    return feed.items;
  };

  buildPosts = (feedItems: Item[]): Post[] => {
    return feedItems.map((item: Item) => buildPost(this.rssOptions.postDef, item));
  };

  postTooths = async (posts: Post[]): Promise<void> => {
    const mastodonClient = await this.getMastodonClient(this.mastodonOptions);
    for (const post of posts) {
      await postTooth(mastodonClient, post);
      console.info(`Posted tooth for '${post.title}'`);
    }
  };
}
