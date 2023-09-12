import generator, { Entity, MegalodonInterface, Response } from 'megalodon';

let botAccountId: string | undefined;

export function initMastodonClient(instanceUrl: string, accessToken: string): MegalodonInterface {
  return generator('mastodon', instanceUrl, accessToken);
}

export async function postTooth(mastodonClient: MegalodonInterface, text: string): Promise<Entity.Status> {
  const response = (await mastodonClient.postStatus(text, { visibility: 'public' })) as Response<Entity.Status>;
  return response.data;
}

async function fetchCurrentUserAccount(mastodonClient: MegalodonInterface): Promise<Entity.Account> {
  const response = await mastodonClient.verifyAccountCredentials();
  return response.data;
}

async function fetchBotAccountId(mastodonClient: MegalodonInterface): Promise<string> {
  const account = await fetchCurrentUserAccount(mastodonClient);
  if (!account.bot) {
    throw new Error('Mastodon access token must be for a bot user.');
  }
  return account.id;
}

export async function fetchExistingTooths(mastodonClient: MegalodonInterface): Promise<Entity.Status[]> {
  if (!botAccountId) {
    botAccountId = await fetchBotAccountId(mastodonClient);
  }
  const response = await mastodonClient.getAccountStatuses(botAccountId, { limit: 40 });
  return response.data;
}
