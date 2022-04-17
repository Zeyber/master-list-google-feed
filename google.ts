import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

const fs = require("fs");
const readline = require("readline");

// If modifying these scopes, delete token.json.
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/tasks.readonly",
  "https://www.googleapis.com/auth/gmail.readonly",
];

export class Google {
  private api;
  private auth: OAuth2Client;

  constructor(private options?: any) {}

  getAuth(): Promise<OAuth2Client> {
    return new Promise(async (resolve, reject) => {
      // Load client secrets from a local file.
      fs.readFile(".credentials/google-credentials.json", (err, content) => {
        if (err) return console.log("Error loading client secret file:", err);
        // Authorize a client with credentials, then call the Google Calendar API.
        this.authorize(JSON.parse(content), (auth: OAuth2Client) => {
          resolve(auth);
        });
      });
    });
  }

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  protected authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // Check if we have previously stored a token.
    fs.readFile(this.options?.token, (err, token) => {
      if (err) return this.getAccessToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  protected getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });
    console.log("Authorize this app by visiting this url:", authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("Enter the code from that page here: ", (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error("Error retrieving access token", err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        // The file token.json stores the user's access and refresh tokens.
        fs.writeFile(this.options?.token, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
          console.log("Token stored to", this.options?.token);
        });
        callback(oAuth2Client);
      });
    });
  }

  getApi() {
    return this.api;
  }
}
