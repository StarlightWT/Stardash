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
/**
 *
 * @param {string} what profile, lock, khlocks, history, extension
 * @param {string} option History - lockId
 * @returns
 */
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

/**
 *
 * @param {string} what addtime, remtime, freeze, unfreeze, togglefreeze, pillory, log
 * @param {*} option Can be an object, for log {role, colour, title, description}, for pillory {duration, reason}
 * @returns
 */
async function action(what, option) {
	var link = `https://api.chaster.app/api/extensions/sessions/${session}/action`;
	var body;
	switch (what) {
		case "addtime":
			body = { action: { name: "add_time", params: option } };
			break;
		case "remtime":
			body = { action: { name: "remove_time", params: option } };
			break;
		case "freeze":
			body = { action: { name: "freeze" } };
			break;
		case "unfreeze":
			body = { action: { name: "unfreeze" } };
			break;
		case "togglefreeze":
			body = { action: { name: "toggle_freeze" } };
			break;
		case "pillory":
			body = {
				action: {
					name: "pillory",
					params: { duration: option.duration, reason: option.reason },
				},
			};
			break;
		case "log":
			link = `https://api.chaster.app/api/extensions/sessions/${sessionID}/logs/custom`;
			body = {
				role: option.role,
				color: `#${option.colour}`,
				title: option.title,
				description: option.description,
			};
			break;
	}

	const response = await fetch(link, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});
	return response;
}

module.exports = {
	setToken,
	setSession,
	get,
	action,
};
