//This file exists because we are profesionals, if you see this, you're also a profesional :)
/*
  Welcome to blackmagic land, I have no idea how this works for the most part so,
  I won't even pretend that I do. This was coded by Denom765, I don't understand it...
  It just works
*/
const axios = require("axios");
const url = require("url");

const redirectUri = "http://localhost:5000/callback";
const secrets = require("../../secrets.json");
const clientId = secrets.CLIENT_ID;
const superSecretSecret = secrets.CLIENT_SECRET;

const tokenUrl = `https://sso.chaster.app/auth/realms/app/protocol/openid-connect/token`;

let accessToken = null,
  refreshToken = null;

function getAccessToken() {
  return accessToken;
}

async function sufferWithTokens(callbackURL) {
  const urlParts = url.parse(callbackURL, true);
  const query = urlParts.query;

  const exchangeOptions = {
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: superSecretSecret,
    code: query.code,
    redirect_uri: redirectUri,
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
    url: tokenUrl,
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
    throw e;
  }
}

async function refreshTokens() {
  const exchangeOptions = {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_secret: superSecretSecret,
    client_id: clientId,
  };

  var formBody = [];
  for (var property in exchangeOptions) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(exchangeOptions[property]);
    formBody.push(encodedKey + "=" + encodedValue);
  }
  formBody = formBody.join("&");
  // console.log( `formBody: ${formBody}` )

  const options = {
    method: "POST",
    url: tokenUrl,
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
    throw e;
  }
}

var stateKey = Math.floor(Math.random()*10000000000);
var authLink = `https://sso.chaster.app/auth/realms/app/protocol/openid-connect/auth?client_id=${secrets.CLIENT_ID}&response_type=code&scope=profile locks&state=${stateKey}`;
  

module.exports = {
  getAccessToken,
  clientId,
  sufferWithTokens,
  refreshTokens,
  authLink
};
