const { userModel, lockModel, lockHistoryModel } = require("../../schemas");

module.exports = {
	getUser,
	getLock,
	getLockHistory,
};

var userCache, lockCache, historyCache;
/**
 *
 * @param {String} id userID
 * @returns user
 */
async function getUser(id) {
	if (userCache.id == id) return userCache;
	userCache = await userModel.find({ id: id });
	return userCache;
}

/**
 *
 * @param {String} id lockID/UserID
 * @returns lock, 3=Multiple found, 1=No lock found
 */
async function getLock(id) {
	if (lockCache.id == id || lockCache.user.id == id) return lockCache;
	lockCache = await lockModel.find({ $or: [{ id: id }, { "user.id": id }] });
	if (lockCache.length == 1) return (lockCache = lockCache[0]);
	if (lockCache.length > 1) return 3;
	return 1;
}

/**
 *
 * @param {String} id Lock's ID
 * @returns lock's latest history
 */
async function getLockHistory(id) {
	if (historyCache.id == id) return historyCache;
	historyCache = await lockHistoryModel.findOne({ lockId: id });
	return (historyCache = historyCache[0]);
}
