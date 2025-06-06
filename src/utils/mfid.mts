// An MFID, short for "Mastofeed identifier", is a short base64 string representing the unique identifier of an RSS item.
// It allows Mastofeed to keep track of which RSS items have already been posted to Mastodon.

export function encodeMFID(decoded: string): string {
  return Buffer.from(decoded).toString("base64");
}

export function decodeMFID(encoded: string): string {
  return Buffer.from(encoded, "base64").toString("utf-8");
}

export function extractUrlFromTootContent(content: string): string {
  const matches: RegExpMatchArray[] = Array.from(content.matchAll(/<a href="(.+?)"/g));
  if (matches.length === 0 || matches[matches.length - 1].length !== 2) {
    throw new Error(`Failed to extract URL from toot content '${content}'.`);
  }
  // If the toot contains multiple links, we want to extract the last one.
  return matches[matches.length - 1][1];
}

export function extractMFIDFromUrl(url: string): string {
  const encodedMfid = new URL(url).searchParams.get("mfid");
  if (!encodedMfid) {
    throw new Error(`Failed to extract MFID from URL '${url}'.`);
  }
  return decodeMFID(encodedMfid);
}

export function addMFIDToUrl(url: string, id: string): string {
  const urlObject = new URL(url);
  urlObject.searchParams.set("mfid", encodeMFID(id));
  return urlObject.toString();
}
