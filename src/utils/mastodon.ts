import generator, { Entity, Mastodon, Response } from 'megalodon';
import { MAX_SYNCED_ITEMS } from '../constants';

export class MastodonClient {
  private readonly megalodonClient: Mastodon;
  private botAccountId: string | undefined;

  constructor(instanceUrl: string, accessToken: string) {
    this.megalodonClient = generator('mastodon', instanceUrl, accessToken) as Mastodon;
  }

  async postTooth(text: string): Promise<Entity.Status> {
    const response = (await this.megalodonClient.postStatus(text, { visibility: 'public' })) as Response<Entity.Status>;
    return response.data;
  }

  async fetchExistingTooths(): Promise<Entity.Status[]> {
    if (!this.botAccountId) {
      this.botAccountId = await this.fetchBotAccountId();
    }
    const response = await this.megalodonClient.getAccountStatuses(this.botAccountId, {
      limit: MAX_SYNCED_ITEMS,
      only_media: false,
    });
    return response.data;
  }

  private async fetchBotAccountId(): Promise<string> {
    const account = await this.fetchCurrentUserAccount();
    if (!account.bot) {
      throw new Error('Mastodon access token must be for a bot user.');
    }
    return account.id;
  }

  private async fetchCurrentUserAccount(): Promise<Entity.Account> {
    const response = await this.megalodonClient.verifyAccountCredentials();
    return response.data;
  }
}
