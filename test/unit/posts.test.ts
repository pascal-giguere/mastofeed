import { buildToothText, Post } from '../../src/utils/posts';

describe("Build a tooth's text from a Post object", () => {
  it('builds tooth text from a complete Post object', () => {
    const post: Post = {
      title: 'Title',
      subtitle: 'Subtitle',
      description: 'Description',
      linkUrl: 'https://example.com/',
    };
    expect(buildToothText(post)).toEqual(`Title
Subtitle

Description

https://example.com/`);
  });

  it('builds tooth text from a partial Post object', () => {
    const titleOnly: Post = {
      title: 'Title',
    };
    expect(buildToothText(titleOnly)).toEqual('Title');

    const titleAndSubtitle: Post = {
      title: 'Title',
      subtitle: 'Subtitle',
    };
    expect(buildToothText(titleAndSubtitle)).toEqual(`Title
Subtitle`);

    const titleAndDescription: Post = {
      title: 'Title',
      description: 'Description',
    };
    expect(buildToothText(titleAndDescription)).toEqual(`Title

Description`);

    const titleAndLink: Post = {
      title: 'Title',
      linkUrl: 'https://example.com/',
    };
    expect(buildToothText(titleAndLink)).toEqual(`Title

https://example.com/`);

    const titleDescriptionAndLink: Post = {
      title: 'Title',
      description: 'Description',
      linkUrl: 'https://example.com/',
    };
    expect(buildToothText(titleDescriptionAndLink)).toEqual(`Title

Description

https://example.com/`);
  });

  it('builds tooth text with trimmed text if character count > 500', () => {
    const completePost: Post = {
      title: 'Title',
      subtitle: 'Subtitle',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
      linkUrl: 'https://example.com/',
    };
    const completePostText: string = buildToothText(completePost);
    expect(completePostText).toEqual(`Title
Subtitle

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut persp…

https://example.com/`);

    const partialPost: Post = {
      title: 'Title',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
    };
    const partialPostText: string = buildToothText(partialPost);
    expect(partialPostText).toEqual(`Title

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus erro…`);
  });
});
