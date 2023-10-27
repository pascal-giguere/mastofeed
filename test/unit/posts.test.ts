import { buildTootText, Post } from '../../src/utils/posts';

describe("Build a toot's text from a Post object", () => {
  it("builds a toot's text from a complete Post object", () => {
    const post: Post = {
      id: '123',
      title: 'Title',
      linkUrl: 'https://example.com/',
      kicker: 'Kicker',
      description: 'Description',
      author: 'Author',
      category: 'Category',
    };
    expect(buildTootText(post)).toEqual(`Kicker
Title

Description

Author — Category
https://example.com/?mfid=MTIz`);
  });

  it("builds a toot's text from a partial Post object", () => {
    const titleAndLink: Post = {
      id: '123',
      title: 'Title',
      linkUrl: 'https://example.com/',
    };
    expect(buildTootText(titleAndLink)).toEqual(`Title

https://example.com/?mfid=MTIz`);

    const titleKickerAndLink: Post = {
      id: '123',
      title: 'Title',
      linkUrl: 'https://example.com/',
      kicker: 'Kicker',
    };
    expect(buildTootText(titleKickerAndLink)).toEqual(`Kicker
Title

https://example.com/?mfid=MTIz`);

    const titleDescriptionAndLink: Post = {
      id: '123',
      title: 'Title',
      linkUrl: 'https://example.com/',
      description: 'Description',
    };
    expect(buildTootText(titleDescriptionAndLink)).toEqual(`Title

Description

https://example.com/?mfid=MTIz`);

    const titleDescriptionAuthorAndLink: Post = {
      id: '123',
      title: 'Title',
      linkUrl: 'https://example.com/',
      description: 'Description',
      author: 'Author',
    };
    expect(buildTootText(titleDescriptionAuthorAndLink)).toEqual(`Title

Description

Author
https://example.com/?mfid=MTIz`);

    const titleDescriptionCategoryAndLink: Post = {
      id: '123',
      title: 'Title',
      linkUrl: 'https://example.com/',
      description: 'Description',
      category: 'Category',
    };
    expect(buildTootText(titleDescriptionCategoryAndLink)).toEqual(`Title

Description

Category
https://example.com/?mfid=MTIz`);

    const titleAuthorAndLink: Post = {
      id: '123',
      title: 'Title',
      author: 'Author',
      linkUrl: 'https://example.com/',
    };
    expect(buildTootText(titleAuthorAndLink)).toEqual(`Title

Author
https://example.com/?mfid=MTIz`);
  });

  it("builds a toot's text with trimmed description if character count > 500", () => {
    const completePost: Post = {
      id: '123',
      title: 'Title',
      kicker: 'Kicker',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
      author: 'Author',
      category: 'Category',
      linkUrl: 'https://example.com/',
    };
    expect(buildTootText(completePost)).toEqual(`Kicker
Title

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est labor…

Author — Category
https://example.com/?mfid=MTIz`);
  });

  const titleKickerDescriptionAndLink: Post = {
    id: '123',
    title: 'Title',
    linkUrl: 'https://example.com/',
    kicker: 'Kicker',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
  };
  expect(buildTootText(titleKickerDescriptionAndLink)).toEqual(`Kicker
Title

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspic…

https://example.com/?mfid=MTIz`);

  const titleDescriptionAuthorAndLink: Post = {
    id: '123',
    title: 'Title',
    linkUrl: 'https://example.com/',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
    author: 'Author',
  };
  expect(buildTootText(titleDescriptionAuthorAndLink)).toEqual(`Title

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspic…

Author
https://example.com/?mfid=MTIz`);

  const titleDescriptionCategoryAndLink: Post = {
    id: '123',
    title: 'Title',
    linkUrl: 'https://example.com/',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
    category: 'Category',
  };
  expect(buildTootText(titleDescriptionCategoryAndLink)).toEqual(`Title

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut persp…

Category
https://example.com/?mfid=MTIz`);
});
