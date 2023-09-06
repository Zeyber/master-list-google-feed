# Master List Google Feed

This feed tells you when you have unread emails from Gmail, unfinished tasks due with Google Tasks or upcoming events on Google Calendar.

It uses Google's api (googleapis) to get information from these services.

## Installation

### NPM

-   Install by running `npm install @zeyber/master-list-google-feed` in the terminal.
-   Run from installed location with `PORT=XXXX node ./node_modules/@zeyber/master-list-google-feed/dist/main.js`. Define the port by replacing `PORT=XXXX` (eg. `PORT=3010 ...`). The default port is 3000.

### Clone from Github

-   Clone with `git clone https://github.com/Zeyber/master-list-google-feed`.

#### Build

-   Build with `npm run build`.
-   Run with `PORT=3000 node dist/main.js`.

#### Run in Development mode

-   Start with `PORT=3000 npm start`.

## Usage

### Authentication

-   Get your Google API Credentials file and put it in `.credentials/google-credentials.json`. Follow [this](https://developers.google.com/workspace/guides/create-credentials) guide for more information.
-   Start running the app and follow instructions to create your token file that authorizes api usage.
-   When running the app, googleapis will use this token to make calls to the API.

### Reading Feed Data

After the feed is initialized, you will be able to request JSON formatted data from the feed at its address.
To see this in action:

-   Open your browser and go url `http://localhost:3000/gmail`, `http://localhost:3000/tasks` or `http://localhost:3000/calendar` (or whichever address you have the app running).
-   You will see a JSON-formatted response with relevant data.

This format is structured in a way interpretable by the [Master List](https://github.com/Zeyber/master-list) apps. But you could also use this feed for other purposes if you wanted.

## About Master List

An organizational list that leverages third-party APIs and displays information in a simple list.

Sometimes managing so many tasks can become overwhelming (eg. emails, agenda, tasks, social media, communications across multiple platforms). It is easy lose track of what needs to be done, when and how much you really need to do.

Master List has an [App version for Browser](https://github.com/Zeyber/master-list) and a [CLI version](https://github.com/Zeyber/master-list-cli). It features connecting to APIs or feeds that can be configured to read relevant important information that ordinary users may require.

[Find out more here](https://github.com/Zeyber/master-list)
