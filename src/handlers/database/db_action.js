module.exports = {
	modifyTime,
	timerVisibility,
	timeLogVisibility,
	setFreeze,
	history,
	unlockLock,
	setKH,
};

const { lockModel, lockHistoryModel, requestModel } = require("../../schemas");
const { getLock, getLockHistory, getUser, clearCache } = require("./db_get");

/**
 *
 * @param {String} id Lock's ID
 * @param {Int} time Timestamp negative values remove time, positive add
 * @returns an updated lock schema
 */
async function modifyTime(id, time) {
	const lock = await getLock(id);
	let newLockTime = lock.endsAt;
	if (!time) return 1;
	lock.endsAt += time;
	return await lockModel.findOneAndUpdate(
		{ id: id },
		{ endsAt: newLockTime },
		{ new: true }
	);
}

/**
 *
 * @param {String} id Lock's ID
 * @param {Boolean} state New timer's visiblity (true = visible)
 * @returns updated lock record
 */
async function timerVisibility(id, state) {
	return await lockModel.findOneAndUpdate(
		{ id: id },
		{ $set: { "settings.timerVisible": state } },
		{ new: true }
	);
}

/**
 *
 * @param {String} id Lock's ID
 * @param {Boolean} state New lock's time log visiblity (true = visible)
 * @returns updated lock record
 */
async function timeLogVisibility(id, state) {
	return await lockModel.findOneAndUpdate(
		{ id: id },
		{ $set: { "settings.timeLogsVisible": state } },
		{ new: true }
	);
}

/**
 *
 * @param {String} id Lock's ID
 * @param {Boolean} state New lock's frozen state (true = frozen)
 * @returns updated lock record
 */
async function setFreeze(id, state) {
	if (state == "false") state = null;
	else state = Date.now();
	return await lockModel.findOneAndUpdate(
		{ id: id },
		{ $set: { frozenAt: state } }
	);
}

/**
 *
 * @param {String} id Lock's ID
 * @param {Object} log New log
 * @returns updated history record
 */
async function history(id, log) {
	const History = await getLockHistory(id);
	let newLogs = History.history;
	if (!log) return 4;
	newLogs.append(log);
	return await lockHistoryModel.findOneAndUpdate(
		{ id: id },
		{ $set: { history: newLogs } },
		{ new: true }
	);
}

async function unlockLock(id) {
	const lock = await getLock(id);
	if (!lock) return 1;
	const user = await getUser(lock.user.id);

	const lockedTime = Date.now() - lock.createdAt;

	user.stats.totalLockedTime = user.stats.totalLockedTime + lockedTime;
	if (user.stats.longestLockedTime < lockedTime)
		user.stats.longestLockedTime = lockedTime;

	await lockModel.findOneAndDelete({ id: id });
	await lockHistoryModel.findOneAndDelete({ lockID: id });
	clearCache();
	return 0;
}

async function setKH(token, khID) {
	const search = await requestModel.findOne({ token: token });
	if (!search) return 1; //Not found
	const lockSearch = await lockModel.findOne({ id: search.lockID });

	if (lockSearch.user.id === khID) return 2; //Can't be your own KH
	if (lockSearch.khId != null) return 3; //Already Taken
	const result = await lockModel.findOneAndUpdate(
		{ id: search.lockID },
		{
			$set: {
				khId: khID,
			},
		},
		{ new: true }
	);

	await requestModel.findOneAndDelete({ lockID: search.lockID });

	return result;
}
