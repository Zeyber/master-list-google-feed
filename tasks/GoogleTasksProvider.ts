import { google, tasks_v1 } from "googleapis";
import { ProviderOptions, Provider } from "master-list";
import { Google } from "../google";

export interface GoogleTasksOptions extends ProviderOptions {
  token: string;
}

const defaultOptions: ProviderOptions = {
  providerName: "Tasks",
};

export class GoogleTasksProvider extends Provider {
  private api: tasks_v1.Tasks;
  private google: Google;

  constructor(public options: GoogleTasksOptions) {
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
      this.api = google.tasks({ version: "v1", auth });
    }
  }

  /**
   * Lists the user's first 10 task lists.
   *
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */
  async getData() {
    return new Promise(async (resolve, reject) => {
      const taskListsData = await this.api.tasklists.list();
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
      const items = today.map((task) => `${task.title}`);
      resolve(items);
    });
  }
}

export function isToday(date: Date) {
  return (
    new Date(date).toLocaleDateString() === new Date().toLocaleDateString()
  );
}
