import generator, { Entity, MegalodonInterface, OAuth, Response } from 'megalodon';
import { Post } from './posts';

export async function initMastodonClient(
  instanceUrl: string,
  clientId: string,
  clientSecret: string,
  authorizationCode: string
): Promise<MegalodonInterface> {
  const client: MegalodonInterface = generator('mastodon', instanceUrl);
  const accessToken = await fetchAccessToken(client, clientId, clientSecret, authorizationCode);
  return generator('mastodon', instanceUrl, accessToken);
}

export async function fetchAccessToken(
  mastodonClient: MegalodonInterface,
  clientId: string,
  clientSecret: string,
  authorizationCode: string
): Promise<string> {
  const data: OAuth.TokenData = await mastodonClient.fetchAccessToken(clientId, clientSecret, authorizationCode);
  return data.accessToken;
}

export async function postTooth(mastodonClient: MegalodonInterface, post: Post): Promise<void> {
  const response = (await mastodonClient.postStatus('test tooth')) as Response<Entity.Status>;
  console.log(response);
}
