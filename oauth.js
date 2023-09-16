//This file exists because we are profesionals, if you see this, you're also a profesional :)
const axios = require("axios");
const url = require("url");

const redirectUri = "http://localhost:5000/callback";
const secrets = require("./secrets.json");
const clientId = secrets.CLIENT_ID;
const superSecretSecret = secrets.CLIENT_SECRET;

let accessToken = null,
  refreshToken = null;

function getAccessToken() {
  return accessToken;
}

async function sufferWithTokens(callbackURL) {
  const urlParts = url.parse(callbackURL, true);
  const query = urlParts.query;


  const exchangeOptions = {
    'grant_type': 'authorization_code',
    'client_id': clientId,
    'client_secret': superSecretSecret,
    'code': query.code,
    'redirect_uri': redirectUri,
  };

  var formBody = [];
  for (var property in exchangeOptions) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(exchangeOptions[property]);
    formBody.push(encodedKey + "=" + encodedValue);
  }
  formBody = formBody.join("&");

  const options = {
    method: "POST",
    url: `https://sso.chaster.app/auth/realms/app/protocol/openid-connect/token`,
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    data: formBody,
  };

  try {
    const response = await axios(options);
    accessToken = response.data.access_token;
    refreshToken = response.data.refresh_token;
  } catch (e) {
    console.log(`You stupid bitch wtf did you do: ${e}`);
    throw error;
  }
}

module.exports = {
  getAccessToken,
  clientId,
  sufferWithTokens,
};
