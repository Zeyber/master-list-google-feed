import { Injectable } from '@nestjs/common';
import { gmail_v1, google } from 'googleapis';
import { Google } from './google';
import { of } from 'rxjs';

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

  getInitialized(): boolean {
    return !!this.api;
  }

  get() {
    if (this.getInitialized()) {
      return this.getData();
    }
    return of({
      data: [{ message: 'Google Feed not initialized', icon: ICON_PATH }],
    });
  }

  async connect() {
    const auth = await this.google.getAuth();

    if (auth) {
      this.api = google.gmail({ version: 'v1', auth });
    }
  }

  async getData() {
    return new Promise(async (resolve, reject) => {
      const threadsData = await this.api.users.threads
        .list({
          userId: 'me',
          q: 'is:unread label:inbox',
          includeSpamTrash: false,
        })
        .catch((error) => {
          console.log(error);
          return undefined;
        });

      if (threadsData) {
        const threads = threadsData.data.threads;
        const items = threads
          ?.filter((thread) => thread.snippet.length)
          .map((msg) => {
            return { message: `${msg.snippet}`, icon: ICON_PATH };
          });

        resolve({ data: items });
      }

      resolve({
        data: [
          {
            message: 'An error occured. Please check server',
            icon: ICON_PATH,
          },
        ],
      });
    });
  }
}
