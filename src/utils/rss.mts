import Parser, { Output, Item } from "rss-parser";
import { ProxyAgent } from "undici";
import { Logger } from "./logging.mjs";

const DEFAULT_HEADERS = {
  "User-Agent": "Mastofeed (+https://github.com/pascal-giguere/mastofeed)",
  Accept: "application/rss+xml",
};
const FETCH_TIMEOUT_MS = 60000;
const MAX_REDIRECTS = 5;
const BODY_PREVIEW_LENGTH = 500;

const rssParser = new Parser();

function headersToObject(headers: Headers): Record<string, string> {
  return Object.fromEntries(headers.entries());
}

function buildBodyPreview(body: string): { bodyPreview: string; truncated?: boolean } {
  if (body.length <= BODY_PREVIEW_LENGTH) {
    return { bodyPreview: body };
  }
  return { bodyPreview: body.slice(0, BODY_PREVIEW_LENGTH), truncated: true };
}

async function fetchFeedXml({
  feedUrl,
  proxyUrl,
  logger,
}: {
  feedUrl: string;
  proxyUrl?: string;
  logger?: Logger;
}): Promise<string> {
  let currentUrl = feedUrl;
  const dispatcher = proxyUrl ? new ProxyAgent(proxyUrl) : undefined;

  try {
    for (let redirectAttempt = 0; redirectAttempt <= MAX_REDIRECTS; redirectAttempt++) {
      logger?.debug(
        "RSS feed request:",
        JSON.stringify(
          {
            method: "GET",
            url: currentUrl,
            redirectAttempt,
            headers: DEFAULT_HEADERS,
            ...(proxyUrl ? { proxyUrl } : {}),
          },
          null,
          2,
        ),
      );

      const startTime = performance.now();
      let response: Response;
      try {
        response = await fetch(currentUrl, {
          method: "GET",
          headers: DEFAULT_HEADERS,
          redirect: "manual",
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
          ...(dispatcher ? { dispatcher } : {}),
        });
      } catch (error) {
        logger?.debug(
          "RSS feed request failed:",
          JSON.stringify(
            {
              url: currentUrl,
              redirectAttempt,
              error: error instanceof Error ? error.message : String(error),
            },
            null,
            2,
          ),
        );
        throw error;
      }

      const durationMs = Math.round(performance.now() - startTime);

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) {
          logger?.debug(
            "RSS feed request failed:",
            JSON.stringify(
              {
                url: currentUrl,
                status: response.status,
                statusText: response.statusText,
                error: "Redirect response missing Location header",
              },
              null,
              2,
            ),
          );
          throw new Error(`Redirect response missing Location header (${response.status})`);
        }

        const nextUrl = new URL(location, currentUrl).href;

        logger?.debug(
          "RSS feed redirect:",
          JSON.stringify(
            {
              from: currentUrl,
              to: nextUrl,
              status: response.status,
            },
            null,
            2,
          ),
        );

        if (redirectAttempt === MAX_REDIRECTS) {
          logger?.debug(
            "RSS feed request failed:",
            JSON.stringify(
              {
                url: currentUrl,
                status: response.status,
                error: "Too many redirects",
              },
              null,
              2,
            ),
          );
          throw new Error("Too many redirects");
        }

        currentUrl = nextUrl;
        continue;
      }

      const body = await response.text();
      logger?.debug(
        "RSS feed response:",
        JSON.stringify(
          {
            url: currentUrl,
            finalUrl: response.url,
            status: response.status,
            statusText: response.statusText,
            headers: headersToObject(response.headers),
            durationMs,
            bodyLength: body.length,
            ...buildBodyPreview(body),
          },
          null,
          2,
        ),
      );

      if (response.status >= 300) {
        logger?.debug(
          "RSS feed request failed:",
          JSON.stringify(
            {
              url: currentUrl,
              status: response.status,
              statusText: response.statusText,
              error: `Status code ${response.status}`,
            },
            null,
            2,
          ),
        );
        throw new Error(`Status code ${response.status}`);
      }

      return body;
    }

    throw new Error("Too many redirects");
  } finally {
    if (dispatcher) {
      await dispatcher.close();
    }
  }
}

export async function parseFeed({
  feedUrl,
  proxyUrl,
  logger,
}: {
  feedUrl: string;
  proxyUrl?: string;
  logger?: Logger;
}): Promise<Output<Item>> {
  const xml = await fetchFeedXml({ feedUrl, proxyUrl, logger });
  const feed = await rssParser.parseString(xml);

  logger?.debug(
    "RSS feed parsed:",
    JSON.stringify(
      {
        title: feed.title,
        link: feed.link,
        feedUrl: feed.feedUrl,
        description: feed.description,
        itemCount: feed.items.length,
      },
      null,
      2,
    ),
  );

  return feed;
}
