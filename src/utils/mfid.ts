// An MFID, short for "Mastofeed identifier", is a short base64 string representing the unique identifier of an RSS item.
// It allows Mastofeed to keep track of which RSS items have already been posted to Mastodon.

export function encodeMFID(decoded: string): string {
  return Buffer.from(decoded).toString('base64');
}

export function decodeMFID(encoded: string): string {
  return Buffer.from(encoded, 'base64').toString('utf-8');
}
