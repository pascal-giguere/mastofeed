// An MFID, short for "Mastofeed identifier", is a short base64 string representing the unique identifier of an RSS item.
// It allows Mastofeed to keep track of which RSS items have already been posted to Mastodon.

export function encodeMFID(decoded: string): string {
  return Buffer.from(decoded).toString('base64');
}

export function decodeMFID(encoded: string): string {
  return Buffer.from(encoded, 'base64').toString('utf-8');
}

export function extractUrlFromToothContent(content: string): string {
  const match = content.match(/<a href=\"(.+?)\"/);
  if (match?.length !== 2) {
    throw new Error(`Failed to extract URL from tooth content '${content}'.`);
  }
  return match[1];
}

export function extractMFIDFromUrl(url: string): string {
  const encodedMfid = new URL(url).searchParams.get('mfid');
  if (!encodedMfid) {
    throw new Error(`Failed to extract MFID from URL '${url}'.`);
  }
  return decodeMFID(encodedMfid);
}
