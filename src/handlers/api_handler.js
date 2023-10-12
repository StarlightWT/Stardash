const call = require("./api_calls");
const secrets = require("../../secrets.json");
const database = require("./db_handler");
let profileVar,
	dbprofileVar,
	lockVar,
	lockHistoryVar,
	starConnectVar,
	khLocksVar,
	version,
	dbToken;

//Session info
async function updateSessionInfo(accessToken, sessionToken) {
	call.setToken(accessToken); //Set access token to api_calls, no longer need to send it with every call;
	call.setSession(sessionToken);
}

//PeriodicInfo
async function updateInfo(accessToken, sessionToken) {
	if (accessToken && sessionToken) updateSessionInfo(accessToken, sessionToken);
	profileVar = await call.get("profile"); //Call api and ask for the logged in profile's info
	dbprofileVar = await database.getUser(profileVar._id);
	//Lockee
	lockVar = await call.get("lock"); //Get lock of the account from the api
	if (lockVar[0]?._id != undefined || lockVar[0]?._id != null) {
		//If there is no lock, don't try to load it's info, if there is load it.
		lockHistoryVar = await call.get("history", lockVar[0]._id);
		starConnectVar = await call.get("extension");
	}

	//Keyholder
	khLocksVar = await call.get("khlocks"); //Load all KH's locks
	if (dbprofileVar && profileVar) return 1;
	return 0;
}

async function get(what) {
	switch (what) {
		case "lock":
			return lockVar;
		case "profile":
			return profileVar;
		case "dbprofile":
			return dbprofileVar;
		case "khlocks":
			return khLocksVar.locks;
		case "history":
			return lockHistoryVar;
	}
}

module.exports = {
	get,
	updateInfo,
	updateSessionInfo,
};
