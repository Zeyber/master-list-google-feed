import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { GoogleCalendarService } from './google-calendar.service';
import { GoogleGmailService } from './google-gmail.service';
import { GoogleTasksService } from './google-tasks.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [GoogleCalendarService, GoogleGmailService, GoogleTasksService],
})
export class AppModule {}
