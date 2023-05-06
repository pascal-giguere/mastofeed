import generator, { Entity, MegalodonInterface, Response } from 'megalodon';

export function initMastodonClient(instanceUrl: string, accessToken: string): MegalodonInterface {
  return generator('mastodon', instanceUrl, accessToken);
}

export async function postTooth(mastodonClient: MegalodonInterface, text: string): Promise<void> {
  const response = (await mastodonClient.postStatus(text, { visibility: 'public' })) as Response<Entity.Status>;
  console.log(response);
}
