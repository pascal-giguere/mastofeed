import { Bot } from './bot';
import { MapTransform, UppercaseTransform } from './transforms';

const laPresseBot = new Bot({
  feedUrl: 'https://www.lapresse.ca/manchettes/rss',
  postDef: {
    title: { path: 'title', regex: '(?!.*\\|) *(.+)?', transforms: [new UppercaseTransform()] },
    subtitle: { path: 'title', regex: '^(.+) \\|' },
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
    imageUrl: { path: 'enclosure.url' },
    linkUrl: { path: 'link' },
  },
});

laPresseBot.fetchFeedItems().then((items) => {
  const posts = laPresseBot.buildPosts(items);
  console.log(posts);
});
