import Parser, { Output, Item } from 'rss-parser';
import { buildPost, Post, PostDef } from './posts';

const rssParser = new Parser();

type BotOptions = { feedUrl: string; postDef: PostDef };

export class Bot {
  private readonly feedUrl: string;
  private readonly postDef: PostDef;

  constructor({ feedUrl, postDef }: BotOptions) {
    this.feedUrl = feedUrl;
    this.postDef = postDef;
  }

  fetchFeedItems = async (): Promise<Item[]> => {
    const feed: Output<Item> = await rssParser.parseURL(this.feedUrl);
    return feed.items;
  };

  buildPosts = (feedItems: Item[]): Post[] => {
    return feedItems.map((item: Item) => buildPost(this.postDef, item));
  };
}
