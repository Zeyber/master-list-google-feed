import { Injectable } from '@nestjs/common';
import { tasks_v1, google } from 'googleapis';
import { Google } from './google';
import { of } from 'rxjs';

export interface GoogleTasksOptions {
  token: string;
}

const defaultOptions = {
  token: '.credentials/google-token.json',
};

const ICON_PATH = '/assets/icon-7.png';

@Injectable()
export class GoogleTasksService {
  private api: tasks_v1.Tasks;
  private google: Google;

  initialize() {
    this.google = new Google(defaultOptions);
    this.connect();
  }

  async connect() {
    const auth = await this.google.getAuth();

    if (auth) {
      this.api = google.tasks({ version: 'v1', auth });
    }
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

  /**
   * Lists the user's first 10 task lists.
   *
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */
  async getData() {
    return new Promise(async (resolve, reject) => {
      const taskListsData = await this.api.tasklists.list().catch((error) => {
        console.error(error);
        return undefined;
      });

      if (taskListsData) {
        const taskLists = taskListsData?.data?.items;
        const newData = { tasks: [] };

        if (!taskLists?.length) {
          return;
        }

        for (const list of taskLists) {
          const newTaskData = await this.api.tasks.list({
            tasklist: list.id,
          });
          const newTasks = newTaskData?.data?.items;
          if (newTasks) {
            newData.tasks.push(...newTasks);
          }
        }

        const tasks = newData.tasks;
        const today = tasks.filter((task) => isToday(task.due));
        const items = today.map((task) => {
          return { message: `${task.title}`, icon: ICON_PATH };
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

export function isToday(date: Date) {
  return (
    new Date(date).toLocaleDateString() === new Date().toLocaleDateString()
  );
}
