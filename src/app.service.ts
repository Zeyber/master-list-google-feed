import { Injectable } from '@nestjs/common';
import { Client, LocalAuth, NoAuth } from 'whatsapp-web.js';
import WAWebJS = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

export interface WhatsappOptions {
  /**
   * Use LocalAuth Strategy if sessionFile path is defined.
   * Default uses NoAuth Strategy.
   */
  sessionFile?: string;
}

export const defaultOptions: WhatsappOptions = {
  sessionFile: '.credentials/whatsapp-session',
};

const ICON_PATH = '/assets/icon-4.png';

@Injectable()
export class AppService {
  client: Client;
  options = defaultOptions;

  initialize() {
    this.setupClient();
  }

  getData() {
    return this.getChats();
  }

  async setupClient() {
    // Use LocalAuth Strategy if sessionFile is defined only
    const authStrategy = this.options.sessionFile
      ? new LocalAuth({
          dataPath: this.options.sessionFile,
        })
      : new NoAuth();

    return new Promise(async (resolve) => {
      this.client = new Client({
        authStrategy,
        puppeteer: {
          executablePath: process.env.FACEBOOK_CHROME_PATH,
          // args: minimal_args,
        },
      });

      this.client.on('authenticated', () => {
        console.log('Authenticated');
      });

      this.client.on('qr', (qr) => {
        qrcode.generate(qr, { small: true });
      });

      this.client.on('ready', () => {
        console.log('Ready');
        this.client.on('disconnected', () => {
          console.log(
            'Whatsapp Client disconnected. Reconnecting in 1 minute...',
          );
          setTimeout(() => this.client.initialize(), 1 * 60 * 1000);
        });
        resolve(true);
      });

      this.client.initialize();
    });
  }

  async getChats(): Promise<any> {
    return new Promise(async (resolve) => {
      const chats = (await this.client?.getChats()) || [];
      const unread: WAWebJS.Chat[] = chats.filter(
        (chat) => chat.unreadCount && !chat.archived,
      );
      const items = unread.map((chat: WAWebJS.Chat) => {
        return {
          message: `${chat.name} (${Math.abs(chat.unreadCount)})`,
          icon: ICON_PATH,
        };
      });
      resolve({ data: items });
    });
  }
}
