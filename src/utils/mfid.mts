// An MFID, short for "Mastofeed identifier", is a short base64 string representing the unique identifier of an RSS item.
// It allows Mastofeed to keep track of which RSS items have already been posted to Mastodon.

import { decode as decodeHtmlEntities } from "html-entities";


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

  // If the toot contains multiple links, we want to extract the last one:
  const targetMatch = matches[matches.length - 1][1];

  // Check if anything that _could_ be an HTML entity is present:
  if (!/&(?:[a-zA-Z]+|#\d+|#x[\da-fA-F]+);/.test(targetMatch)) {
    return targetMatch;                       // no entities → return as-is
  }

  // Something that _could_ be an entity is present; decode and return the result.
  return decodeHtmlEntities(targetMatch);
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
