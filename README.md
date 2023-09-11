# Mastofeed 📬

Post new RSS feed items to Mastodon.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

## Prerequisites

Mastofeed requires that you use a Mastodon bot account and generate an access token for it.

To do so, log into your Mastodon instance with your bot account, then go to Preferences > Development and create a new
application with the `write:media` and `write:statuses` scopes. Take note of the access token generated for your
application.

## Installation

```bash
npm install mastofeed
```

## Usage

Instantiate a `Mastofeed` client, providing your Mastodon and RSS configuration.

Use the `rss.postDef` property to define a mapping of RSS item attributes and customize the contents of your Mastodon
posts.

#### Basic example:

```js
import { Mastofeed } from 'mastofeed';

const feed = new Mastofeed({
  mastodon: {
    instanceUrl: 'https://mastodon.quebec',
    accessToken: process.env.MASTODON_ACCESS_TOKEN,
  },
  rss: {
    feedUrl: 'https://www.lapresse.ca/manchettes/rss',
    postDef: {
      id: { path: 'guid' },
      title: { path: 'title' },
      linkUrl: { path: 'link' },
    },
  },
});
```

#### Advanced example:

```js
import { Mastofeed, MapTransform, UppercaseTransform } from 'mastofeed';

const feed = new Mastofeed({
  mastodon: {
    instanceUrl: 'https://mastodon.quebec',
    accessToken: process.env.MASTODON_ACCESS_TOKEN,
  },
  rss: {
    feedUrl: 'https://www.lapresse.ca/manchettes/rss',
    postDef: {
      id: { path: 'guid' },
      title: { path: 'title', regex: '(?!.*\\|) *(.+)?' },
      kicker: { path: 'title', regex: '^(.+) \\|', transforms: [new UppercaseTransform()] },
      category: {
        path: 'link',
        regex: '^https:\\/\\/www\\.lapresse\\.ca\\/(\\w+)\\/',
        transforms: [
          new MapTransform({
            actualites: 'Actualités',
            affaires: 'Affaires',
            auto: 'Auto',
            arts: 'Arts',
            cinema: 'Cinéma',
            contexte: 'Contexte',
            debats: 'Débats',
            gourmand: 'Gourmand',
            international: 'International',
            maison: 'Maison',
            societe: 'Société',
            sports: 'Sports',
            voyage: 'Voyage',
          }),
        ],
      },
      description: { path: 'contentSnippet' },
      author: { path: 'dc:creator' },
      imageUrl: { path: 'enclosure.url' },
      linkUrl: { path: 'link' },
    },
  },
});
```

#### Publishing to Mastodon

Then, to publish all new RSS items to your Mastodon instance from your bot account:

```js
await feed.publish();
```
