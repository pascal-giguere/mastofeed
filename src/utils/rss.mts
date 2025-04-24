import Parser, { Output, Item } from "rss-parser";

const rssParser = new Parser();

export async function parseFeed(feedUrl: string): Promise<Output<Item>> {
  return rssParser.parseURL(feedUrl);
}
