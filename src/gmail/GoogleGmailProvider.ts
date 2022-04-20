import { gmail_v1, google } from "googleapis";
import { ProviderOptions, Provider } from "@master-list/core";
import { Google } from "../google";

export interface GoogleGmailOptions extends ProviderOptions {
  token: string;
}

const defaultOptions: ProviderOptions = {
  providerName: "Gmail",
};

export class GoogleGmailProvider extends Provider {
  private api: gmail_v1.Gmail;
  private google: Google;

  constructor(public options: GoogleGmailOptions) {
    super({
      ...defaultOptions,
      ...options,
    });
  }

  initialize(): Promise<boolean> {
    return super.initialize(async () => {
      this.google = new Google(this.settings);
      await this.connect();
    });
  }

  reload() {
    return super.reload(async () => {
      return await this.getData();
    });
  }

  async connect() {
    const auth = await this.google.getAuth();

    if (auth) {
      this.api = google.gmail({ version: "v1", auth });
    }
  }

  async getData() {
    return new Promise(async (resolve, reject) => {
      const threadsData = await this.api.users.threads.list({
        userId: "me",
        q: "is:unread label:inbox",
        includeSpamTrash: false,
      });

      const threads = threadsData.data.threads;
      const items = threads
        ?.filter((thread) => thread.snippet.length)
        .map((msg) => `${msg.snippet}`);

      resolve(items);
    });
  }
}
