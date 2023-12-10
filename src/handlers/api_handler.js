console.log(`[API Handler] Loaded!`);

const call = require("./api_calls");
const database = require("./db_handler");
let profileVar = null,
	dbprofileVar = null,
	lockVar,
	lockHistoryVar,
	starConnectVar,
	khLocksVar;

async function updatePeriodicInfo(loaded, network) {
	console.log("[API Handler]Updating info");
	if (network == "offline") return false;
	if (
		profileVar != undefined &&
		dbprofileVar != undefined &&
		profileVar?._id == dbprofileVar[0]?.id
	)
		loaded = true;
	profileVar = await call.get("profile"); //Call api and ask for the logged in profile's info
	dbprofileVar = await database.getUser(profileVar._id);
	if (profileVar && dbprofileVar && dbprofileVar.length == 0)
		database.createNewUser(
			profileVar.username,
			profileVar._id,
			profileVar.role
		);
	//Lockee
	lockVar = await call.get("lock"); //Get lock of the account from the api
	if (lockVar[0]?._id != undefined || lockVar[0]?._id != null) {
		//If there is no lock, don't try to load it's info, if there is load it.
		lockHistoryVar = await call.get("history", lockVar[0]._id);
		starConnectVar = await call.get("extension");
	}

	//Keyholder
	khLocksVar = await call.get("khlocks"); //Load all KH's locks
	return loaded;
}

//PeriodicInfo
async function updateInfo(accessToken, sessionToken, network) {
	if (accessToken) call.setToken(accessToken);
	if (sessionToken) call.setSession(sessionToken);
	if (accessToken == "clear") {
		profileVar = null;
		dbprofileVar = null;
	}
	if (network) return await updatePeriodicInfo(false, network);
	else return 0;
}

function get(what) {
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
	return await call.action(what, option);
}
async function khaction(what, option) {
	return await call.khaction(what, option);
}
module.exports = {
	get,
	action,
	khaction,
	updateInfo,
};
