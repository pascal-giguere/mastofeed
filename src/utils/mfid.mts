// An MFID, short for "Mastofeed identifier", is a short base64 string representing the unique identifier of an RSS item.
// It allows Mastofeed to keep track of which RSS items have already been posted to Mastodon.

import { decode as decodeHtmlEntities } from "html-entities";

// Mastodon's autolinker (twitter-text `valid_url_path_ending_chars`) does not
// allow a path to end with these. A following `?mfid=` is left as unlinked text.
// Balanced `(...)` at the end is allowed (Wikipedia-style slugs).
// See: https://github.com/mastodon/mastodon/blob/main/config/initializers/twitter_regex.rb
const AUTOLINK_UNSAFE_PATH_ENDING = /[()?!*"'「」<>;:=,.$%[\]~&|\s]/u;

function isBalancedParenGroup(value: string): boolean {
  if (value.length < 2 || !value.startsWith("(") || !value.endsWith(")")) {
    return false;
  }
  let depth = 0;
  for (const char of value) {
    if (char === "(") {
      depth++;
    } else if (char === ")") {
      depth--;
    }
    if (depth < 0) {
      return false;
    }
  }
  return depth === 0;
}

function splitTrailingBalancedParenGroup(pathname: string): { core: string; suffix: string } {
  if (!pathname.endsWith(")")) {
    return { core: pathname, suffix: "" };
  }

  let depth = 0;
  for (let i = pathname.length - 1; i >= 0; i--) {
    const char = pathname[i];
    if (char === ")") {
      depth++;
    } else if (char === "(") {
      depth--;
    }
    if (depth === 0) {
      const suffix = pathname.slice(i);
      if (isBalancedParenGroup(suffix)) {
        return { core: pathname.slice(0, i), suffix };
      }
      break;
    }
    if (depth < 0) {
      break;
    }
  }

  return { core: pathname, suffix: "" };
}

function percentEncodeChar(char: string): string {
  const encoded = encodeURIComponent(char);
  if (encoded !== char) {
    return encoded;
  }
  // encodeURIComponent leaves ! ' ( ) * . ~ unescaped; force those too.
  return `%${char.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0")}`;
}

function encodePathEndingForAutolink(pathname: string): string {
  const { core, suffix } = splitTrailingBalancedParenGroup(pathname);
  const chars = Array.from(core);
  let i = chars.length;
  while (i > 0 && AUTOLINK_UNSAFE_PATH_ENDING.test(chars[i - 1]!)) {
    i--;
  }
  const encodedEnding = chars.slice(i).map(percentEncodeChar).join("");
  return chars.slice(0, i).join("") + encodedEnding + suffix;
}

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

export function extractMFIDFromTootContent(content: string): string {
  const matches = Array.from(content.matchAll(/mfid=([A-Za-z0-9+/=_%-]+)/gi));
  if (matches.length > 0) {
    const encodedMfid = decodeHtmlEntities(matches[matches.length - 1][1]);
    try {
      return decodeMFID(decodeURIComponent(encodedMfid));
    } catch {
      return decodeMFID(encodedMfid);
    }
  }

  const url = extractUrlFromTootContent(content);
  return extractMFIDFromUrl(url);
}

export function addMFIDToUrl(url: string, id: string): string {
  const urlObject = new URL(url);
  urlObject.searchParams.set("mfid", encodeMFID(id));
  const encodedPath = encodePathEndingForAutolink(urlObject.pathname);
  const href = urlObject.toString();
  if (encodedPath === urlObject.pathname) {
    return href;
  }

  // The URL serializer decodes some path characters (! * ' ( ) . ~) even after
  // percent-encoding them. Splice the encoded path into href so they stick.
  const pathIndex = href.indexOf(urlObject.pathname, href.indexOf(urlObject.host));
  if (pathIndex === -1) {
    return href;
  }
  return href.slice(0, pathIndex) + encodedPath + href.slice(pathIndex + urlObject.pathname.length);
}
