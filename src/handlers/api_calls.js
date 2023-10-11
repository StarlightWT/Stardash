console.log("Loaded api calling!");

async function getProfile(token) {
	const response = await fetch("https://api.chaster.app/auth/profile", {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	const myJson = await response.json();
	return myJson;
}

async function getLock(token) {
	const response = await fetch("https://api.chaster.app/locks", {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	const myJson = await response.json();
	return myJson;
}

async function getLockHistory(token, lockID) {
	const response = await fetch(
		`https://api.chaster.app/locks/${lockID}/history`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);
	const myJson = await response.json();
	return myJson;
}

async function getExtension(token) {
	const response = await fetch(
		"https://api.chaster.app/api/extensions/sessions/search",
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				status: "locked",
				extensionSlug: "stardash-connect",
				limit: 15,
			}),
		}
	);
	const myJson = await response.json();
	return myJson;
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
	getProfile,
	getLock,
	getLockHistory,
	getExtension,
	addTime,
	remTime,
	freeze,
	unfreeze,
	toggleFreeze,
	pillory,
	log,
};
