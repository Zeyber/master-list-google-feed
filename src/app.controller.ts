import { Controller, Get } from '@nestjs/common';
import { GoogleCalendarService } from './google-calendar.service';
import { GoogleGmailService } from './google-gmail.service';
import { GoogleTasksService } from './google-tasks.service';

@Controller()
export class AppController {
  constructor(
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly googleGmailService: GoogleGmailService,
    private readonly googleTasksService: GoogleTasksService,
  ) {
    this.googleCalendarService.initialize();
    this.googleGmailService.initialize();
    this.googleTasksService.initialize();
  }

  @Get('calendar')
  async getCalendar() {
    return await this.googleCalendarService.get();
  }

  @Get('gmail')
  async getGmail() {
    return await this.googleGmailService.get();
  }

  @Get('tasks')
  async getTasks() {
    return await this.googleTasksService.get();
  }
}
