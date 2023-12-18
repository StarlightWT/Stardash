const { userModel, lockModel, lockHistoryModel } = require("../../schemas");

module.exports = {
	getUser,
	getLock,
	getLockHistory,
	getKHLocks,
	getCombination,
};

var userCache, lockCache, historyCache, khLocksCache;
/**
 *
 * @param {String} id userID
 * @returns user
 */
async function getUser(id) {
	if (userCache.id == id) return userCache;
	userCache = await userModel.findOne({ id: id }).lean();
	return userCache;
}

/**
 *
 * @param {String} id lockID/UserID
 * @returns lock, 3=Multiple found, 1=No lock found
 */
async function getLock(id) {
	if (lockCache.id == id || lockCache.user.id == id) return lockCache;
	lockCache = await lockModel
		.find({ $or: [{ id: id }, { "user.id": id }] })
		.lean();
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
	historyCache = await lockHistoryModel.findOne({ lockId: id }).lean();
	return (historyCache = historyCache[0]);
}

/**
 *
 * @param {String} id Keyholder's ID
 * @returns list of all KH's locks
 */
async function getKHLocks(id) {
	if (khLocksCache.id == id) return khLocksCache.locks;
	khLocksCache.id = id;
	khLocksCache.locks = await lockModel.find({ khId: id }).lean();
	return khLocksCache.locks;
}

/**
 *
 * @param {String} id Lock's ID
 * @returns lock's combination, 1=Lock not found, 3=Found many locks
 */
async function getCombination(id) {
	if (lockCache.id == id) return lockCache.combination;
	lockCache = await lockModel.find({ id: id }).lean();
	if (lockCache.length == 1) return (lockCache = lockCache[0]);
	if (lockCache.length > 1) return 3;
	return 1;
}
