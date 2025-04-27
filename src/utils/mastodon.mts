import generator, { type Entity, type Mastodon, type Response } from "@pascal-giguere/megalodon";
import { isAxiosError } from "axios";
import { GLOBAL_MAX_SYNCED_ITEMS } from "../constants.mjs";

export class MastodonClient {
  private readonly megalodonClient: Mastodon;
  private botAccountId: string | undefined;

  constructor(instanceUrl: string, accessToken: string) {
    this.megalodonClient = generator("mastodon", instanceUrl, accessToken) as Mastodon;
  }

  async postToot(text: string): Promise<Entity.Status> {
    const response = (await this.megalodonClient.postStatus(text, { visibility: "public" })) as Response<Entity.Status>;
    return response.data;
  }

  async fetchExistingToots(): Promise<Entity.Status[]> {
    if (!this.botAccountId) {
      this.botAccountId = await this.fetchBotAccountId();
    }
    const response = await this.megalodonClient.getAccountStatuses(this.botAccountId, {
      limit: GLOBAL_MAX_SYNCED_ITEMS,
      only_media: false,
    });
    return response.data;
  }

  private async fetchBotAccountId(): Promise<string> {
    const account = await this.fetchCurrentUserAccount();
    if (!account.bot) {
      throw new Error("Mastodon access token must be for a bot user.");
    }
    return account.id;
  }

  private async fetchCurrentUserAccount(): Promise<Entity.Account> {
    try {
      const response = await this.megalodonClient.verifyAccountCredentials();
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        throw Error(`Error fetching current user account: ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  }
}
