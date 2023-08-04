import { Injectable } from '@nestjs/common';
import { calendar_v3, google } from 'googleapis';
import { Google } from './google';

export interface GoogleCalendarData {
  calendars?: Array<any>;
  events?: Array<any>;
}

export interface GoogleCalendarOptions {
  token: string;
}

const defaultOptions = {
  token: '.credentials/google-token.json',
};

const ICON_PATH = '/assets/icon-5.png';

@Injectable()
export class GoogleCalendarService {
  private api: calendar_v3.Calendar;
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
      this.api = google.calendar({ version: 'v3', auth });
    }
  }

  getEventsCombined(events) {
    return events.sort(
      (a, b) =>
        new Date(a.start.dateTime || a.start.date).getTime() -
        new Date(b.start.dateTime || b.start.date).getTime(),
    );
  }

  async getData() {
    return new Promise(async (resolve, reject) => {
      const calendarData = await this.api.calendarList.list();
      const calendars = calendarData?.data?.items;
      const calendarIds = calendars?.map((cal) => cal.id);

      if (!calendarIds?.length) {
        return;
      }

      let events = [];

      for (const id of calendarIds) {
        const eventsData = await this.api.events.list({
          calendarId: id,
          timeMin: convertToDate(new Date()).toISOString(),
          maxResults: 100,
          singleEvents: true,
          orderBy: 'startTime',
        });
        events.push(...eventsData?.data?.items);
      }

      events = this.getEventsCombined(events);
      const eventsToday = this.getEventsToday(events);
      const items = eventsToday.map((event) => {
        return {
          message: this.formatEvent(event),
          icon: ICON_PATH,
        };
      });

      resolve({ data: items });
    });
  }

  private formatEvent(event: any) {
    if (event.start.date) {
      return `${event.summary.toUpperCase()}`;
    }

    if (event.start.dateTime) {
      return `${new Date(event.start.dateTime)
        .toLocaleTimeString()
        .slice(0, -3)} - ${
        event.summary ?? process.env.GOOGLE_CALENDAR_EVENT_NAME_DEFAULT
      }`;
    }
  }

  private getEventsToday(events) {
    return events?.filter((event) => {
      const eventDate = convertToDate(event.start.dateTime || event.start.date);
      const today = convertToDate(new Date());
      return (
        eventDate.getTime() === today.getTime() &&
        new Date().getTime() <= new Date(event.end.dateTime).getTime()
      );
    });
  }
}

export function convertToDate(dateTime: string | Date): Date {
  return new Date(new Date(dateTime).toDateString());
}
