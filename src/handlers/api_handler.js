const call = require("./api_calls");
const database = require("./db_handler");
let profileVar,
	dbprofileVar,
	lockVar,
	lockHistoryVar,
	starConnectVar,
	khLocksVar;

var loaded = false,
	updating = false;

async function updatePeriodicInfo() {
	console.log("Updating info");
	if (updating) return;
	updating = true;
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

	return 1;
}

//PeriodicInfo
async function updateInfo(accessToken, sessionToken) {
	if (accessToken) call.setToken(accessToken);
	if (sessionToken) call.setSession(sessionToken);

	return await updatePeriodicInfo();
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
		case "extension":
			return starConnectVar;
	}
}

async function action(what, option) {
	call.action(what, option);
}

module.exports = {
	get,
	action,
	updateInfo,
};
