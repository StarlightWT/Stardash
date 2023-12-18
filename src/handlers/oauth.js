//This file exists because we are profesionals, if you see this, you're also a profesional :)
/*
  Welcome to blackmagic land, I have no idea how this works for the most part so,
  I won't even pretend that I do. This was coded by Denom765, I don't understand it...
  It just works
*/
const axios = require("axios");
const url = require("url");

const secrets = require("../../secrets.json");
const clientId = secrets.CLIENT_ID;
const tokenUrl = `https://discord.com/api/oauth2/token`;

let accessToken = null;

function getAccessToken() {
	return accessToken;
}

async function sufferWithTokens(callbackURL, callbackFunction) {
	const urlParts = url.parse(callbackURL, true);

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
		// data: formBody,
	};

	try {
		const response = await axios(options);
		console.log(response);
		// console.log("[Oauth] Access token updated!!!");
		// callbackFunction(accessToken);
	} catch (e) {
		console.log(`You stupid bitch wtf did you do: ${e}`);
		throw e;
	}
}

var authLink = `https://discord.com/api/oauth2/authorize?client_id=1186354828427927673&response_type=code&redirect_uri=localhost%3A5000%2Fcallback&scope=identify+email}`;

module.exports = {
	getAccessToken,
	clientId,
	sufferWithTokens,
	authLink,
};
