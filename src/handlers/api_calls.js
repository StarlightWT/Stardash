console.error(`[API Calls] LOADED! THIS MODULE SHOULDN'T BE LOADED!`);

const secrets = require("../../secrets.json");

var token, session;
function setToken(tokenInput) {
	if (tokenInput == null || tokenInput == undefined) return;
	token = tokenInput;
}
function setSession(sessionInput) {
	if (sessionInput == null || sessionInput == undefined) return;
	session = sessionInput;
}

async function get(what, option) {
	var link = "https://api.chaster.app";
	var body, method;
	let response;
	switch (what) {
		case "profile":
			link += "/auth/profile";
			method = "GET";
			break;
		case "lock":
			link += "/locks";
			method = "GET";
			break;
		case "khlocks":
			link += "/keyholder/locks/search";
			body = {
				criteria: {},
				status: "locked",
				page: 0,
				limit: 50,
			};
			method = "POST";
			break;
		case "history":
			link += `/locks/${option}/history`;
			method = "POST";
			break;
		case "extension":
			token = secrets.DEV_TKN;
			link += "/api/extensions/sessions/search";
			body = {
				status: "locked",
				extensionSlug: "stardash-connect",
				limit: 15,
			};
			method = "POST";
			break;
		default:
			return;
	}

	switch (method) {
		case "GET":
			response = await fetch(link, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			break;
		case "POST":
			response = await fetch(link, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			});
			break;
	}

	const returnJson = await response.json();
	return returnJson;
}

async function action(what, option) {
	var link = `https://api.chaster.app/api/extensions/sessions/${sessionID}/action`;
	var body;
	switch (what) {
		case "addTime":
			body = { name: "add_time", params: option };
			break;
	}

	const response = await fetch(
		`https://api.chaster.app/api/extensions/sessions/${sessionID}/action`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		}
	);

	return response;
}

async function addTime(token, sessionID, time) {
	const response = await fetch(
		`https://api.chaster.app/api/extensions/sessions/${sessionID}/action`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				action: {
					name: "add_time",
					params: time,
				},
			}),
		}
	);

	return response;
}

async function remTime(token, sessionID, time) {
	const response = await fetch(
		`https://api.chaster.app/api/extensions/sessions/${sessionID}/action`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				action: {
					name: "remove_time",
					params: time,
				},
			}),
		}
	);
	return response;
}

async function freeze(token, sessionID) {
	const response = await fetch(
		`https://api.chaster.app/api/extensions/sessions/${sessionID}/action`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				action: {
					name: "freeze",
				},
			}),
		}
	);
	return response;
}

async function unfreeze(token, sessionID) {
	const response = await fetch(
		`https://api.chaster.app/api/extensions/sessions/${sessionID}/action`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				action: {
					name: "unfreeze",
				},
			}),
		}
	);
	return response;
}

async function toggleFreeze(token, sessionID) {
	const response = await fetch(
		`https://api.chaster.app/api/extensions/sessions/${sessionID}/action`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				action: {
					name: "toggle_freeze",
				},
			}),
		}
	);
	return response;
}

async function pillory(token, sessionID, duration, reason) {
	//duration in seconds!!!
	const response = await fetch(
		`https://api.chaster.app/api/extensions/sessions/${sessionID}/action`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				action: {
					name: "pillory",
					params: {
						duration: duration,
						reason: reason,
					},
				},
			}),
		}
	);
	return response;
}

async function log(token, sessionID, title, description, role, colour) {
	const response = await fetch(
		`https://api.chaster.app/api/extensions/sessions/${sessionID}/logs/custom`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				role: role,
				color: `#${colour}`,
				title: title,
				description: description,
			}),
		}
	);
	return response;
}

module.exports = {
	setToken,
	setSession,
	get,
	action,
	addTime, //action
	remTime, //action
	freeze, //action
	unfreeze, //action
	toggleFreeze, //action
	pillory, //action
	log, //log(?)
};
