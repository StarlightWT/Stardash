const secrets = require("../../secrets.json");

var token, session;
function setToken(tokenInput) {
	if (tokenInput == null || tokenInput == undefined) return;
	token = tokenInput;
	console.log(`[API Calls] Updated oauth token! ${token.slice(10, 15)}`);
}
function setSession(sessionInput) {
	if (sessionInput == null || sessionInput == undefined) return;
	session = sessionInput;
	console.log(`[API Calls] Updated session token! ${session.slice(5, 10)}`);
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
			body = {
				limit: 100,
			};
			method = "POST";
			break;
		case "extension":
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
					Authorization: `Bearer ${secrets.DEV_TKN}`,
				},
			});
			break;
		case "POST":
			if (link.includes("/api/extensions/sessions/search")) {
				response = await fetch(link, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${secrets.DEV_TKN}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(body),
				});
				break;
			}
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
 * @param {*} option Can be an object, for log {role, colour, title, description, icon}, for pillory {duration, reason}
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
			link = `https://api.chaster.app/api/extensions/sessions/${session}/logs/custom`;
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
			Authorization: `Bearer ${secrets.DEV_TKN}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});
	console.log(response.status);
	return response;
}
async function khaction(what, option) {
	var link = `https://api.chaster.app/`;
	var body;
	switch (what) {
		case "freeze":
			link += `locks/${option.id}/freeze`;
			body = { isFrozen: option.state };
			break;
		case "settings":
			link += `locks/${option.id}/settings`;
			body = {
				displayRemainingTime: option.time,
				hideTimeLogs: option.logs,
			};
	}

	const response = await fetch(link, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${secrets.DEV_TKN}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});
	console.log(response.status);
	return response;
}
module.exports = {
	setToken,
	setSession,
	get,
	action,
	khaction,
};
