import { Injectable } from '@nestjs/common';
import { gmail_v1, google } from 'googleapis';
import { Google } from './google';

export interface GoogleGmailOptions {
  token: string;
}

const defaultOptions = {
  token: '.credentials/google-token.json',
};

const ICON_PATH = '/assets/icon-2.png';

@Injectable()
export class GoogleGmailService {
  private api: gmail_v1.Gmail;
  private google: Google;

  initialize() {
    this.google = new Google(defaultOptions);
    this.connect();
  }

  get() {
    return this.getData();
  }

  async connect() {
    const auth = await this.google.getAuth();

    if (auth) {
      this.api = google.gmail({ version: 'v1', auth });
    }
  }

  async getData() {
    return new Promise(async (resolve, reject) => {
      const threadsData = await this.api.users.threads.list({
        userId: 'me',
        q: 'is:unread label:inbox',
        includeSpamTrash: false,
      });

      const threads = threadsData.data.threads;
      const items = threads
        ?.filter((thread) => thread.snippet.length)
        .map((msg) => {
          return { message: `${msg.snippet}`, icon: ICON_PATH };
        });

      resolve({ data: items });
    });
  }
}
