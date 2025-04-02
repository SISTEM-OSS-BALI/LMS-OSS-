import { google } from "googleapis";
import readline from "readline";

const credentials = {
  client_id:
    "457654145804-20e0kfl4ot8kqgjd0ks82ni22ai0o05s.apps.googleusercontent.com",
  client_secret: "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",
  redirect_uris: ["http://localhost:3000"],
};

async function getRefreshToken() {
  const { client_id, client_secret, redirect_uris } = credentials;
  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline", // Wajib untuk mendapatkan refresh token
    scope: ["https://www.googleapis.com/auth/calendar"],
  });

  console.log("Authorize this app by visiting this url:", authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter the code from that page here: ", async (code) => {
    rl.close();

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    console.log("Your refresh token is:", tokens.refresh_token);
  });
}

getRefreshToken();
