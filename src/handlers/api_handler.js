const call = require("./api_calls");
const secrets = require("../../secrets.json");
let profile, lock, lockHistory, starConnect, khLocks;

async function updateInfo(accessToken) {
	console.log(`[API Handler] Updating info...`);
	profile = await call.getProfile(accessToken);
	lock = await call.getLock(accessToken);
	if (!lock[0]?.user) return 1;
	lockHistory = await call.getLockHistory(accessToken, lock[0]._id);
	starConnect = await call.getExtension(secrets.DEV_TKN);
	khLocks = await call.getKHLocks(accessToken);
	return 1;
}

function getProfile() {
	return profile;
}

function getLock() {
	return lock;
}

function getLockHistory() {
	return lockHistory;
}

async function getStarConnect() {
	return starConnect;
}

async function getKHLocks() {
	return khLocks.locks;
}

module.exports = {
	updateInfo,
	getProfile,
	getLock,
	getLockHistory,
	getStarConnect,
	getKHLocks,
};
