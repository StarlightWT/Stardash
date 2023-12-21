const {
	userModel,
	lockModel,
	lockHistoryModel,
	activityModel,
} = require("../../schemas");

module.exports = {
	getUser,
	getLock,
	getLockHistory,
	getKHLocks,
	getCombination,
	activities,
};

const cacheLifespan = 60;

var userCache, lockCache, historyCache, khLocksCache;

setInterval(() => {
	userCache = null;
	lockCache = null;
	historyCache = null;
	khLocksCache = null;
}, cacheLifespan * 1000);

/**
 *
 * @param {String} id userID
 * @returns user
 */
async function getUser(id) {
	if (userCache && userCache.id == id) return userCache;
	userCache = await userModel.findOne({ id: id }).lean();
	return userCache;
}

/**
 *
 * @param {String} id lockID/UserID
 * @returns lock, 3=Multiple found, 1=No lock found
 */
async function getLock(id) {
	if (lockCache && (lockCache.id == id || lockCache?.user?.id == id))
		return lockCache;
	lockCache = await lockModel
		.find({ $or: [{ id: id }, { "user.id": id }] })
		.populate("modules")
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
	if (historyCache && historyCache.id == id) return historyCache;
	historyCache = await lockHistoryModel.findOne({ lockId: id }).lean();
	return (historyCache = historyCache[0]);
}

/**
 *
 * @param {String} id Keyholder's ID
 * @returns list of all KH's locks
 */
async function getKHLocks(id) {
	if (khLocksCache && khLocksCache.id == id) return khLocksCache.locks;
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
	if (lockCache && lockCache.id == id) return lockCache.combination;
	lockCache = await lockModel.find({ id: id }).lean();
	if (lockCache.length == 1) return (lockCache = lockCache[0]);
	if (lockCache.length > 1) return 3;
	return 1;
}

let skip = 0;
async function activities(amount, reset) {
	if (reset) skip = 0;
	const response = await activityModel.find().skip(skip).limit(amount).lean();
	skip += amount;
	return response;
}
